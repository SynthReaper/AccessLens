import { GoogleGenAI } from '@google/genai';
import { AccessLensAnalysis, NoticeCategory, HotspotDetail } from './types';
import { SAMPLE_POSTERS } from './sample-data';

const PRIMARY_MODEL = process.env.GEMMA_PRIMARY_MODEL || 'gemma-4-31b-it';
const FALLBACK_MODEL = process.env.GEMMA_FALLBACK_MODEL || 'gemma-3-27b-it';

const EXTRACTION_SYSTEM_PROMPT = `
You are AccessLens, a specialized multimodal campus intelligence model powered by Google Gemma.
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
2. NEVER invent or hallucinate missing information (e.g. if an event poster does not display an exact room number, do not guess one; set it to null).
3. Explicitly detect and catalogue uncertainties: if parts of the text are torn, blurred, cropped, ambiguous, or in low lighting, add an entry to the 'uncertainties' array, and attach its [ymin, xmin, ymax, xmax] coordinates if visible.
4. Categorize the notice strictly as one of:
   - "event"
   - "academic_deadline"
   - "administrative_notice"
   - "recruitment_audition"
   - "facility_announcement"
   - "general"
5. Identify concrete actionable tasks (deadlines, what students must bring or fill out).

Respond ONLY with valid JSON conforming strictly to the requested schema. Do NOT wrap with markdown backticks or extra conversation.
`;

const RESPONSE_SCHEMA_EXAMPLE = {
  category: "event",
  headlineSummary: "Clear, concise 1-2 sentence plain-language explanation of what this poster communicates.",
  keyTakeaways: ["Key bullet 1", "Key bullet 2", "Key bullet 3"],
  eventDetails: {
    title: "Event or Notice Title or null",
    organizer: "Club, Department, or University Body or null",
    venue: "Exact Room / Block / Building or null",
    date: "Date format YYYY-MM-DD or standard readable text or null",
    time: "Start time and end time or null",
    registrationUrlOrEmail: "URL or contact email or null",
    eligibility: "Target student cohort or null"
  },
  actionItems: [
    {
      id: "act-1",
      description: "Specific task the student must do",
      deadline: "Deadline date/time string or null",
      isUrgent: true,
      targetAudience: "Target student group"
    }
  ],
  uncertainties: [
    {
      field: "string",
      reason: "blurry", // or cropped, absent, ambiguous
      observation: "Specific visual description of what was unreadable",
      box2d: [800, 100, 950, 900]
    }
  ],
  hotspots: [
    {
      id: "hs-1",
      label: "Event Date",
      value: "October 24-25, 2026",
      actionType: "calendar",
      box2d: [360, 80, 490, 480],
      confidence: "high"
    }
  ],
  confidenceDisclaimer: "Brief note indicating user should verify official notice for critical deadlines."
};

export async function analyzeNoticeImage(
  base64Data: string,
  mimeType: string = 'image/jpeg',
  focusMode: 'full' | 'event_only' | 'deadlines_only' = 'full'
): Promise<AccessLensAnalysis> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  // Check if API key is absent or offline fallback is needed
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.warn('[AccessLens] No GEMINI_API_KEY detected. Using deterministic campus sample fallback with spatial hotspots.');
    return getOfflineDemoResult(startTime);
  }

  const ai = new GoogleGenAI({ apiKey });

  // Clean base64 string
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

  // 1. Try Primary Model: Gemma 4 (gemma-4-31b-it)
  try {
    const result = await executeModelCall(ai, PRIMARY_MODEL, cleanBase64, mimeType, focusMode, startTime);
    return result;
  } catch (primaryErr: unknown) {
    const errorMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    console.warn(`[AccessLens] Primary model ${PRIMARY_MODEL} failed: ${errorMsg}. Attempting fallback to ${FALLBACK_MODEL}...`);

    // 2. Fallback to Gemma 3 multimodal
    try {
      const fallbackResult = await executeModelCall(ai, FALLBACK_MODEL, cleanBase64, mimeType, focusMode, startTime);
      return fallbackResult;
    } catch (fallbackErr: unknown) {
      console.error(`[AccessLens] Both Gemma 4 and fallback failed:`, fallbackErr);
      
      // If live demo fail-safe is enabled, return sample fixture so the presentation never crashes
      if (process.env.ENABLE_DEMO_FALLBACKS !== 'false') {
        console.info('[AccessLens] Activating live-demo resilience fallback.');
        const demo = getOfflineDemoResult(startTime);
        demo.confidenceDisclaimer = `Live API encountered an upstream rate/network limit. Showing resilient verified campus mock. (${errorMsg.slice(0, 80)})`;
        return demo;
      }

      throw new Error(`Gemma multimodal analysis failed: ${errorMsg}`);
    }
  }
}

async function executeModelCall(
  ai: GoogleGenAI,
  modelName: string,
  base64Data: string,
  mimeType: string,
  focusMode: string,
  startTime: number
): Promise<AccessLensAnalysis> {
  const prompt = `Analyze this campus notice image with focus mode '${focusMode}'. 
Provide structured extraction and 2D bounding boxes (box2d: [ymin, xmin, ymax, xmax] 0-1000) conforming to this exact schema specification:
${JSON.stringify(RESPONSE_SCHEMA_EXAMPLE, null, 2)}`;

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
    ]
  });

  const rawText = response.text || '';
  const parsed = parseGemmaJsonResponse(rawText);

  return {
    ...parsed,
    modelUsed: `${modelName} (via Google GenAI SDK)`,
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
    throw new Error(`Unable to parse structured JSON from Gemma model output: ${cleaned.slice(0, 150)}`);
  }
}

function normalizeParsedData(data: Record<string, unknown>): Omit<AccessLensAnalysis, 'modelUsed' | 'processingTimeMs' | 'extractedAt' | 'isFallbackDemo'> {
  const allowedCategories: NoticeCategory[] = [
    'event',
    'academic_deadline',
    'administrative_notice',
    'recruitment_audition',
    'facility_announcement',
    'general'
  ];

  const category = (allowedCategories.includes(data.category as NoticeCategory)
    ? data.category
    : 'general') as NoticeCategory;

  const eventDetails = (data.eventDetails as Record<string, unknown>) || {};

  const hotspots: HotspotDetail[] = Array.isArray(data.hotspots)
    ? (data.hotspots as Record<string, unknown>[]).map((h, idx) => {
        const box = Array.isArray(h.box2d) && h.box2d.length === 4
          ? (h.box2d as [number, number, number, number]).map((coord) => Math.max(0, Math.min(1000, Number(coord) || 0))) as [number, number, number, number]
          : [100, 100, 200, 900] as [number, number, number, number];

        return {
          id: typeof h.id === 'string' ? h.id : `hs-${idx + 1}`,
          label: typeof h.label === 'string' ? h.label : 'Detected Region',
          value: typeof h.value === 'string' ? h.value : '',
          actionType: (['calendar', 'map', 'link', 'copy', 'inspect'].includes(h.actionType as string)
            ? h.actionType
            : 'copy') as HotspotDetail['actionType'],
          box2d: box,
          confidence: (h.confidence === 'low' || h.confidence === 'medium' ? h.confidence : 'high') as 'high' | 'medium' | 'low',
          note: typeof h.note === 'string' ? h.note : undefined
        };
      })
    : [];

  return {
    category,
    headlineSummary: typeof data.headlineSummary === 'string' ? data.headlineSummary : 'Campus notice parsed by AccessLens.',
    keyTakeaways: Array.isArray(data.keyTakeaways) ? (data.keyTakeaways as string[]) : [],
    eventDetails: {
      title: (eventDetails.title as string) || null,
      organizer: (eventDetails.organizer as string) || null,
      venue: (eventDetails.venue as string) || null,
      date: (eventDetails.date as string) || null,
      time: (eventDetails.time as string) || null,
      registrationUrlOrEmail: (eventDetails.registrationUrlOrEmail as string) || null,
      eligibility: (eventDetails.eligibility as string) || null
    },
    actionItems: Array.isArray(data.actionItems)
      ? (data.actionItems as AccessLensAnalysis['actionItems']).map((act, idx) => ({
          id: act.id || `act-${idx + 1}`,
          description: act.description || 'Action required',
          deadline: act.deadline || undefined,
          isUrgent: Boolean(act.isUrgent),
          targetAudience: act.targetAudience
        }))
      : [],
    uncertainties: Array.isArray(data.uncertainties)
      ? (data.uncertainties as AccessLensAnalysis['uncertainties']).map((unc) => ({
          ...unc,
          box2d: Array.isArray(unc.box2d) && unc.box2d.length === 4
            ? (unc.box2d as [number, number, number, number]).map((c) => Math.max(0, Math.min(1000, Number(c) || 0))) as [number, number, number, number]
            : undefined
        }))
      : [],
    hotspots,
    confidenceDisclaimer: typeof data.confidenceDisclaimer === 'string'
      ? data.confidenceDisclaimer
      : 'Verify with the physical notice or campus authority for critical academic deadlines.'
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
