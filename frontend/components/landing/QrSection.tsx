'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ITEMS = ['Engraved on metal or stone', 'No login or password required', 'Works on any smartphone'];

export function QrSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.8 },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      tl.from('.qr-visual', { opacity: 0, y: 40 })
        .from('.qr-text', { opacity: 0, y: 40, stagger: 0.1 }, 0.1)
        .from('.qr-item', { opacity: 0, y: 40, stagger: 0.1 }, '-=0.5');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="qr-access" className="scroll-mt-16 bg-[#FAF8F5] py-24 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          <div className="qr-visual flex justify-center order-2 md:order-1">
            <div className="glass rounded-[32px] p-10 flex flex-col items-center gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#1A1614]/[0.08]">
                <Image
                  src="/images/qr-example.svg"
                  alt="Example QR code linking to the Remember US example memorial"
                  width={29} height={29} unoptimized
                  className="w-[145px] h-[145px] [image-rendering:pixelated]"
                />
              </div>
              <p className="text-[#1A1614]/40 text-xs tracking-widest uppercase">Scan to access</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 order-1 md:order-2">
            <div className="qr-text flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
              <span className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium">QR Access</span>
            </div>
            <h2 className="qr-text text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
              A physical link
              <br />
              <span className="text-[#8A7F74]">to digital memory.</span>
            </h2>
            <p className="qr-text text-[#1A1614]/50 text-base leading-relaxed max-w-md">
              The QR code is placed on a headstone, memorial plaque, or a frame at home.
              One scan — and the memorial opens on any screen.
            </p>
            <ul className="flex flex-col gap-3">
              {ITEMS.map((item) => (
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
