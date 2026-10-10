export type NoticeCategory =
  | 'event'
  | 'academic_deadline'
  | 'administrative_notice'
  | 'recruitment_audition'
  | 'facility_announcement'
  | 'general';

export type HotspotActionType = 'calendar' | 'map' | 'link' | 'copy' | 'inspect';

/**
 * Normalized 2D coordinates [ymin, xmin, ymax, xmax] scaled 0 to 1000
 * as specified in Google Gemini / Gemma spatial understanding standards.
 */
export type Box2D = [number, number, number, number];

export interface HotspotDetail {
  id: string;
  label: string; // e.g. "Event Date", "Venue Location", "Registration Link", "Critical Deadline", "Torn Text"
  value: string; // Extracted raw text or parsed value
  actionType: HotspotActionType;
  box2d: Box2D; // [ymin, xmin, ymax, xmax] 0-1000
  confidence?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  deadline?: string;
  isUrgent: boolean;
  targetAudience?: string;
}

export interface EventDetails {
  title: string | null;
  organizer: string | null;
  venue: string | null;
  date: string | null;
  time: string | null;
  registrationUrlOrEmail: string | null;
  eligibility: string | null;
}

export interface UncertaintyNote {
  field: string;
  reason: 'blurry' | 'cropped' | 'absent' | 'ambiguous';
  observation: string;
  box2d?: Box2D;
}

export interface AccessLensAnalysis {
  category: NoticeCategory;
  headlineSummary: string;
  keyTakeaways: string[];
  eventDetails: EventDetails;
  actionItems: ActionItem[];
  uncertainties: UncertaintyNote[];
  hotspots: HotspotDetail[];
  confidenceDisclaimer: string;
  modelUsed: string;
  processingTimeMs: number;
  extractedAt: string;
  isFallbackDemo?: boolean;
}

export interface AnalysisRequest {
  imageBase64: string;
  mimeType: string;
  focusMode?: 'full' | 'event_only' | 'deadlines_only';
}

export interface SamplePoster {
  id: string;
  title: string;
  shortLabel: string;
  subtitle: string;
  thumbnailPath: string;
  description: string;
  category: NoticeCategory;
  cachedResult: AccessLensAnalysis;
}
