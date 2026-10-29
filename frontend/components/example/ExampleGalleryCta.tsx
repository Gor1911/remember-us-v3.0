'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryLightbox } from '@/components/memorial/GalleryLightbox';
import { EXAMPLE } from '@/components/example/data';

gsap.registerPlugin(ScrollTrigger);

export function ExampleGalleryCta() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gallery-header', {
        opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: galleryRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.gallery-wrap', {
        opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.15,
        clearProps: 'all',
        scrollTrigger: { trigger: galleryRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.cta-inner > *', {
        opacity: 0, y: 40, duration: 0.8, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: ctaRef.current, start: 'top 88%', once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="border-t border-[#1A1614]/[0.08]">
        <div className="site-container py-16">
          <div ref={galleryRef} className="max-w-4xl mx-auto">
            <div className="gallery-header flex items-center justify-between mb-10">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
                <span className="text-muted text-[11px] uppercase tracking-[0.12em] font-medium">Photo Gallery</span>
              </div>
              <span className="text-muted text-xs">{EXAMPLE.gallery.length} photos</span>
            </div>
            <div className="gallery-wrap">
              <GalleryLightbox photos={EXAMPLE.gallery} />
            </div>
          </div>
        </div>
      </div>

      <div ref={ctaRef} className="border-t border-[#1A1614]/[0.08]">
        <div className="cta-inner site-container py-16 text-center flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="text-muted text-[11px] uppercase tracking-[0.14em] font-medium">Create Your Memorial</span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-2xl xl:text-3xl tracking-tight max-w-lg">
            Honor your loved one with a memorial your family can return to for generations.
          </h2>
          <Link
            href="/"
            className="px-8 py-4 bg-[#8B0000] hover:bg-[#A00000] text-white font-medium text-sm rounded-[14px] transition-colors no-underline"
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
