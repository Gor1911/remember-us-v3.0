import type { PageType } from '@/app/lib/types';

export const STEPS = ['Basic Info', 'Story', 'Photos', 'Review', 'Plan'] as const;
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

export const MAX_PHOTOS = 10;
