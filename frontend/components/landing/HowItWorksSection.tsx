import { RevealSection } from '@/components/landing/RevealSection';
import { SWIPE_ITEM, SWIPE_ROW } from '@/components/ui/styles';

const STEPS = [
  {
    title: 'Tell their story',
    desc: 'Start a free draft with their name, dates, biography and the events of a life.',
  },
  {
    title: 'Add photographs',
    desc: 'Upload a main portrait and family photos to bring the memorial to life.',
  },
  {
    title: 'Choose a plan and submit',
    desc: 'A one-time payment sends your memorial to our team for review.',
  },
  {
    title: 'We review every memorial',
    desc: 'Our team checks each page before it goes live, usually within 24 hours of submission.',
  },
  {
    title: 'Receive your link and QR code',
    desc: 'Engrave it on a plaque or headstone. With Premium, your Living Portrait is ready within 24 hours of approval, once a clear portrait photo is provided.',
  },
];

/** Sand chapter: centred heading, then three instruction tiles above a wider pair. */
export function HowItWorksSection() {

  return (
    <RevealSection id="how-it-works" aria-labelledby="how-title" className="scroll-mt-16 bg-sand text-ink py-chapter">
      <div className="content-1000">
        <div className="text-center flex flex-col items-center">
          <h2 id="how-title" data-reveal className="type-heading max-w-[720px]">
            Five quiet steps
          </h2>
          <p data-reveal className="type-support text-muted max-w-[560px] mt-4">
            You write and choose the photographs. We review, publish and look after the rest.
          </p>
        </div>

        <ol className={`${SWIPE_ROW} md:grid-cols-6 gap-3 md:gap-4 mt-8 md:mt-12 list-none`} tabIndex={0} aria-label="Steps">
          {STEPS.map(({ title, desc }, i) => (
            <li
              key={title}
              data-reveal
              className={`${SWIPE_ITEM} bg-white rounded-tile p-6 flex flex-col gap-2 ${i < 3 ? 'md:col-span-2' : 'md:col-span-3'}`}
            >
              <span className="type-action text-bronze-deep tabular-nums mb-2">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="type-card-heading">{title}</h3>
              <p className="type-body text-muted">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </RevealSection>
  );
}
