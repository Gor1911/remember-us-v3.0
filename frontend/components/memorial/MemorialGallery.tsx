'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MediaFile } from '@/app/lib/types';
import { GalleryLightbox } from './GalleryLightbox';
import type { GalleryPhoto } from './GalleryLightbox';

gsap.registerPlugin(ScrollTrigger);

interface MemorialGalleryProps {
  mediaFiles: MediaFile[];
}

// Pure conversion — no client APIs, safe to run here
function mediaToPhotos(files: MediaFile[]): GalleryPhoto[] {
  return files
    .filter((f) => f.media_type === 'photo' || f.media_type === 'portrait')
    .sort((a, b) => a.order - b.order)
    .map((f, i) => {
      let src = f.file_url;
      try { src = new URL(f.file_url).pathname; } catch { /* relative path — keep as is */ }
      return {
        id: f.id,
        src,
        alt: f.alt_text || f.caption || 'Memorial photo',
        caption: f.caption || undefined,
        featured: i === 0,
      };
    });
}

export const MemorialGallery = ({ mediaFiles }: MemorialGalleryProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const photos = mediaToPhotos(mediaFiles);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.mg-header', {
        opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      // opacity only — no y/transform so fixed lightbox overlay isn't trapped
      gsap.from('.mg-wrap', {
        opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.15,
        onComplete: () => { gsap.set('.mg-wrap', { clearProps: 'all' }); },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="border-t border-white/[0.06]">
      <div className="site-container py-16">
        <div ref={sectionRef} className="max-w-4xl mx-auto">

          <div className="mg-header flex items-center justify-between mb-10">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
              <span className="text-[#9BA4B5] text-[11px] uppercase tracking-[0.12em] font-medium">
                Photo Gallery
              </span>
            </div>
            {photos.length > 0 && (
              <span className="text-white/20 text-xs">{photos.length} photos</span>
            )}
          </div>

          {photos.length === 0 ? (
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-12 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="#ffffff30" strokeWidth="1.5" />
                  <circle cx="7" cy="8.5" r="1.5" stroke="#ffffff30" strokeWidth="1.5" />
                  <path d="M2 13.5l4-4 3 3 3-3.5 4 4" stroke="#ffffff30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-white/30 text-sm">No photos yet</p>
            </div>
          ) : (
            <div className="mg-wrap">
              <GalleryLightbox photos={photos} />
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
