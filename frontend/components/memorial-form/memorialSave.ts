import { media } from '@/app/lib/api';
import type { CreatePagePayload, UpdatePagePayload } from '@/app/lib/types';
import { lifePayload, type FormState, type PhotoEntry } from './formTypes';

function uploadImage(slug: string, file: File, isPortrait: boolean) {
  const fd = new FormData();
  fd.append('file', file);
  if (isPortrait) fd.append('is_primary_portrait', 'true');
  return media.upload(slug, fd);
}

/** Text fields shared by create and update, trimmed; military fields only for military pages. */
function contentPayload(form: FormState): UpdatePagePayload {
  const military = form.page_type === 'military';
  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    biography: form.biography.trim(),
    birth_date: form.birth_date || undefined,
    death_date: form.death_date || undefined,
    military_rank: military ? form.military_rank.trim() : undefined,
    military_branch: military ? form.military_branch.trim() : undefined,
    service_start: military ? form.service_start || undefined : undefined,
    service_end: military ? form.service_end || undefined : undefined,
    ...lifePayload(form),
  };
}

export const createPayload = (form: FormState): CreatePagePayload => ({
  page_type: form.page_type,
  ...contentPayload(form),
} as CreatePagePayload);

/**
 * Edit payload: dates the family cleared are sent as null so they are removed, not kept.
 * (`undefined` would leave the stored value untouched.)
 */
export const updatePayload = (form: FormState) => {
  const p = contentPayload(form) as Record<string, unknown>;
  for (const k of ['birth_date', 'death_date', 'service_start', 'service_end'] as const) {
    if (p[k] === undefined && (form.page_type === 'military' || k === 'birth_date' || k === 'death_date')) p[k] = null;
  }
  return p as UpdatePagePayload;
};

interface MediaPlan {
  slug: string;
  portrait: PhotoEntry | null;
  photos: PhotoEntry[];
  removedIds: string[];
  onStatus: (s: string) => void;
}

/**
 * Applies photo changes after the text is saved: removals first, then the main photo (so the cover
 * is in place even if a gallery upload fails), then new gallery photos. Returns problems in plain words.
 */
export async function syncMedia({ slug, portrait, photos, removedIds, onStatus }: MediaPlan): Promise<string[]> {
  const problems: string[] = [];

  for (const id of removedIds) {
    const res = await media.delete(slug, id);
    if (!res.success) problems.push('A photo you removed could not be deleted — try removing it again.');
  }

  if (portrait?.file) {
    onStatus('Uploading the main photo…');
    const up = await uploadImage(slug, portrait.file, true);
    if (!up.success) problems.push(`The main photo didn’t upload (${up.error}).`);
  }

  const fresh = photos.filter((p) => p.file);
  let failed = 0;
  for (let i = 0; i < fresh.length; i++) {
    onStatus(`Uploading photo ${i + 1} of ${fresh.length}…`);
    const up = await uploadImage(slug, fresh[i].file as File, false);
    if (!up.success) failed += 1;
  }
  if (failed > 0) problems.push(`${failed} photo${failed > 1 ? 's' : ''} didn’t upload.`);
  if (problems.length > 0) problems.push('You can add them again from “Edit” on your dashboard.');
  return problems;
}
