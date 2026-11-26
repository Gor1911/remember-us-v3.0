import type { ReactNode } from 'react';
import { MemorialProfile } from '@/components/memorial/profile/MemorialProfile';
import type { MemorialView } from '@/components/memorial/profile/types';
import { NOTICE_ERROR } from '@/components/ui/styles';

interface PreviewStepProps {
  view: MemorialView;
  apiError: string;
  uploadStatus: string;
  /** Context line above the preview (e.g. what happens to a live page on save). */
  notice?: ReactNode;
}

/**
 * The last check before saving or paying: the memorial exactly as guests will see it,
 * rendered by the same component as the live page, in a framed window.
 */
export const PreviewStep = ({ view, apiError, uploadStatus, notice }: PreviewStepProps) => (
  <div className="flex flex-col gap-5">
    <div className="flex flex-col gap-2">
      <h2 className="type-card-heading text-ink">This is how guests will see it</h2>
      <p className="type-body text-muted">
        Read it through once. If something isn’t right, go back and change it — nothing is shared until it has
        been reviewed.
      </p>
    </div>

    {notice}

    <section
      aria-label="Memorial preview"
      className="rounded-tile overflow-hidden bg-white shadow-card ring-1 ring-ink/10"
    >
      <div className="flex items-center gap-2 px-4 h-10 bg-soft border-b border-ink/10" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-ink/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-ink/15" />
        <span className="ml-3 type-utility text-muted truncate">Preview — not yet shared</span>
      </div>
      <div className="max-h-[78vh] overflow-y-auto overscroll-contain" tabIndex={0} aria-label="Scrollable memorial preview">
        <MemorialProfile view={view} />
      </div>
    </section>

    {apiError && <p role="alert" className={`${NOTICE_ERROR} text-center`}>{apiError}</p>}
    {uploadStatus && (
      <div className="flex items-center gap-2 justify-center" role="status">
        <span className="w-4 h-4 border-2 border-ink/20 border-t-ink rounded-full animate-spin motion-reduce:animate-none" />
        <span className="type-caption text-muted">{uploadStatus}</span>
      </div>
    )}
  </div>
);
