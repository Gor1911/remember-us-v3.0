// ─── API Envelope ─────────────────────────────────────────────────────────────

export interface ApiOk<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code: string;
}

export type ApiResponse<T> = ApiOk<T> | ApiError;

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'curator' | 'guest';

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
  terms_accepted_at?: string | null;
  terms_version?: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

// ─── Memorial Page ─────────────────────────────────────────────────────────────

export type PageState = 'draft' | 'moderation' | 'active';
export type PageType  = 'civilian' | 'military';

export interface PageOwner {
  id: string;
  /** Present only in authenticated list responses. */
  email?: string;
  display_name: string;
  role: UserRole;
}

export interface TimelineEntry {
  id: string;
  year: number;
  title: string;
  description: string;
  order: number;
}

export interface MilitaryAward {
  id: string;
  name: string;
  description: string;
  awarded_date: string | null;
  model_3d_url: string | null;
  order: number;
}

export interface MediaFile {
  id: string;
  media_type: 'portrait' | 'photo' | 'video' | 'document' | 'model_3d';
  file_url: string;
  original_filename: string;
  is_primary_portrait: boolean;
  caption: string;
  alt_text: string;
  order: number;
}

export interface QrCode {
  id: string;
  qr_url: string;
  scan_count: number;
  last_scanned_at: string | null;
}

export interface MemorialPageListItem {
  id: string;
  slug: string;
  page_type: PageType;
  state: PageState;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  death_date: string | null;
  owner: PageOwner;
  primary_portrait: string | null;
  /** Admin rejection note — present only if the API exposes it. */
  moderation_note?: string;
  created_at: string;
}

export interface MemorialPageDetail extends MemorialPageListItem {
  full_name: string;
  biography: string;
  military_rank: string | null;
  military_branch: string | null;
  service_start: string | null;
  service_end: string | null;
  portrait_animated_url: string | null;
  portrait_animation_status: 'pending' | 'processing' | 'done' | 'failed';
  approved_at: string | null;
  memorial_url: string;
  timeline_entries: TimelineEntry[];
  military_awards: MilitaryAward[];
  media_files: MediaFile[];
  qr_code: QrCode | null;
  updated_at: string;
}

// ─── Request bodies ────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
  accept_terms: boolean;
}

export interface CreatePagePayload {
  page_type: PageType;
  first_name: string;
  last_name: string;
  biography?: string;
  birth_date?: string;
  death_date?: string;
  military_rank?: string;
  military_branch?: string;
  service_start?: string;
  service_end?: string;
}

export type UpdatePagePayload = Partial<Omit<CreatePagePayload, 'page_type'>>;
