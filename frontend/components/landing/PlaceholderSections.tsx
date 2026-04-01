'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useModal } from '@/app/context/ModalContext';

gsap.registerPlugin(ScrollTrigger);

// ─── LivingPortraitSection ────────────────────────────────────────────────────

export function LivingPortraitSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.lp-label', {
        opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.lp-heading', {
        opacity: 0, y: 30, duration: 0.8, ease: 'power2.out', delay: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.lp-body', {
        opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', delay: 0.2,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.lp-item', {
        opacity: 0, x: -16, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.3,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.lp-mockup', {
        opacity: 0, y: 40, scale: 0.96, duration: 0.9, ease: 'power2.out', delay: 0.15,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how" className="bg-[#FAF8F5] py-20 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="lp-label flex items-center gap-2.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">
            Living Portrait
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <h2 className="lp-heading text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
              A portrait that
              <br />
              <span className="text-[#8A7F74]">looks back at you.</span>
            </h2>
            <p className="lp-body text-[#1A1614]/50 text-base leading-relaxed max-w-md">
              LivePortrait technology brings a photograph to life. Eyes move,
              expressions breathe — as if the person is present beside you.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                'Animated from a single photo',
                'Natural micro-movements',
                'Triggered on scroll',
              ].map((item) => (
                <li key={item} className="lp-item flex items-center gap-3 text-[#1A1614]/60 text-sm">
                  <span className="w-1 h-1 rounded-full bg-[#8B0000] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <div
              className="lp-mockup relative w-[240px] h-[480px] rounded-[48px] overflow-hidden border border-[#1A1614]/[0.12]"
              style={{ boxShadow: '0 0 0 8px rgba(139,0,0,0.06), 0 40px 80px rgba(26,22,20,0.12)' }}
            >
              <video
                src="/images/veteran_mp4.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 rounded-[48px] ring-1 ring-inset ring-[#1A1614]/10" />
              {/* Living Portrait badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#1A1614]/10 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
                <span className="text-[#1A1614]/60 text-[10px] font-medium tracking-wider uppercase">Living Portrait</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FeaturesSection ──────────────────────────────────────────────────────────

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const features = [
    {
      icon: '🎖',
      title: 'Awards in 3D',
      desc: 'Military medals and orders in interactive 3D. Rotate, zoom in, and read the story behind each decoration.',
    },
    {
      icon: '🔒',
      title: 'Private Access',
      desc: 'The memorial is not indexed or searchable. Access only via a personal QR code — for family and close ones.',
    },
    {
      icon: '📖',
      title: 'Biography',
      desc: 'An interactive life timeline. Photos, videos, documents — everything in chronological order.',
    },
    {
      icon: '🖼',
      title: 'Photo Gallery',
      desc: 'Thousands of photographs in one place. Family members can add photos after the memorial is published.',
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.feat-header', {
        opacity: 0, y: 28, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.feat-card', {
        opacity: 0, y: 36, duration: 0.7, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: '.feat-card', start: 'top 88%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="examples" className="bg-[#F3F0EB] py-20 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="feat-header text-center mb-16">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">
              Features
            </span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
            Everything you need for
            <br />
            <span className="text-[#8A7F74]">a meaningful tribute.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="feat-card glass bento-pad flex flex-col gap-4 rounded-[32px]">
              <span className="text-3xl">{icon}</span>
              <h3 className="text-[#1A1614] font-semibold text-base">{title}</h3>
              <p className="text-[#1A1614]/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── QrSection ────────────────────────────────────────────────────────────────

export function QrSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.qr-visual', {
        opacity: 0, x: -40, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
      });
      gsap.from('.qr-label', {
        opacity: 0, x: 20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.qr-heading', {
        opacity: 0, y: 28, duration: 0.8, ease: 'power2.out', delay: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.qr-body', {
        opacity: 0, y: 18, duration: 0.7, ease: 'power2.out', delay: 0.2,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.qr-item', {
        opacity: 0, x: 16, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.3,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="bg-[#FAF8F5] py-20 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* QR visual */}
          <div className="qr-visual flex justify-center order-2 md:order-1">
            <div className="glass rounded-[32px] p-10 flex flex-col items-center gap-6">
              <div className="grid grid-cols-7 gap-[4px]">
                {Array.from({ length: 49 }, (_, i) => {
                  const on = [0,1,2,3,4,5,6,7,13,14,20,21,22,23,24,25,26,28,29,35,42,43,44,45,46,47,48].includes(i);
                  return (
                    <div
                      key={i}
                      className={`w-[18px] h-[18px] rounded-[4px] ${on ? 'bg-[#1A1614]/70' : 'bg-[#1A1614]/[0.06]'}`}
                    />
                  );
                })}
              </div>
              <p className="text-[#1A1614]/30 text-xs tracking-widest uppercase">Scan to access</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 order-1 md:order-2">
            <div className="qr-label flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
              <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">
                QR Access
              </span>
            </div>
            <h2 className="qr-heading text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
              A physical link
              <br />
              <span className="text-[#8A7F74]">to digital memory.</span>
            </h2>
            <p className="qr-body text-[#1A1614]/50 text-base leading-relaxed max-w-md">
              The QR code is placed on a headstone, memorial plaque, or a frame at home.
              One scan — and the memorial opens on any screen.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                'Engraved on metal or stone',
                'No login or password required',
                'Works on any smartphone',
              ].map((item) => (
                <li key={item} className="qr-item flex items-center gap-3 text-[#1A1614]/60 text-sm">
                  <span className="w-1 h-1 rounded-full bg-[#8B0000] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CtaBanner ────────────────────────────────────────────────────────────────

export function CtaBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const { handleCreateClick } = useModal();

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.cta-card', {
        opacity: 0, y: 40, scale: 0.98, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
      });
      gsap.from('.cta-card > *', {
        opacity: 0, y: 20, duration: 0.7, ease: 'power2.out', stagger: 0.12, delay: 0.2,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#F3F0EB] py-20 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="cta-card glass rounded-[32px] bento-pad-lg flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
            <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">
              Get Started Today
            </span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight max-w-2xl">
            Create a memorial
            <br />
            <span className="text-[#8A7F74]">that lasts forever.</span>
          </h2>
          <p className="text-[#1A1614]/40 text-base leading-relaxed max-w-lg">
            A premium memorial ready in 24 hours. You provide the photos and documents —
            we take care of everything else.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={handleCreateClick}
              className="px-8 py-4 bg-[#8B0000] hover:bg-[#A00000] text-white font-medium text-sm rounded-[14px] transition-colors duration-200"
            >
              Create Memorial
            </button>
            <a
              href="/example"
              className="px-8 py-4 glass text-[#1A1614]/60 hover:text-[#1A1614] font-medium text-sm rounded-[14px] transition-colors duration-200 no-underline"
            >
              View Example
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
