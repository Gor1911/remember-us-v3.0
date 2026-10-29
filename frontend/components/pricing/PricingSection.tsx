'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useModal } from '@/app/context/ModalContext';
import { useAuth } from '@/app/hooks/useAuth';
import type { PackageType } from '@/app/lib/types';
import { PLANS, LIFETIME_FOOTNOTE } from '@/components/pricing/plans';
import { PlanCard } from '@/components/pricing/PlanCard';

gsap.registerPlugin(ScrollTrigger);

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { openAuth } = useModal();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 0.8 },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      });
      tl.from('.pricing-header', { opacity: 0, y: 40 })
        .from('.pricing-card', { opacity: 0, y: 40, stagger: 0.1 }, '-=0.5');
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const select = (id: PackageType) => {
    const target = `/memorial/new?package=${id}`;
    if (isAuthenticated || (typeof window !== 'undefined' && localStorage.getItem('access'))) {
      router.push(target);
    } else {
      openAuth(target);
    }
  };

  return (
    <section ref={sectionRef} id="pricing" className="scroll-mt-16 bg-[#F3F0EB] py-24 border-t border-[#1A1614]/[0.06]">
      <div className="site-container">
        <div className="pricing-header text-center mb-16">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="uppercase text-muted text-[11px] tracking-[0.12em] font-medium">Pricing</span>
          </div>
          <h2 className="text-[#1A1614] font-bold text-3xl md:text-4xl xl:text-5xl leading-[1.1] tracking-tight">
            One payment.
            <br />
            <span className="text-[#8A7F74]">No renewals.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={select} />
          ))}
        </div>

        <p className="text-muted text-center text-sm mt-10 max-w-xl mx-auto">{LIFETIME_FOOTNOTE}</p>
      </div>
    </section>
  );
}
