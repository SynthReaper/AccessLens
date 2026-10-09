export type NoticeCategory =
  | 'event'
  | 'academic_deadline'
  | 'administrative_notice'
  | 'recruitment_audition'
  | 'facility_announcement'
  | 'general';

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
}

export interface AccessLensAnalysis {
  category: NoticeCategory;
  headlineSummary: string;
  keyTakeaways: string[];
  eventDetails: EventDetails;
  actionItems: ActionItem[];
  uncertainties: UncertaintyNote[];
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
  subtitle: string;
  thumbnailPath: string;
  description: string;
  category: NoticeCategory;
  cachedResult: AccessLensAnalysis;
}
