import type { PageType } from '@/app/lib/types';

export const STEPS = ['Basic Info', 'Story', 'Gallery', 'Review', 'Plan'] as const;
export type Step = 0 | 1 | 2 | 3 | 4;

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
};

export interface PhotoEntry {
  file: File;
  preview: string;
}

/** Field-level date problems; mirrors the backend date-order rules. */
export type DateErrors = Partial<Record<'death_date' | 'service_end', string>>;

/** Gallery size; the main photo is separate and not counted. Matches MAX_GALLERY_PHOTOS. */
export const MAX_PHOTOS = 10;
/** Matches MIN_BIOGRAPHY_LENGTH on the backend (counted after trimming). */
export const MIN_BIOGRAPHY_LENGTH = 20;

export function getDateErrors(form: FormState): DateErrors {
  const errors: DateErrors = {};
  // ISO yyyy-mm-dd strings compare correctly as text.
  if (form.birth_date && form.death_date && form.death_date < form.birth_date) {
    errors.death_date = 'Date of passing cannot be earlier than date of birth.';
  }
  if (
    form.page_type === 'military' && form.service_start && form.service_end
    && form.service_end < form.service_start
  ) {
    errors.service_end = 'Service end cannot be earlier than service start.';
  }
  return errors;
}
