import { ProfileHeader } from '@/components/memorial/profile/ProfileHeader';
import { ProfileAwards, ProfilePhotos, ProfileStory, ProfileTimeline } from '@/components/memorial/profile/ProfileSections';
import { ProfileFacts, ProfileLivingPortrait, ProfileQr } from '@/components/memorial/profile/ProfileAside';
import type { MemorialView } from '@/components/memorial/profile/types';

interface MemorialProfileProps {
  view: MemorialView;
}

/**
 * The memorial page body, in the style of the landing-page phone: full-bleed cover, round
 * portrait, identity, then story / life / honors / family photos, with the living portrait,
 * facts and QR in the side column.
 *
 * Phones read top to bottom in DOM order: living portrait → story → life → honors → photos →
 * facts. The QR panel is desktop-only — on a phone the visitor has just scanned it.
 * From lg, explicit grid placement moves the portrait and the facts into the right column.
 *
 * No scroll reveal here: a memorial is read, often printed or opened in an in-app browser after
 * a scan, and its words should simply be there.
 */
export function MemorialProfile({ view }: MemorialProfileProps) {
  return (
    <div className="bg-white text-ink">
      <ProfileHeader view={view} />

      <div className="content-1000 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[auto_1fr] gap-y-12 lg:gap-x-16 lg:gap-y-4 pt-8 md:pt-12 pb-20 md:pb-28">
        {view.living && (
          <div className="w-full max-w-[360px] mx-auto lg:max-w-none lg:col-start-2 lg:row-start-1">
            <ProfileLivingPortrait living={view.living} name={view.name} />
          </div>
        )}

        <div className="flex flex-col gap-14 md:gap-16 min-w-0 px-2 md:px-8 lg:pr-0 lg:col-start-1 lg:row-start-1 lg:row-span-2">
          <ProfileStory story={view.story} />
          <ProfileTimeline timeline={view.timeline} />
          <ProfileAwards awards={view.awards} />
          <ProfilePhotos photos={view.photos} />
        </div>

        <aside
          className="flex flex-col gap-4 lg:col-start-2 lg:row-start-2 lg:sticky lg:top-8 self-start w-full"
          aria-label="Details"
        >
          <ProfileFacts facts={view.facts} />
          <div className="hidden lg:block">
            <ProfileQr qr={view.qr} />
          </div>
        </aside>
      </div>
    </div>
  );
}
