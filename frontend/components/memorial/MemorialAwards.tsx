'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MilitaryAward, QrCode } from '@/app/lib/types';

gsap.registerPlugin(ScrollTrigger);

// ─── Awards ───────────────────────────────────────────────────────────────────

interface MemorialAwardsProps {
  awards: MilitaryAward[];
}

export function MemorialAwards({ awards }: MemorialAwardsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.awards-label', {
        opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from('.award-card', {
        opacity: 0, y: 32, duration: 0.7, ease: 'power2.out', stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 82%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const sorted = [...awards].sort((a, b) => a.order - b.order);

  return (
    <section ref={sectionRef} className="border-t border-[#1A1614]/[0.08] bg-[#F0EDE8]">
      <div className="site-container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="awards-label flex items-center gap-2.5 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="text-muted text-[11px] uppercase tracking-[0.12em] font-medium">
              Military Awards
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((award) => (
              <div
                key={award.id}
                className="award-card glass rounded-[32px] p-6 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#8B0000]/10 border border-[#8B0000]/20 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B0000]" aria-hidden="true">
                    <path d="M8 2.5h8l-2 6h-4z" />
                    <circle cx="12" cy="15" r="5.5" />
                    <path d="M12 12l.9 1.9 2.1.3-1.5 1.5.35 2.1-1.85-1-1.85 1 .35-2.1-1.5-1.5 2.1-.3z" />
                  </svg>
                </div>
                <h3 className="text-[#1A1614] font-semibold text-sm">{award.name}</h3>
                {award.description && (
                  <p className="text-[#6B6560] text-xs leading-relaxed">{award.description}</p>
                )}
                {award.awarded_date && (
                  <p className="text-muted text-[10px] font-mono">
                    {new Date(award.awarded_date).getFullYear()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── QR Code ──────────────────────────────────────────────────────────────────

interface MemorialQrProps {
  qrCode: QrCode;
}

export function MemorialQr({ qrCode }: MemorialQrProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.qr-inner > *', {
        opacity: 0, y: 24, duration: 0.7, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 88%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="border-t border-[#1A1614]/[0.08] bg-[#FAF8F5]">
      <div className="site-container py-16 flex flex-col items-center gap-6 qr-inner">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
          <span className="text-muted text-[11px] uppercase tracking-[0.12em] font-medium">
            QR Access
          </span>
        </div>
        <div className="bg-white border border-[#1A1614]/[0.08] rounded-[32px] p-8 flex flex-col items-center gap-4">
          <Image
            src={qrCode.qr_url}
            alt="Memorial QR code"
            width={160}
            height={160}
            className="rounded-[12px]"
          />
          <p className="text-muted text-xs tracking-widest uppercase">
            Scan to open memorial
          </p>
          <p className="text-muted text-[10px]">
            Scanned {qrCode.scan_count} times
          </p>
        </div>
      </div>
    </section>
  );
}
