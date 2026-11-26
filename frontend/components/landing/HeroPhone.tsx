import Image from 'next/image';
import { SparkIcon } from '@/components/ui/icons';

const TIMELINE = [
  { year: '1938', text: 'Born in Dayton, Ohio' },
  { year: '1961', text: 'Married Tom Allen' },
  { year: '1975', text: 'Opened the school library' },
];

// Unsplash License — see public/images/stock/CREDITS.md
const GALLERY = [
  { src: '/images/stock/memory-street.jpg', pos: 'object-[45%_center]' },
  { src: '/images/stock/memory-photos.jpg', pos: 'object-[35%_center]' },
  { src: '/images/stock/memory-dandelions.jpg', pos: 'object-center' },
  { src: '/images/stock/memory-sunrise.jpg', pos: 'object-[60%_center]' },
  { src: '/images/stock/memory-tree.jpg', pos: 'object-[70%_center]' },
  { src: '/images/stock/hero-meadow.jpg', pos: 'object-[40%_70%]' },
];

/** Product object for the hero: a phone showing a memorial page, plus the QR that opens it. */
export function HeroPhone() {
  return (
    <div className="relative mx-auto w-fit" aria-label="Example of a memorial page on a phone" role="img">
      <div className="relative w-[256px] md:w-[290px] h-[528px] md:h-[600px] rounded-[50px] p-[9px] device-bezel inset-ring inset-ring-white/75 shadow-device">
        <div className="relative w-full h-full rounded-[42px] bg-white overflow-hidden flex flex-col" aria-hidden="true">
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[84px] h-[24px] rounded-full bg-ink z-10" />
          <div className="relative h-[132px] md:h-[150px] shrink-0">
            <Image src="/images/stock/memory-tree.jpg" alt="" fill sizes="290px" className="object-cover object-[60%_40%]" />
            <span className="absolute left-5 -bottom-[34px] grid place-items-center w-[68px] h-[68px] rounded-full bg-sand border-4 border-white font-display text-[22px] text-bronze-deep">
              MA
            </span>
          </div>
          <div className="px-5 pt-11">
            <p className="text-[11px] text-muted">In loving memory</p>
            <p className="font-display font-medium text-[21px] leading-tight text-ink">Margaret Allen</p>
            <p className="text-[11px] text-muted mt-0.5">1938 – 2021 · Teacher, mother, gardener</p>
          </div>
          <div className="px-5 mt-4 flex flex-col gap-2.5">
            {TIMELINE.map((e, i) => (
              <div key={e.year} className={`items-center gap-2.5 text-[11px] text-ink ${i === 2 ? 'hidden md:flex' : 'flex'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-bronze shrink-0" />
                <span className="text-muted tabular-nums">{e.year}</span>
                {e.text}
              </div>
            ))}
          </div>
          <div className="px-5 pb-5 mt-auto">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[12px] font-medium text-ink">Family photos</p>
              <p className="text-[11px] text-muted">9</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {GALLERY.map(({ src, pos }) => (
                <span key={src} className="relative aspect-square rounded-[10px] overflow-hidden bg-sand">
                  <Image src={src} alt="" fill sizes="80px" className={`object-cover ${pos}`} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating results: what the family gets */}
      <div className="absolute -right-6 md:-right-20 top-[150px] md:top-[170px] bg-white/95 backdrop-blur rounded-full pl-2.5 pr-4 py-2 flex items-center gap-2 shadow-float">
        <SparkIcon className="w-5 h-5 text-bronze" />
        <span className="type-caption text-ink font-medium">Living portrait ready</span>
      </div>

      <div className="absolute -left-10 md:-left-24 bottom-14 md:bottom-20 bg-white rounded-tile p-3 pr-4 flex items-center gap-3 shadow-float">
        <Image
          src="/images/qr-example.svg"
          alt=""
          width={29}
          height={29}
          unoptimized
          priority
          className="w-14 h-14 md:w-16 md:h-16 [image-rendering:pixelated]"
        />
        <div>
          <p className="type-caption text-ink font-medium">Scan to open</p>
          <p className="type-utility text-muted">Private · no app</p>
        </div>
      </div>
    </div>
  );
}
