import { BookIcon, LockIcon, PhotoIcon } from '@/components/ui/icons';
import { RevealSection } from '@/components/landing/RevealSection';
import { SWIPE_ITEM, SWIPE_ROW } from '@/components/ui/styles';

const FEATURES = [
  {
    Icon: LockIcon,
    title: 'Private by default',
    desc: 'Never listed, never searchable. The memorial opens only through its personal QR code or private link.',
  },
  {
    Icon: BookIcon,
    title: 'Their life, in order',
    desc: 'A biography and timeline that keeps the dates, places and moments of a life in one calm sequence.',
  },
  {
    Icon: PhotoIcon,
    title: 'Every photograph',
    desc: 'Bring family albums together in one gallery, so the faces and places are never lost again.',
  },
];

/** Sand chapter: centred promise above three white tiles. */
export function FeaturesSection() {

  return (
    <RevealSection id="features" aria-labelledby="features-title" className="scroll-mt-16 bg-sand text-ink py-chapter">
      <div className="content-1000">
        <div className="text-center flex flex-col items-center">
          <h2 id="features-title" data-reveal className="type-heading max-w-[720px]">
            Everything their story needs
          </h2>
          <p data-reveal className="type-support text-muted max-w-[560px] mt-4">
            Words, dates and photographs, kept together in a place your family can return to —
            and nobody else can find.
          </p>
        </div>

        <ul className={`${SWIPE_ROW} md:grid-cols-3 gap-3 md:gap-4 mt-8 md:mt-12 list-none`} tabIndex={0} aria-label="Features">
          {FEATURES.map(({ Icon, title, desc }) => (
            <li key={title} data-reveal className={`${SWIPE_ITEM} bg-white rounded-tile p-6 flex flex-col gap-2`}>
              <Icon className="w-8 h-8 text-bronze mb-3" />
              <h3 className="type-card-heading">{title}</h3>
              <p className="type-body text-muted">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </RevealSection>
  );
}
