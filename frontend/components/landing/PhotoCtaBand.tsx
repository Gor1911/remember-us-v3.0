import Image from 'next/image';
import { RevealSection } from '@/components/landing/RevealSection';

const FADE_FROM = {
  sand: { section: 'bg-sand', veil: 'from-sand via-sand/60' },
  white: { section: 'bg-white', veil: 'from-white via-white/60' },
} as const;

interface PhotoCtaBandProps {
  /** id of the heading (the section is labelled by it). */
  titleId: string;
  title: string;
  /** Heading recipe; the landing uses the larger `type-heading`. */
  titleClassName?: string;
  eyebrow?: string;
  support?: string;
  /** Small qualification under the actions. */
  note?: string;
  /** Capsule actions. */
  children: React.ReactNode;
  /** Background of the chapter above, so the photo's top edge dissolves into it. */
  fadeFrom?: keyof typeof FADE_FROM;
}

/**
 * Closing conversion band. Bookends the page with the hero's meadow photograph, cropped to its upper
 * band (hazy sky, hill, sun); a soft light pool keeps the copy legible and the darker field at the
 * bottom dissolves into the ink footer. Used by the landing page and the example memorial.
 */
export function PhotoCtaBand({
  titleId, title, titleClassName = 'type-heading max-w-[720px]', eyebrow, support, note, children, fadeFrom = 'sand',
}: PhotoCtaBandProps) {
  const tone = FADE_FROM[fadeFrom];

  return (
    <RevealSection start="top 85%"
      aria-labelledby={titleId}
      className={`relative overflow-hidden ${tone.section} text-ink pt-20 pb-32 md:pt-[104px] md:pb-[168px]`}
    >
      {/* Unsplash License — see public/images/stock/CREDITS.md */}
      <Image src="/images/stock/hero-meadow.jpg" alt="" fill sizes="100vw" className="object-cover object-[62%_0%]" />
      <div aria-hidden="true" className="absolute inset-0 cta-pool" />
      {/* On top of the light pool, so the seam with the chapter above stays invisible */}
      <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-56 bg-gradient-to-b ${tone.veil} to-transparent`} />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ink to-transparent" />

      <div className="content-1000 relative flex flex-col items-center text-center">
        {eyebrow && <p data-reveal className="type-caption font-medium text-bronze-deep mb-4">{eyebrow}</p>}
        <h2 id={titleId} data-reveal className={`${titleClassName} text-balance`}>{title}</h2>
        {support && <p data-reveal className="type-support text-ink max-w-[460px] mt-4">{support}</p>}
        <div data-reveal className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
        {note && <p data-reveal className="type-caption text-ink mt-6 max-w-[480px]">{note}</p>}
      </div>
    </RevealSection>
  );
}
