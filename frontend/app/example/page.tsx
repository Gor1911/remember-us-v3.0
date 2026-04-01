'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/landing/Header';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GalleryLightbox } from '@/components/memorial/GalleryLightbox';
import type { GalleryPhoto } from '@/components/memorial/GalleryLightbox';

gsap.registerPlugin(ScrollTrigger);

const EXAMPLE = {
  name: 'Chief Master Sergeant William R. Davis',
  branch: 'U.S. Air Force · WWII Veteran',
  years: '1924 – 2023',
  bio: 'William Robert Davis was born on March 4, 1924, in Springfield, Illinois, the second of five children. Raised during the Great Depression, he learned the values of discipline, perseverance, and service from an early age. At nineteen, he enlisted in the United States Army Air Forces, driven by a deep sense of duty following the attack on Pearl Harbor.',
  bio2: 'During World War II, William served in the Pacific Theater, flying support missions over the Philippine Islands and Japan. He was awarded the Purple Heart after sustaining injuries during a bombing raid in 1944. His quiet courage under fire earned him the respect of fellow servicemen and commanding officers alike.',
  bio3: 'After the war, William transitioned to the newly formed United States Air Force, where he continued to serve with distinction through the Korean and Vietnam conflicts. He rose to the rank of Chief Master Sergeant — the highest enlisted rank — a testament to his exceptional leadership and technical expertise in aircraft maintenance and operations.',
  bio4: 'In 1973, after thirty years of distinguished service, William retired to Phoenix, Arizona, where he devoted himself to his family, his church, and his community. He was a founding member of the local Veterans of Foreign Wars post and spent decades mentoring young servicemen returning from deployment. William passed away peacefully on November 11, 2023 — Veterans Day — surrounded by his family. He was 99 years old.',
  timeline: [
    { year: '1924', label: 'Born',          desc: 'Springfield, Illinois' },
    { year: '1943', label: 'Enlisted',       desc: 'U.S. Army Air Forces' },
    { year: '1945', label: 'WWII Service',   desc: 'Pacific Theater' },
    { year: '1962', label: 'Vietnam',        desc: 'Southeast Asia deployment' },
    { year: '1973', label: 'Retired',        desc: 'Chief Master Sergeant' },
    { year: '2023', label: 'Passed Away',    desc: 'Aged 99' },
  ],
  awards: [
    { name: 'Purple Heart',          desc: 'For wounds received in action' },
    { name: 'Air Medal',             desc: 'For meritorious aerial achievement' },
    { name: 'Vietnam Service Medal', desc: 'For service in Southeast Asia' },
    { name: 'WWII Victory Medal',    desc: 'For service during World War II' },
  ],
  gallery: [
    { id: '1', src: '/images/Veteran1.jpg',  alt: 'William R. Davis', caption: 'In uniform',       featured: true },
    { id: '2', src: '/images/veteran2.jpg',  alt: 'Service portrait', caption: 'Service portrait' },
    { id: '3', src: '/images/veteran3.jpg',  alt: 'Medal ceremony',   caption: 'Medal ceremony' },
    { id: '4', src: '/images/veteran4.jpg',  alt: 'Family portrait',  caption: 'Family portrait' },
  ] as GalleryPhoto[],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamplePage() {
  const pageRef     = useRef<HTMLDivElement>(null);
  const heroRef     = useRef<HTMLDivElement>(null);
  const nameRef     = useRef<HTMLDivElement>(null);
  const bioRef      = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const awardsRef   = useRef<HTMLDivElement>(null);
  const galleryRef  = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  // Page + hero entrance
  useEffect(() => {
    if (!pageRef.current) return;
    const tl = gsap.timeline();
    tl.to(pageRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .to('.portrait-card', { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }, '-=0.1')
      .to('.veteran-badge', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
  }, []);

  // Name + meta + bio paragraphs
  useEffect(() => {
    if (!nameRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.name-label, .name-h1, .name-meta', {
        opacity: 0, y: 24, duration: 0.8, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: nameRef.current, start: 'top 90%', once: true },
      });
      gsap.from('.bio-para', {
        opacity: 0, y: 28, duration: 0.85, ease: 'power2.out', stagger: 0.18,
        scrollTrigger: { trigger: '.bio-para', start: 'top 88%', once: true },
      });
    }, nameRef);
    return () => ctx.revert();
  }, []);

  // Timeline items
  useEffect(() => {
    if (!timelineRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.section-label', {
        opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: timelineRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.timeline-item', {
        opacity: 0, x: -24, duration: 0.65, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: timelineRef.current, start: 'top 82%', once: true },
      });
    }, timelineRef);
    return () => ctx.revert();
  }, []);

  // Award cards
  useEffect(() => {
    if (!awardsRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.award-card', {
        opacity: 0, y: 32, duration: 0.7, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: awardsRef.current, start: 'top 85%', once: true },
      });
    }, awardsRef);
    return () => ctx.revert();
  }, []);

  // Gallery
  useEffect(() => {
    if (!galleryRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.gallery-header', {
        opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: galleryRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.gallery-wrap', {
        opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.15,
        onComplete: () => { gsap.set('.gallery-wrap', { clearProps: 'all' }); },
        scrollTrigger: { trigger: galleryRef.current, start: 'top 85%', once: true },
      });
    }, galleryRef);
    return () => ctx.revert();
  }, []);

  // CTA
  useEffect(() => {
    if (!ctaRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.cta-inner > *', {
        opacity: 0, y: 24, duration: 0.7, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: ctaRef.current, start: 'top 88%', once: true },
      });
    }, ctaRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#FAF8F5] text-[#1A1614]" style={{ opacity: 0 }}>

      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-[75vh] min-h-[620px] pt-16 pb-16">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/arlington.jpg"
            alt="Arlington National Cemetery"
            fill priority
            className="object-cover object-center opacity-40 blur-[3px] scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F3F0EB]/70 via-transparent to-[#F3F0EB]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_90%_at_50%_50%,transparent_40%,#F3F0EB_100%)]" />
        </div>

        <div className="absolute bottom-24 md:bottom-16 left-1/2 -translate-x-1/2 z-10">
          <div
            className="portrait-card relative w-90 h-[400px] md:w-64 md:h-[420px] rounded-[28px] overflow-hidden border border-[#1A1614]/10"
            style={{ boxShadow: '0 0 0 8px rgba(139,0,0,0.08), 0 40px 80px rgba(26,22,20,0.15)', opacity: 0, transform: 'translateY(40px)' }}
          >
            <video
              src="/images/veteran_mp4.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-[#1A1614]/10" />
          </div>
          <div className="veteran-badge absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B0000]/90 border border-[#8B0000]" style={{ opacity: 0, transform: 'translateY(8px)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span className="text-white text-[10px] font-medium tracking-wider uppercase whitespace-nowrap">
              Veteran
            </span>
          </div>
        </div>
      </div>

      {/* ── Name + Bio ───────────────────────────────────────────────────────── */}
      <div ref={nameRef} className="site-container text-center pt-8 pb-16">
        <div className="name-label flex items-center justify-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="text-[#8A7F74] text-[11px] uppercase tracking-[0.14em] font-medium">
            In Memory Of
          </span>
        </div>
        <h1 className="name-h1 text-[#1A1614] font-bold text-3xl xl:text-[40px] tracking-tight leading-tight mb-2">
          {EXAMPLE.name}
        </h1>
        <div className="name-meta">
          <p className="text-[#1A1614]/40 text-sm font-mono">{EXAMPLE.branch}</p>
          <p className="text-[#1A1614]/25 text-sm mt-1 tracking-widest">{EXAMPLE.years}</p>
        </div>
        <div ref={bioRef} className="flex flex-col gap-5 text-[#1A1614]/55 text-base leading-relaxed max-w-2xl mx-auto mt-8 text-left">
          <p className="bio-para">{EXAMPLE.bio}</p>
          <p className="bio-para">{EXAMPLE.bio2}</p>
          <p className="bio-para">{EXAMPLE.bio3}</p>
          <p className="bio-para">{EXAMPLE.bio4}</p>
        </div>
      </div>

      {/* ── Timeline + Awards ────────────────────────────────────────────────── */}
      <div className="border-t border-[#1A1614]/[0.08]">
        <div className="site-container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Timeline */}
              <div ref={timelineRef}>
                <div className="section-label flex items-center gap-2.5 mb-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
                  <span className="text-[#8A7F74] text-[11px] uppercase tracking-[0.12em] font-medium">
                    Biography
                  </span>
                </div>
                <div className="flex flex-col">
                  {EXAMPLE.timeline.map((item, i) => (
                    <div key={i} className="timeline-item">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#8B0000] shrink-0" />
                        <span className="text-[#8B0000] text-xs font-mono pl-3">{item.year}</span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex justify-center w-2 shrink-0">
                          {i < EXAMPLE.timeline.length - 1 && (
                            <div className="w-px bg-[#1A1614]/[0.08] min-h-[48px]" />
                          )}
                        </div>
                        <div className="pb-6 pt-1 pl-3">
                          <p className="text-[#1A1614] font-medium text-sm">{item.label}</p>
                          <p className="text-[#1A1614]/40 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Awards */}
              <div ref={awardsRef}>
                <div className="section-label flex items-center gap-2.5 mb-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
                  <span className="text-[#8A7F74] text-[11px] uppercase tracking-[0.12em] font-medium">
                    Military Awards
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EXAMPLE.awards.map((award) => (
                    <div key={award.name} className="award-card glass rounded-[24px] p-6 flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#8B0000]/10 border border-[#8B0000]/20 flex items-center justify-center text-lg">
                        🎖
                      </div>
                      <h3 className="text-[#1A1614] font-semibold text-sm">{award.name}</h3>
                      <p className="text-[#1A1614]/40 text-xs leading-relaxed">{award.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Photo Gallery ────────────────────────────────────────────────────── */}
      <div className="border-t border-[#1A1614]/[0.08]">
        <div className="site-container py-16">
          <div ref={galleryRef} className="max-w-4xl mx-auto">
            <div className="gallery-header flex items-center justify-between mb-10">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
                <span className="text-[#8A7F74] text-[11px] uppercase tracking-[0.12em] font-medium">
                  Photo Gallery
                </span>
              </div>
              <span className="text-[#1A1614]/20 text-xs">{EXAMPLE.gallery.length} photos</span>
            </div>
            <div className="gallery-wrap">
              <GalleryLightbox photos={EXAMPLE.gallery} />
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <div ref={ctaRef} className="border-t border-[#1A1614]/[0.08]">
        <div className="site-container py-16 text-center flex flex-col items-center gap-6 cta-inner">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
            <span className="text-[#8A7F74] text-[11px] uppercase tracking-[0.14em] font-medium">
              Create Your Memorial
            </span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-2xl xl:text-3xl tracking-tight max-w-lg">
            Honor your loved one with a memorial that lasts forever.
          </h2>
          <Link
            href="/"
            className="px-8 py-4 bg-[#8B0000] hover:bg-[#A00000] text-white font-medium text-sm rounded-[14px] transition-colors no-underline"
          >
            Get Started
          </Link>
        </div>
      </div>

    </div>
  );
}
