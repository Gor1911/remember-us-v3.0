import { GalleryLightbox } from '@/components/memorial/GalleryLightbox';
import type { MemorialView } from '@/components/memorial/profile/types';
import { MedalIcon } from '@/components/ui/icons';

interface SectionTitleProps {
  id: string;
  title: string;
  meta?: string;
}

export function SectionTitle({ id, title, meta }: SectionTitleProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-5 md:mb-6">
      <h2 id={id} className="font-display font-medium text-[22px] md:text-[26px] leading-tight tracking-[-0.01em]">{title}</h2>
      {meta && <p className="type-caption text-muted tabular-nums">{meta}</p>}
    </div>
  );
}

/** Biography — the first paragraph a touch larger, like a book's opening line. */
export function ProfileStory({ story }: { story: MemorialView['story'] }) {
  if (story.length === 0) return null;
  return (
    <section aria-labelledby="story-title">
      <SectionTitle id="story-title" title="Their story" />
      <div className="flex flex-col gap-4 max-w-[640px]">
        {story.map((p, i) => (
          <p key={i} className={i === 0 ? 'type-support text-ink' : 'type-body text-ink'}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/** Life timeline — year, bronze dot on a hairline, event. */
export function ProfileTimeline({ timeline }: { timeline: MemorialView['timeline'] }) {
  if (timeline.length === 0) return null;
  return (
    <section aria-labelledby="life-title">
      <SectionTitle id="life-title" title="Life" />
      <ol className="list-none">
        {timeline.map((e, i) => (
          <li key={e.key} className="grid grid-cols-[48px_14px_1fr] md:grid-cols-[56px_14px_1fr] gap-x-3 pb-6 last:pb-0">
            <span className="type-caption text-muted tabular-nums text-right pt-[2px]">{e.year}</span>
            <span className="relative flex justify-center" aria-hidden="true">
              <span className="relative z-10 mt-[8px] w-2 h-2 rounded-full bg-bronze" />
              {i < timeline.length - 1 && <span className="absolute top-[20px] -bottom-6 w-px bg-ink/10" />}
            </span>
            <div className="min-w-0">
              <p className="font-display font-medium text-[17px] leading-snug">{e.title}</p>
              {e.description && <p className="type-caption text-muted mt-0.5">{e.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Family photos — square grid that opens the lightbox. Hidden when there are none. */
export function ProfilePhotos({ photos }: { photos: MemorialView['photos'] }) {
  if (photos.length === 0) return null;
  return (
    <section aria-labelledby="photos-title">
      <SectionTitle id="photos-title" title="Family photos" meta={`${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}`} />
      <GalleryLightbox photos={photos} />
    </section>
  );
}

/** Military honors — medal tiles in the main column (military memorials only). */
export function ProfileAwards({ awards }: { awards: MemorialView['awards'] }) {
  if (awards.length === 0) return null;
  return (
    <section aria-labelledby="awards-title">
      <SectionTitle id="awards-title" title="Military honors" meta={`${awards.length} ${awards.length === 1 ? 'award' : 'awards'}`} />
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none">
        {awards.map((a) => (
          <li key={a.key} className="bg-soft rounded-[16px] p-4 flex gap-3">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-white text-navy">
              <MedalIcon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="type-body font-medium text-ink leading-snug">
                {a.name}
                {a.year && <span className="text-muted font-normal tabular-nums"> · {a.year}</span>}
              </p>
              {a.description && <p className="type-caption text-muted">{a.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
