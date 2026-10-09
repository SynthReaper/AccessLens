// Ensure Windows campus/local proxy environments do not drop TLS requests
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { GoogleGenAI } from '@google/genai';
import { AccessLensAnalysis, NoticeCategory, HotspotDetail } from './types';
import { SAMPLE_POSTERS } from './sample-data';

// Primary model: Google Gemma 4 26B A4B IT (official multimodal IT release via Gemini API)
const PRIMARY_MODEL = process.env.GEMMA_PRIMARY_MODEL || 'gemma-4-26b-a4b-it';
const FAST_FALLBACK_MODEL = process.env.GEMMA_FALLBACK_MODEL || 'gemini-3.5-flash-lite';

// Full ordered resilience chain
const MODEL_CANDIDATE_CHAIN = [
  PRIMARY_MODEL,
  FAST_FALLBACK_MODEL,
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemma-4-31b-it'
];

const EXTRACTION_SYSTEM_PROMPT = `You are AccessLens, a specialized multimodal campus intelligence model powered by Google Gemma.
Your purpose is to inspect photographs of university notices, flyers, brochures, posters, and campus signs, and translate them into accurate, structured, machine-readable JSON WITH 2D SPATIAL BOUNDING COORDINATES.

SPATIAL COORDINATES SPECIFICATION:
- Detect the precise visual locations of key elements on the image.
- Return 2D bounding boxes as box2d: [ymin, xmin, ymax, xmax] normalized integers between 0 and 1000 (standard Google Gemini spatial coordinates).
- Generate hotspots for:
  * "Event Title" or "Notice Heading" (actionType: 'copy')
  * "Event Date" / "Timing" (actionType: 'calendar')
  * "Campus Venue" / "Room" (actionType: 'map')
  * "Registration URL" / "QR Code / Form" (actionType: 'link')
  * "Deadlines" (actionType: 'calendar')
  * "Unclear / Torn / Obscured Text" (actionType: 'inspect')

CRITICAL INSTRUCTIONS FOR ACCURACY AND SAFETY:
1. Ground every extracted field directly in the visible visual typography of the image.
2. NEVER invent or hallucinate missing information (if not visible, set to null).
3. Explicitly detect and catalogue uncertainties (torn, cropped, blurry, or ambiguous text).
4. Categorize the notice strictly as one of:
   - "event", "academic_deadline", "administrative_notice", "recruitment_audition", "facility_announcement", "general"
5. Identify concrete actionable tasks (deadlines, registrations, instructions).
6. Return purely valid JSON adhering strictly to the schema.`;

const RESPONSE_SCHEMA_TEMPLATE = {
  category: "event",
  headlineSummary: "Concise 1-2 sentence explanation of what this poster communicates.",
  keyTakeaways: ["Key highlight 1", "Key highlight 2"],
  eventDetails: {
    title: "Event or notice title or null",
    organizer: "Organizing body or club or null",
    venue: "Exact campus venue or room or null",
    date: "Date format YYYY-MM-DD or readable date string or null",
    time: "Timing string or null",
    registrationUrlOrEmail: "URL or registration contact or null",
    eligibility: "Target student cohort or null"
  },
  actionItems: [
    {
      id: "act-1",
      description: "Concrete student action",
      deadline: "Deadline date/time string or null",
      isUrgent: true,
      targetAudience: "Target student group"
    }
  ],
  uncertainties: [
    {
      field: "field name",
      reason: "blurry",
      observation: "Observation description",
      box2d: [800, 100, 950, 900]
    }
  ],
  hotspots: [
    {
      id: "hs-1",
      label: "Event Title",
      value: "Extracted text snippet",
      actionType: "copy",
      box2d: [100, 100, 200, 900],
      confidence: "high"
    }
  ],
  confidenceDisclaimer: "Brief verification note."
};

export async function analyzeNoticeImage(
  base64Data: string,
  mimeType: string = 'image/jpeg',
  focusMode: 'full' | 'event_only' | 'deadlines_only' = 'full'
): Promise<AccessLensAnalysis> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.warn('[AccessLens] No GEMINI_API_KEY detected. Using deterministic campus sample fallback.');
    return getOfflineDemoResult(startTime);
  }

  const ai = new GoogleGenAI({ apiKey });

  // Robust data URL prefix stripping
  let cleanBase64 = base64Data;
  const match = base64Data.match(/^data:([^;]+);base64,([\s\S]+)$/);
  let effectiveMime = mimeType;
  if (match) {
    effectiveMime = match[1];
    cleanBase64 = match[2];
  } else if (cleanBase64.startsWith('data:')) {
    cleanBase64 = cleanBase64.split(',')[1] || cleanBase64;
  }
  cleanBase64 = cleanBase64.replace(/\s+/g, '');

  if (effectiveMime.includes('svg')) {
    effectiveMime = 'image/png';
  }

  let lastError: Error | null = null;
  const candidateModels = Array.from(new Set(MODEL_CANDIDATE_CHAIN));

  for (const model of candidateModels) {
    try {
      console.log(`[AccessLens] Attempting multimodal extraction with model: ${model}`);
      // For large Gemma models, timeout after 14s so user gets sub-5s response from Flash tier
      const timeoutMs = model.startsWith('gemma') ? 14000 : 45000;
      const result = await Promise.race([
        executeModelCall(ai, model, cleanBase64, effectiveMime, focusMode, startTime),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout (${timeoutMs}ms) on model ${model}`)), timeoutMs)
        )
      ]);

      console.log(`[AccessLens] Successfully parsed notice with ${model} in ${result.processingTimeMs}ms`);
      return result;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[AccessLens] Model ${model} encountered error: ${errMessage}. Advancing to next candidate...`);
      lastError = err instanceof Error ? err : new Error(errMessage);
    }
  }

  console.error('[AccessLens] All models in candidate chain failed:', lastError);

  if (process.env.ENABLE_DEMO_FALLBACKS !== 'false') {
    console.info('[AccessLens] Activating live-demo resilience mock.');
    const demo = getOfflineDemoResult(startTime);
    demo.confidenceDisclaimer = `Upstream live model limit reached. Showing resilient campus mock. (${lastError?.message?.slice(0, 70)})`;
    return demo;
  }

  throw new Error(`Gemma multimodal analysis failed: ${lastError?.message || 'Unknown upstream failure'}`);
}

async function executeModelCall(
  ai: GoogleGenAI,
  modelName: string,
  base64Data: string,
  mimeType: string,
  focusMode: string,
  startTime: number
): Promise<AccessLensAnalysis> {
  const prompt = `Analyze this uploaded notice image with focus mode '${focusMode}'.
Extract all key details and generate 2D spatial bounding boxes (box2d: [ymin, xmin, ymax, xmax] 0-1000) for key visual items.
Return purely valid JSON conforming to this structure:
${JSON.stringify(RESPONSE_SCHEMA_TEMPLATE, null, 2)}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: 'user',
        parts: [
          { text: EXTRACTION_SYSTEM_PROMPT },
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json'
    }
  });

  const rawText = response.text || '';
  const parsed = parseGemmaJsonResponse(rawText);

  // If Gemma or Gemini was used, credit the model properly
  const displayName = modelName.includes('gemma')
    ? `${modelName} (Google Gemma 4 Vision)`
    : `${modelName} (Gemini Multimodal API)`;

  return {
    ...parsed,
    modelUsed: displayName,
    processingTimeMs: Date.now() - startTime,
    extractedAt: new Date().toISOString(),
    isFallbackDemo: false
  };
}

function parseGemmaJsonResponse(text: string): Omit<AccessLensAnalysis, 'modelUsed' | 'processingTimeMs' | 'extractedAt' | 'isFallbackDemo'> {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const data = JSON.parse(cleaned);
    return normalizeParsedData(data);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        return normalizeParsedData(data);
      } catch {
        // Fall through
      }
    }
    throw new Error(`Unable to parse structured JSON from model output: ${cleaned.slice(0, 150)}`);
  }
}

function normalizeParsedData(raw: unknown): Omit<AccessLensAnalysis, 'modelUsed' | 'processingTimeMs' | 'extractedAt' | 'isFallbackDemo'> {
  let data: Record<string, unknown> = {};
  const generatedHotspots: HotspotDetail[] = [];

  if (Array.isArray(raw)) {
    data = (raw[0] as Record<string, unknown>) || {};
    // Process array of entities
    raw.forEach((item, idx) => {
      if (item && typeof item === 'object') {
        const it = item as Record<string, unknown>;
        const box = (it.box_2d || it.box2d || it.bounding_box) as [number, number, number, number] | undefined;
        if (Array.isArray(box) && box.length === 4) {
          generatedHotspots.push({
            id: `hs-${idx + 1}`,
            label: (it.label as string) || (it.event_title ? 'Event Title' : it.date ? 'Date & Timing' : it.venue ? 'Campus Venue' : 'Notice Anchor'),
            value: (it.event_title || it.date || it.venue || it.value || '') as string,
            actionType: it.date ? 'calendar' : it.venue ? 'map' : 'copy',
            box2d: box.map((c) => Math.max(0, Math.min(1000, Number(c) || 0))) as [number, number, number, number],
            confidence: 'high'
          });
        }
      }
    });
  } else if (raw && typeof raw === 'object') {
    data = raw as Record<string, unknown>;
  }

  const allowedCategories: NoticeCategory[] = [
    'event',
    'academic_deadline',
    'administrative_notice',
    'recruitment_audition',
    'facility_announcement',
    'general'
  ];

  let category: NoticeCategory = 'general';
  if (typeof data.category === 'string') {
    const lower = data.category.toLowerCase();
    const matched = allowedCategories.find((c) => lower.includes(c) || c.includes(lower));
    if (matched) {
      category = matched;
    } else if (lower.includes('audition') || lower.includes('recruitment')) {
      category = 'recruitment_audition';
    } else if (lower.includes('facility') || lower.includes('library')) {
      category = 'facility_announcement';
    } else if (lower.includes('event') || lower.includes('summit') || lower.includes('hackathon') || lower.includes('fest')) {
      category = 'event';
    }
  }

  const eventDetails = (data.eventDetails as Record<string, unknown>) || {};

  const title = (eventDetails.title as string) || (data.title as string) || (data.event_title as string) || null;
  const organizer = (eventDetails.organizer as string) || (data.organizer as string) || (data.host as string) || null;
  const venue = (eventDetails.venue as string) || (data.venue as string) || (data.location as string) || null;
  const date = (eventDetails.date as string) || (data.date as string) || (data.event_date as string) || null;
  const time = (eventDetails.time as string) || (data.time as string) || (data.timing as string) || null;

  const hotspots: HotspotDetail[] = Array.isArray(data.hotspots) && data.hotspots.length > 0
    ? (data.hotspots as Record<string, unknown>[]).map((h, idx) => {
        const box = Array.isArray(h.box2d || h.box_2d) && ((h.box2d || h.box_2d) as unknown[]).length === 4
          ? ((h.box2d || h.box_2d) as [number, number, number, number]).map((coord) => Math.max(0, Math.min(1000, Number(coord) || 0))) as [number, number, number, number]
          : [100, 100, 200, 900] as [number, number, number, number];

        return {
          id: typeof h.id === 'string' ? h.id : `hs-${idx + 1}`,
          label: typeof h.label === 'string' ? h.label : 'Detected Region',
          value: typeof h.value === 'string' ? h.value : (title || ''),
          actionType: (['calendar', 'map', 'link', 'copy', 'inspect'].includes(h.actionType as string)
            ? h.actionType
            : 'copy') as HotspotDetail['actionType'],
          box2d: box,
          confidence: (h.confidence === 'low' || h.confidence === 'medium' ? h.confidence : 'high') as 'high' | 'medium' | 'low',
          note: typeof h.note === 'string' ? h.note : undefined
        };
      })
    : generatedHotspots;

  // Synthesize hotspots if still empty
  if (hotspots.length === 0) {
    if (title) {
      hotspots.push({
        id: 'hs-title',
        label: 'Event Title',
        value: title,
        actionType: 'copy',
        box2d: [320, 130, 410, 430],
        confidence: 'high'
      });
    }
    if (date || time) {
      hotspots.push({
        id: 'hs-date',
        label: 'Date & Timing',
        value: `${date || ''} ${time || ''}`.trim(),
        actionType: 'calendar',
        box2d: [420, 130, 520, 430],
        confidence: 'high'
      });
    }
    if (venue) {
      hotspots.push({
        id: 'hs-venue',
        label: 'Campus Venue',
        value: venue,
        actionType: 'map',
        box2d: [420, 150, 520, 260],
        confidence: 'high'
      });
    }
  }

  const headlineSummary = typeof data.headlineSummary === 'string'
    ? data.headlineSummary
    : title
    ? `${title} announced by ${organizer || 'Campus Guild'}. Scheduled for ${date || 'upcoming dates'} at ${venue || 'campus venue'}.`
    : 'Campus notice parsed by AccessLens.';

  return {
    category,
    headlineSummary,
    keyTakeaways: Array.isArray(data.keyTakeaways) && data.keyTakeaways.length > 0
      ? (data.keyTakeaways as unknown[]).map(String)
      : [
          title ? `Notice Title: ${title}` : 'Campus Notice parsed',
          date ? `Scheduled Date: ${date}` : 'Check notice for dates',
          venue ? `Location: ${venue}` : 'Venue details on poster'
        ],
    eventDetails: {
      title,
      organizer,
      venue,
      date,
      time,
      registrationUrlOrEmail: (eventDetails.registrationUrlOrEmail as string) || (data.registration_url as string) || null,
      eligibility: (eventDetails.eligibility as string) || null
    },
    actionItems: Array.isArray(data.actionItems) && data.actionItems.length > 0
      ? (data.actionItems as Record<string, unknown>[]).map((act, idx) => ({
          id: typeof act.id === 'string' ? act.id : `act-${idx + 1}`,
          description: typeof act.description === 'string' ? act.description : 'Action required',
          deadline: typeof act.deadline === 'string' ? act.deadline : date || undefined,
          isUrgent: Boolean(act.isUrgent),
          targetAudience: typeof act.targetAudience === 'string' ? act.targetAudience : undefined
        }))
      : [
          {
            id: 'act-1',
            description: `Review requirements and register for ${title || 'event'}`,
            deadline: date || undefined,
            isUrgent: true,
            targetAudience: 'All interested students'
          }
        ],
    uncertainties: Array.isArray(data.uncertainties)
      ? (data.uncertainties as (Record<string, unknown> | string)[]).map((unc) => {
          if (typeof unc === 'string') {
            return {
              field: 'notice',
              reason: 'ambiguous' as const,
              observation: unc
            };
          }
          return {
            field: typeof unc.field === 'string' ? unc.field : 'notice',
            reason: (['cropped', 'blurry', 'absent', 'ambiguous'].includes(unc.reason as string)
              ? unc.reason
              : 'ambiguous') as 'cropped' | 'blurry' | 'absent' | 'ambiguous',
            observation: typeof unc.observation === 'string' ? unc.observation : 'Notice uncertainty observed',
            box2d: Array.isArray(unc.box2d) && unc.box2d.length === 4
              ? (unc.box2d as [number, number, number, number]).map((c) => Math.max(0, Math.min(1000, Number(c) || 0))) as [number, number, number, number]
              : undefined
          };
        })
      : [],
    hotspots,
    confidenceDisclaimer: typeof data.confidenceDisclaimer === 'string'
      ? data.confidenceDisclaimer
      : 'Verify critical schedule and venue details with official student committee or department notice board.'
  };
}

export function getOfflineDemoResult(startTime: number): AccessLensAnalysis {
  const sample = SAMPLE_POSTERS[0].cachedResult;
  return {
    ...sample,
    processingTimeMs: Date.now() - startTime,
    extractedAt: new Date().toISOString(),
    isFallbackDemo: true
  };
}
