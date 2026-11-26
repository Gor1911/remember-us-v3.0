import type { GalleryPhoto } from '@/components/memorial/GalleryLightbox';

/**
 * Presentation model for a memorial page. Both the real memorial (`app/[hash]`) and the public
 * example (`app/example`) are rendered from this shape, so the example always shows exactly what
 * a family will get.
 */
export interface MemorialView {
  type: 'civilian' | 'military';
  name: string;
  /** "1924 – 2023" or "" when unknown. */
  years: string;
  /** Short line after the years, e.g. "U.S. Air Force · Chief Master Sergeant". */
  descriptor: string | null;
  cover: { src: string; position: string };
  /** Static round avatar. `position` is an object-position class for the circular crop. */
  portrait: { src: string; unoptimized: boolean; position?: string } | null;
  living: { src: string; altSrc?: string; poster: string | null; unoptimized: boolean } | null;
  story: string[];
  timeline: { key: string; year: string; title: string; description: string }[];
  photos: GalleryPhoto[];
  facts: { label: string; value: string }[];
  awards: { key: string; name: string; description: string; year: string | null }[];
  qr: { src: string; unoptimized: boolean } | null;
}

/** Golden morning fog over hills (Unsplash License, see public/images/stock/CREDITS.md). */
const COVER_HILLS = { src: '/images/stock/cover-hills.jpg', position: 'object-[center_40%]' };

// One calm cover for every memorial; military pages are marked by the Veteran chip and navy honors.
// Kept as two constants so a per-type (or user-chosen) cover can be introduced without touching callers.
export const COVER_CIVILIAN = COVER_HILLS;
export const COVER_MILITARY = COVER_HILLS;
