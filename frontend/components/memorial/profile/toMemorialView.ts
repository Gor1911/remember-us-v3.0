import { canOptimizeImage } from '@/app/lib/config';
import type { MemorialPageDetail } from '@/app/lib/types';
import { COVER_CIVILIAN, COVER_MILITARY, type MemorialView } from '@/components/memorial/profile/types';

const year = (iso: string | null): number | null => (iso ? new Date(iso).getUTCFullYear() : null);

const longDate = (iso: string | null): string | null =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    : null;

function ageAt(birth: string | null, death: string | null): number | null {
  if (!birth || !death) return null;
  const b = new Date(birth);
  const d = new Date(death);
  let age = d.getUTCFullYear() - b.getUTCFullYear();
  if (d.getUTCMonth() < b.getUTCMonth() || (d.getUTCMonth() === b.getUTCMonth() && d.getUTCDate() < b.getUTCDate())) age -= 1;
  return age >= 0 ? age : null;
}

export function yearsLabel(birth: number | null, death: number | null): string {
  if (birth && death) return `${birth} – ${death}`;
  if (birth) return `Born ${birth}`;
  if (death) return `Died ${death}`;
  return '';
}

/** Maps the API memorial detail to the shared presentation model. */
export function toMemorialView(m: MemorialPageDetail): MemorialView {
  const military = m.page_type === 'military';
  const portraitFile = m.media_files.find((f) => f.is_primary_portrait) ?? null;
  const age = ageAt(m.birth_date, m.death_date);
  const serviceFrom = year(m.service_start);
  const serviceTo = year(m.service_end);

  const facts = [
    { label: 'Born', value: longDate(m.birth_date) },
    { label: 'Passed away', value: longDate(m.death_date) },
    // Under one year the line is left out rather than reading "0 years".
    { label: 'Age', value: age !== null && age >= 1 ? `${age} ${age === 1 ? 'year' : 'years'}` : null },
    { label: 'Service', value: military && (serviceFrom || serviceTo) ? [serviceFrom, serviceTo].filter(Boolean).join(' – ') : null },
    { label: 'Branch', value: military ? m.military_branch : null },
    { label: 'Rank', value: military ? m.military_rank : null },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return {
    type: m.page_type,
    name: m.full_name || `${m.first_name} ${m.last_name}`.trim(),
    years: yearsLabel(year(m.birth_date), year(m.death_date)),
    descriptor: military ? [m.military_branch, m.military_rank].filter(Boolean).join(' · ') || null : null,
    cover: military ? COVER_MILITARY : COVER_CIVILIAN,
    portrait: portraitFile ? { src: portraitFile.file_url, unoptimized: !canOptimizeImage(portraitFile.file_url) } : null,
    living: m.portrait_animated_url
      ? {
          src: m.portrait_animated_url,
          poster: portraitFile?.file_url ?? null,
          unoptimized: !portraitFile || !canOptimizeImage(portraitFile.file_url),
        }
      : null,
    story: m.biography.split(/\r?\n\s*\r?\n|\r?\n/).map((p) => p.trim()).filter(Boolean),
    timeline: [...m.timeline_entries]
      .sort((a, b) => a.year - b.year || a.order - b.order)
      .map((e) => ({ key: e.id, year: String(e.year), title: e.title, description: e.description })),
    photos: m.media_files
      .filter((f) => f.media_type === 'photo')
      .sort((a, b) => a.order - b.order)
      .map((f) => ({
        id: f.id, src: f.file_url, alt: f.alt_text || f.caption || 'Memorial photo', caption: f.caption || undefined,
        unoptimized: !canOptimizeImage(f.file_url),
      })),
    facts,
    awards: military
      ? [...m.military_awards]
          .sort((a, b) => a.order - b.order)
          .map((a) => ({ key: a.id, name: a.name, description: a.description, year: a.awarded_date ? String(year(a.awarded_date)) : null }))
      : [],
    qr: m.qr_code ? { src: m.qr_code.qr_url, unoptimized: true } : null,
  };
}
