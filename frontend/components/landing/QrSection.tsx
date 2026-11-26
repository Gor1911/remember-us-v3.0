import Image from 'next/image';
import { CheckIcon, LockIcon } from '@/components/ui/icons';
import { RevealSection } from '@/components/landing/RevealSection';

const FACTS = ['Engraved on metal or stone', 'No app or password', 'Opens on any phone'];

/** Canvas chapter: the physical link as a real, scannable QR code, then one decisive reason to trust it. */
export function QrSection() {

  return (
    <RevealSection
      id="qr-access"
      aria-labelledby="qr-title"
      className="relative scroll-mt-16 bg-canvas text-ink py-chapter"
    >
      <div className="content-1000">
        <div className="flex flex-col items-center text-center">
          <h2 id="qr-title" data-reveal className="type-heading max-w-[720px]">
            A physical link to their story
          </h2>
          <p data-reveal className="type-support text-muted max-w-[560px] mt-4">
            Place the code on a headstone, a plaque or a frame at home. One scan opens the
            memorial on any screen.
          </p>
        </div>

        <div data-reveal className="flex justify-center mt-8 md:mt-10">
          <figure className="bg-white rounded-tile p-6 flex flex-col items-center gap-4 shadow-card">
            <Image
              src="/images/qr-example.svg"
              alt="Example QR code that opens the Remember US example memorial"
              width={29}
              height={29}
              unoptimized
              className="w-[168px] h-[168px] [image-rendering:pixelated]"
            />
            <figcaption className="type-caption text-muted">Scan to open the example</figcaption>
          </figure>
        </div>

        <ul data-reveal className="flex flex-wrap justify-center gap-x-8 gap-y-3 list-none mt-6">
          {FACTS.map((fact) => (
            <li key={fact} className="flex items-center gap-2 type-caption text-muted">
              <CheckIcon className="w-5 h-5 text-bronze" />
              {fact}
            </li>
          ))}
        </ul>

        {/* Reasoning panel */}
        <div
          data-reveal
          className="mt-12 md:mt-16 bg-sand rounded-tile p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12"
        >
          <div className="md:w-1/2 flex flex-col gap-6">
            <LockIcon className="w-9 h-9 text-bronze" />
            <p className="type-stat">
              A memorial that is <strong className="font-bold text-bronze-deep">never public</strong>
            </p>
          </div>
          <p className="md:w-1/2 type-support text-muted md:pt-[56px]">
            Search engines never index it and nobody can browse to it. It opens only through its
            QR code or private link — and our team reviews every memorial, and every later change,
            before anyone sees it.
          </p>
        </div>
      </div>
    </RevealSection>
  );
}
