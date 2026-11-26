'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useModal } from '@/app/context/ModalContext';
import { HeroPhone } from '@/components/landing/HeroPhone';
import { CheckIcon } from '@/components/ui/icons';

const TRUST = ['Never indexed by search', 'Reviewed by our team', 'One-time payment'];

/** Product-led opening: promise on the left, a memorial page on a phone on the right. */
export function HeroSection() {
  const { handleCreateClick } = useModal();

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-sand text-ink pt-[88px] md:pt-[104px] pb-16 md:pb-[80px] md:min-h-[760px]"
    >
      {/* Scene: golden-hour meadow (Unsplash License, see public/images/stock/CREDITS.md) */}
      <Image
        src="/images/stock/hero-meadow.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_60%]"
      />
      {/* Ivory wash: solid behind the copy, clear behind the device; dissolves into the next chapter */}
      <div aria-hidden="true" className="absolute inset-0 hero-wash" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-canvas/90 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-canvas to-transparent" />

      <div className="content-1000 relative grid md:grid-cols-[1.1fr_1fr] gap-14 md:gap-8 items-center">
        <div>
          <h1 id="hero-title" className="type-display max-w-[11ch]">
            Memory that lives on
          </h1>
          <p className="hero-in [--hero-delay:0.08s] type-support text-muted max-w-[420px] mt-5">
            Their story, their photographs and a portrait that gently comes to life — in one
            private place your family opens with a scan.
          </p>
          <div className="hero-in [--hero-delay:0.16s] flex flex-wrap items-center gap-3 mt-8">
            <button type="button" onClick={handleCreateClick} className="pill pill-dark">
              Create memorial
            </button>
            <Link href="/example" className="pill pill-soft">
              See an example
            </Link>
          </div>
          <ul className="hero-in [--hero-delay:0.24s] flex flex-wrap gap-x-5 gap-y-2 mt-8 list-none">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2 type-caption text-ink">
                <CheckIcon className="w-5 h-5 text-bronze shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-in [--hero-delay:0.2s] flex justify-center md:justify-end md:pr-4">
          <HeroPhone />
        </div>
      </div>
    </section>
  );
}
