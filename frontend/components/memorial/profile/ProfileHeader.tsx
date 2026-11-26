import Image from 'next/image';
import type { MemorialView } from '@/components/memorial/profile/types';
import { SparkIcon } from '@/components/ui/icons';
import { FOCUS } from '@/components/ui/styles';

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

/** Static round portrait overlapping the cover; initials when there is no photo. */
function ProfileAvatar({ view }: { view: MemorialView }) {
  const { portrait, name } = view;
  return (
    <div className="relative shrink-0 w-[148px] h-[148px] md:w-[208px] md:h-[208px] rounded-full bg-sand border-[3px] md:border-4 border-white shadow-float overflow-hidden">
      {portrait ? (
        <Image
          src={portrait.src}
          alt={`Portrait of ${name}`}
          fill
          priority
          unoptimized={portrait.unoptimized}
          sizes="208px"
          className={`object-cover ${portrait.position ?? 'object-center'}`}
        />
      ) : (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-display text-[46px] md:text-[64px] text-bronze-deep">
          {initials(name)}
        </span>
      )}
    </div>
  );
}

const CHIP = 'inline-flex items-center gap-1.5 rounded-full bg-white py-1.5 type-caption font-medium text-ink shadow-badge';

function ProfileChips({ view, className }: { view: MemorialView; className: string }) {
  if (!view.living && view.type !== 'military') return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {view.living && (
        <a href="#living-portrait" className={`${CHIP} pl-2.5 pr-3.5 no-underline ${FOCUS}`}>
          <SparkIcon className="w-[18px] h-[18px] text-bronze" />
          Living portrait
        </a>
      )}
      {view.type === 'military' && (
        <span className={`${CHIP} px-3.5`}>
          <span className="w-1.5 h-1.5 rounded-full bg-honor" aria-hidden="true" />
          Veteran
        </span>
      )}
    </div>
  );
}

/**
 * Full-bleed cover, round portrait and identity. Phones: identity stacked under the portrait
 * (as on the landing-page phone). Desktop: identity beside the portrait, like a profile header,
 * so no empty band is left next to the avatar.
 */
export function ProfileHeader({ view }: { view: MemorialView }) {
  const subtitle = [view.years, view.descriptor].filter(Boolean).join(' · ');

  return (
    <header>
      <div className="relative h-[180px] md:h-[280px] w-full overflow-hidden bg-sand">
        <Image src={view.cover.src} alt="" fill priority sizes="100vw" className={`object-cover ${view.cover.position}`} />
        {/* Dissolves into the white page, like the landing hero into the next chapter */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/40 to-transparent" />
      </div>

      <div className="content-1000">
        <div className="relative px-2 md:px-8 -mt-[74px] md:-mt-[104px] flex flex-col md:flex-row md:items-start gap-5 md:gap-8">
          <div className="flex items-end justify-between gap-3">
            <ProfileAvatar view={view} />
            <ProfileChips view={view} className="justify-end pb-1 md:hidden" />
          </div>

          {/* Desktop: starts just below the cover's edge, beside the portrait */}
          <div className="min-w-0 md:pt-[120px]">
            <p className="type-caption text-muted">In loving memory</p>
            <h1 className="type-footer-heading mt-1.5 text-balance">{view.name}</h1>
            {subtitle && <p className="type-support text-muted mt-2 tabular-nums">{subtitle}</p>}
            <ProfileChips view={view} className="hidden md:flex mt-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
