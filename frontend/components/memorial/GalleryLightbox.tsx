'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
// ─── Generic photo type ───────────────────────────────────────────────────────

export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  featured?: boolean;
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
      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[200px]">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => open(i)}
            className={`relative overflow-hidden rounded-[20px] bg-white/[0.04] border border-white/[0.08] group cursor-zoom-in ${
              photo.featured ? 'lg:col-span-2 lg:row-span-2' : ''
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {index !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={close} />

          {/* Main image */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-16">
            <div className="relative w-full h-full max-w-5xl">
              <Image
                src={photos[index].src}
                alt={photos[index].alt}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Counter */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
            <span className="text-white/30 text-xs tracking-widest">
              {index + 1} / {photos.length}
            </span>
          </div>

          {/* Caption */}
          {photos[index].caption && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
              <p className="text-white/50 text-sm text-center px-6">{photos[index].caption}</p>
            </div>
          )}

          {/* Close */}
          <button
            onClick={close}
            className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white/60 hover:text-white transition-all"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-4 md:left-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white/60 hover:text-white transition-all"
              aria-label="Previous"
            >
              ←
            </button>
          )}

          {/* Next */}
          {photos.length > 1 && (
            <button
              onClick={next}
              className="absolute right-4 md:right-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white/60 hover:text-white transition-all"
              aria-label="Next"
            >
              →
            </button>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 flex-wrap justify-center">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setIndex(i)}
                  className={`relative w-12 h-8 rounded-[6px] overflow-hidden border transition-all ${
                    i === index
                      ? 'border-white/60 opacity-100'
                      : 'border-white/10 opacity-40 hover:opacity-70'
                  }`}
                >
                  <Image src={p.src} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
