import Link from 'next/link';
import { PortraitVideo } from '@/components/landing/PortraitVideo';
import { RevealSection } from '@/components/landing/RevealSection';
import { ClockIcon, PhotoIcon, SparkIcon } from '@/components/ui/icons';

const POINTS = [
  { Icon: PhotoIcon, text: 'Made from one clear photograph you already have' },
  { Icon: SparkIcon, text: 'Subtle, natural movement — eyes, breath, expression' },
  { Icon: ClockIcon, text: 'Ready within 24 hours of approval, with Premium' },
];

/** Canvas chapter. Desktop: framed living portrait left, promise and action right. Phones: stacked. */
export function LivingPortraitSection() {

  return (
    <RevealSection
      id="living-portrait"
      aria-labelledby="lp-title"
      className="relative scroll-mt-16 bg-canvas text-ink overflow-hidden py-chapter"
    >
      {/* Warm light behind the portrait */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 md:left-[34%] bottom-[-160px] md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-[1100px] md:w-[820px] h-[640px] -translate-x-1/2 rounded-[50%] glow-bronze blur-[48px]"
      />

      <div className="content-1000 relative grid md:grid-cols-[auto_1fr] items-center gap-10 md:gap-16">
        {/* Framed portrait, like a photograph on the mantelpiece */}
        <figure data-reveal className="order-last md:order-none flex flex-col items-center">
          <div className="bg-white rounded-[16px] p-1.5 md:p-2 shadow-frame">
            <div className="relative w-[260px] h-[325px] md:w-[340px] md:h-[425px] rounded-[12px] overflow-hidden bg-sand">
              <PortraitVideo className="absolute inset-0 w-full h-full object-cover object-[46%_center]" />
            </div>
          </div>
          <figcaption className="mt-4 flex items-center gap-2 type-caption text-ink">
            <SparkIcon className="w-5 h-5 text-bronze" />
            AI-animated from one photograph · demo
          </figcaption>
        </figure>

        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h2 id="lp-title" data-reveal className="type-heading max-w-[520px] text-balance">
            A portrait that looks back
          </h2>
          <p data-reveal className="type-support text-muted max-w-[460px] mt-4">
            From a single photograph, their eyes move and their expression softens — gently,
            as if they were in the room with you.
          </p>
          <ul data-reveal className="flex flex-col gap-3 mt-6 list-none text-left">
            {POINTS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 type-body text-ink">
                <Icon className="w-6 h-6 text-bronze shrink-0" />
                {text}
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-8">
            <Link href="/example" className="pill pill-dark">See it in a memorial</Link>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
