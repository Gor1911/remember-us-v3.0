import Image from 'next/image';
import { LivingPortraitPlayer } from '@/components/memorial/LivingPortraitPlayer';
import type { MemorialView } from '@/components/memorial/profile/types';
import { SparkIcon } from '@/components/ui/icons';

const PANEL = 'bg-soft rounded-tile p-5 md:p-6';
const PANEL_TITLE = 'type-panel-heading';

/** The living portrait, framed at the top of the side column. */
export function ProfileLivingPortrait({ living, name }: { living: MemorialView['living']; name: string }) {
  if (!living) return null;
  return (
    <section id="living-portrait" aria-labelledby="living-title" className="bg-soft rounded-tile p-3 scroll-mt-6">
      <div className="relative aspect-[4/5] rounded-[14px] overflow-hidden bg-sand">
        <LivingPortraitPlayer
          src={living.src}
          altSrc={living.altSrc}
          poster={living.poster}
          label={`Living portrait of ${name}`}
          unoptimized={living.unoptimized}
          sizes="(min-width: 1024px) 280px, 100vw"
          className="object-cover object-[46%_center]"
        />
      </div>
      <div className="flex items-center gap-2 px-2 pt-3 pb-1">
        <SparkIcon className="w-5 h-5 text-bronze shrink-0" />
        <div>
          <h2 id="living-title" className="type-caption font-medium text-ink">Living portrait</h2>
          <p className="type-utility text-muted">AI-animated from a single photograph</p>
        </div>
      </div>
    </section>
  );
}

export function ProfileFacts({ facts }: { facts: MemorialView['facts'] }) {
  if (facts.length === 0) return null;
  return (
    <section aria-labelledby="facts-title" className={PANEL}>
      <h2 id="facts-title" className={PANEL_TITLE}>Remembering</h2>
      <dl className="mt-4 flex flex-col divide-y divide-ink/10">
        {facts.map((f) => (
          <div key={f.label} className="py-2.5 first:pt-0 last:pb-0">
            <dt className="type-caption text-muted">{f.label}</dt>
            <dd className="type-body text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** The code that opens this page — the same card as on the landing-page phone. */
export function ProfileQr({ qr }: { qr: MemorialView['qr'] }) {
  if (!qr) return null;
  return (
    <section aria-label="QR code for this memorial" className={`${PANEL} flex items-center gap-4`}>
      <div className="bg-white rounded-[14px] p-2 shrink-0">
        <Image
          src={qr.src}
          alt="QR code that opens this memorial"
          width={160}
          height={160}
          unoptimized={qr.unoptimized}
          className="w-[76px] h-[76px] [image-rendering:pixelated]"
        />
      </div>
      <div>
        <p className="type-body font-medium text-ink">Scan to open</p>
        <p className="type-caption text-muted">Private memorial · no app needed</p>
      </div>
    </section>
  );
}
