import type { MemorialPageDetail, PageType } from '@/app/lib/types';

/** Step labels for the create flow; the edit flow stops at "Preview". */
export const STEPS = ['About them', 'Story', 'Life', 'Photos', 'Preview', 'Plan'] as const;
export const EDIT_STEPS = STEPS.slice(0, 5);
export type Step = 0 | 1 | 2 | 3 | 4 | 5;
export const PREVIEW_STEP: Step = 4;
export const PLAN_STEP: Step = 5;

export interface TimelineRow {
  /** Stable React key; never sent to the API. */
  key: string;
  year: string;
  title: string;
  description: string;
}

export interface AwardRow {
  key: string;
  name: string;
  /** yyyy-mm-dd or "". */
  date: string;
  description: string;
}

export interface FormState {
  page_type: PageType;
  first_name: string;
  last_name: string;
  birth_date: string;
  death_date: string;
  biography: string;
  military_rank: string;
  military_branch: string;
  service_start: string;
  service_end: string;
  timeline: TimelineRow[];
  awards: AwardRow[];
}

export const EMPTY_FORM: FormState = {
  page_type: 'civilian',
  first_name: '',
  last_name: '',
  birth_date: '',
  death_date: '',
  biography: '',
  military_rank: '',
  military_branch: '',
  service_start: '',
  service_end: '',
  timeline: [],
  awards: [],
};

/**
 * A photo in the form: either a newly picked file (`file` + object-URL preview) or one already
 * stored on the server (`id` + its signed URL), when editing.
 */
export interface PhotoEntry {
  preview: string;
  file?: File;
  id?: string;
}

/** Field-level date problems; mirrors the backend date-order rules. */
export type DateErrors = Partial<Record<'death_date' | 'service_end', string>>;

/** Gallery size; the main photo is separate and not counted. Matches MAX_GALLERY_PHOTOS. */
export const MAX_PHOTOS = 10;
/** Matches MIN_BIOGRAPHY_LENGTH on the backend (counted after trimming). */
export const MIN_BIOGRAPHY_LENGTH = 20;
/** Matches the backend limit for timeline entries and awards. */
export const MAX_LIFE_ROWS = 30;
export const MIN_YEAR = 1800;

let keySeq = 0;
export const newKey = () => `row-${Date.now().toString(36)}-${(keySeq++).toString(36)}`;

export function getDateErrors(form: FormState): DateErrors {
  const errors: DateErrors = {};
  // ISO yyyy-mm-dd strings compare correctly as text.
  if (form.birth_date && form.death_date && form.death_date < form.birth_date) {
    errors.death_date = 'The date of passing is earlier than the date of birth.';
  }
  if (
    form.page_type === 'military' && form.service_start && form.service_end
    && form.service_end < form.service_start
  ) {
    errors.service_end = 'Service ends before it starts — check both dates.';
  }
  return errors;
}

const isBlankTimeline = (r: TimelineRow) => !r.year.trim() && !r.title.trim() && !r.description.trim();
const isBlankAward = (r: AwardRow) => !r.name.trim() && !r.date && !r.description.trim();

/** Per-row problems on the Life step, keyed by row key. Empty rows are ignored (dropped on save). */
export function getLifeErrors(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  const thisYear = new Date().getFullYear();
  for (const r of form.timeline) {
    if (isBlankTimeline(r)) continue;
    const y = Number(r.year);
    if (!r.year.trim() || !Number.isInteger(y) || y < MIN_YEAR || y > thisYear) {
      errors[r.key] = `Add a year between ${MIN_YEAR} and ${thisYear}.`;
    } else if (!r.title.trim()) {
      errors[r.key] = 'Add a few words about what happened.';
    }
  }
  if (form.page_type === 'military') {
    const today = new Date().toISOString().slice(0, 10);
    for (const r of form.awards) {
      if (isBlankAward(r)) continue;
      if (!r.name.trim()) errors[r.key] = 'Add the name of the award.';
      else if (r.date && r.date > today) errors[r.key] = 'The date is in the future.';
    }
  }
  return errors;
}

/** Rows ready for the API: blanks dropped, trimmed, order = position. */
export function lifePayload(form: FormState) {
  const timeline_entries = form.timeline
    .filter((r) => !isBlankTimeline(r))
    .map((r) => ({ year: Number(r.year), title: r.title.trim(), description: r.description.trim() }));
  const military_awards = form.page_type === 'military'
    ? form.awards
        .filter((r) => !isBlankAward(r))
        .map((r) => ({ name: r.name.trim(), description: r.description.trim(), awarded_date: r.date || null }))
    : [];
  return { timeline_entries, military_awards };
}

/** Form state from a stored memorial (edit flow). */
export function formFromPage(p: MemorialPageDetail): FormState {
  return {
    page_type: p.page_type,
    first_name: p.first_name,
    last_name: p.last_name,
    birth_date: p.birth_date ?? '',
    death_date: p.death_date ?? '',
    biography: p.biography,
    military_rank: p.military_rank ?? '',
    military_branch: p.military_branch ?? '',
    service_start: p.service_start ?? '',
    service_end: p.service_end ?? '',
    timeline: [...p.timeline_entries]
      .sort((a, b) => a.year - b.year || a.order - b.order)
      .map((e) => ({ key: newKey(), year: String(e.year), title: e.title, description: e.description })),
    awards: [...p.military_awards]
      .sort((a, b) => a.order - b.order)
      .map((a) => ({ key: newKey(), name: a.name, date: a.awarded_date ?? '', description: a.description })),
  };
}
