import type { MemorialPageDetail } from '@/app/lib/types';
import { toMemorialView } from '@/components/memorial/profile/toMemorialView';
import type { MemorialView } from '@/components/memorial/profile/types';
import { lifePayload, type FormState, type PhotoEntry } from './formTypes';

/**
 * Builds the guest view from unsaved form state by shaping it like an API response and running it
 * through the same mapper as the real memorial, so the preview cannot drift from the live page.
 */
export function formToView(form: FormState, portrait: PhotoEntry | null, photos: PhotoEntry[]): MemorialView {
  const military = form.page_type === 'military';
  const { timeline_entries, military_awards } = lifePayload(form);
  const detail: MemorialPageDetail = {
    id: 'preview',
    slug: '',
    page_type: form.page_type,
    state: 'draft',
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    full_name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim(),
    birth_date: form.birth_date || null,
    death_date: form.death_date || null,
    biography: form.biography,
    military_rank: military ? form.military_rank.trim() || null : null,
    military_branch: military ? form.military_branch.trim() || null : null,
    service_start: military ? form.service_start || null : null,
    service_end: military ? form.service_end || null : null,
    portrait_animated_url: null,
    portrait_animation_status: 'none',
    approved_at: null,
    memorial_url: '',
    owner: { id: '', display_name: '', role: 'owner' },
    primary_portrait: portrait?.preview ?? null,
    created_at: '',
    updated_at: '',
    qr_code: null,
    timeline_entries: timeline_entries.map((e, i) => ({ ...e, id: `t${i}`, order: i })),
    military_awards: military_awards.map((a, i) => ({ ...a, id: `a${i}`, model_3d_url: null, order: i })),
    media_files: [
      ...(portrait
        ? [{ id: 'portrait', media_type: 'portrait' as const, file_url: portrait.preview, original_filename: '', is_primary_portrait: true, caption: '', alt_text: '', order: 0 }]
        : []),
      ...photos.map((p, i) => ({
        id: p.id ?? `p${i}`, media_type: 'photo' as const, file_url: p.preview, original_filename: '',
        is_primary_portrait: false, caption: '', alt_text: `Photo ${i + 1}`, order: i,
      })),
    ],
  };
  return toMemorialView(detail);
}
