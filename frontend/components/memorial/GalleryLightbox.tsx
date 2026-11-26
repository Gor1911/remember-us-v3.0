'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FOCUS } from '@/components/ui/styles';
import { LightboxViewer } from '@/components/memorial/LightboxViewer';
// ─── Generic photo type ───────────────────────────────────────────────────────

export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  /** Serve as-is (object-URL previews, hosts next/image may not fetch). */
  unoptimized?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  photos: GalleryPhoto[];
}

export function GalleryLightbox({ photos }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const open  = (i: number) => setIndex(i);
  const close = useCallback(() => setIndex(null), []);
  const prev  = useCallback(() => setIndex(i => i !== null ? (i - 1 + photos.length) % photos.length : null), [photos.length]);
  const next  = useCallback(() => setIndex(i => i !== null ? (i + 1) % photos.length : null), [photos.length]);

  useEffect(() => {
    if (index === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, prev, next, close]);

  useEffect(() => {
    document.body.style.overflow = index !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [index]);

  return (
    <>
      {/* ── Grid: square tiles, as on the landing-page phone ─────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => open(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}${photo.caption ? `: ${photo.caption}` : ''}`}
            className={`relative aspect-square overflow-hidden rounded-[14px] bg-soft group cursor-zoom-in ${FOCUS}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              unoptimized={photo.unoptimized}
              sizes="(min-width: 1024px) 170px, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-300" />
            {photo.caption && (
              <div className="hidden md:block absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 bg-gradient-to-t from-ink/90 via-ink/70 to-transparent translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0 transition-transform duration-300">
                <p className="type-utility text-white text-left">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {index !== null && (
        <LightboxViewer photos={photos} index={index} onIndex={setIndex} onPrev={prev} onNext={next} onClose={close} />
      )}
    </>
  );
}
