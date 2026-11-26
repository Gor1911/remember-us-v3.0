'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { pages } from '@/app/lib/api';
import type { MemorialPageDetail } from '@/app/lib/types';
import { useAuth } from '@/app/hooks/useAuth';
import { ArrowIcon, CheckIcon } from '@/components/ui/icons';
import {
  BTN_PRIMARY, BTN_SECONDARY, FOCUS, NARROW, NOTICE_ERROR, NOTICE_INFO, NOTICE_WARN, PAGE,
} from '@/components/ui/styles';
import { MemorialFormFlow } from '@/components/memorial-form/MemorialFormFlow';
import { useMemorialForm } from '@/components/memorial-form/useMemorialForm';
import { PREVIEW_STEP } from '@/components/memorial-form/formTypes';

const COLUMN = 'w-[min(100%-32px,720px)] mx-auto';
const WIDE = 'w-[min(100%-32px,1064px)] mx-auto';

/** What saving does to this memorial, in plain words. */
function saveNotice(page: MemorialPageDetail, isAdmin: boolean): string {
  if (isAdmin) return 'You are editing as an administrator: changes are saved without a new review.';
  const live = page.state === 'active' || page.has_published_version;
  if (live) {
    return 'Guests keep seeing the memorial as it is now. Your changes appear once they have been reviewed.';
  }
  if (page.state === 'moderation') return 'This memorial is waiting for review; the reviewer will see these changes.';
  return 'Changes are saved to your draft. Nothing is shared until it has been reviewed.';
}

export default function EditMemorialPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
  const f = useMemorialForm(isAdmin);
  const [page, setPage] = useState<MemorialPageDetail | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated, router]);

  const { load } = f;
  useEffect(() => {
    if (loading || !user || !slug) return;
    let alive = true;
    pages.get(slug).then((res) => {
      if (!alive) return;
      if (!res.success) { setLoadError('We couldn’t open this memorial. Check the link, or go back to your memorials.'); return; }
      if (res.data.owner.id !== user.id && user.role !== 'admin') {
        setLoadError('Only the person who created this memorial can change it.');
        return;
      }
      setPage(res.data);
      load(res.data);
    });
    return () => { alive = false; };
  }, [loading, user, slug, load]);

  const back = (
    <Link
      href="/dashboard"
      className={`inline-flex items-center gap-2 min-h-11 type-caption font-medium text-muted hover:text-ink transition-colors no-underline mb-6 rounded-sm ${FOCUS}`}
    >
      <ArrowIcon direction="left" className="w-4 h-4" /> My memorials
    </Link>
  );

  if (loadError) {
    return (
      <main id="main" className={PAGE}>
        <div className={NARROW}>
          {back}
          <p role="alert" className={NOTICE_ERROR}>{loadError}</p>
        </div>
      </main>
    );
  }

  if (loading || !page) {
    return (
      <main id="main" className="min-h-screen bg-canvas flex items-center justify-center">
        <span className="type-caption text-muted" role="status">Opening the memorial…</span>
      </main>
    );
  }

  const name = `${f.form.first_name} ${f.form.last_name}`.trim() || page.full_name;

  if (f.saved) {
    const live = page.state === 'active' || page.has_published_version;
    return (
      <main id="main" className={`${PAGE} flex items-center`}>
        <div className={`${NARROW} flex flex-col items-center gap-5 text-center`}>
          <span className="w-16 h-16 rounded-full bg-sage/10 text-sage flex items-center justify-center">
            <CheckIcon className="w-8 h-8" />
          </span>
          <h1 className="type-footer-heading text-ink text-balance">Changes saved</h1>
          <p className="type-body text-muted text-pretty">
            {isAdmin
              ? `${name}’s memorial is updated.`
              : live
                ? `Guests still see ${name}’s memorial as before. Your changes will appear once they have been reviewed.`
                : `${name}’s memorial is updated.`}
          </p>
          {f.saved.warning && <p role="alert" className={`${NOTICE_WARN} w-full text-left`}>{f.saved.warning}</p>}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/dashboard" className={BTN_PRIMARY}>Back to my memorials</Link>
            <Link href={`/${slug}`} className={BTN_SECONDARY}>Open the memorial</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className={PAGE}>
      <div className={f.step === PREVIEW_STEP ? WIDE : COLUMN}>
        {back}
        <h1 className="type-footer-heading text-ink mb-8 text-balance break-words">Edit {name}’s memorial</h1>
        <MemorialFormFlow
          f={f} mode="edit" isAdmin={isAdmin} slug={slug}
          previewNotice={<p className={NOTICE_INFO}>{saveNotice(page, isAdmin)}</p>}
        />
      </div>
    </main>
  );
}
