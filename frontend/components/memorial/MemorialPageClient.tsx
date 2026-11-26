'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MemorialPageDetail } from '@/app/lib/types';
import { pages } from '@/app/lib/api';
import { useAuthContext } from '@/app/context/AuthContext';
import { MemorialProfile } from '@/components/memorial/profile/MemorialProfile';
import { toMemorialView } from '@/components/memorial/profile/toMemorialView';
import { ReportButton } from '@/components/memorial/ReportButton';
import { StateBadge } from '@/components/memorial/StateBadge';
import { BTN_SM_DARK, FOCUS } from '@/components/ui/styles';
import { LoadingScreen, ModerationScreen, NotFoundScreen } from '@/components/memorial/MemorialStatusScreens';

interface MemorialPageClientProps {
  slug: string;
  /** Guest version rendered on the server; null when guests may not see this page. */
  initial: MemorialPageDetail | null;
}

/**
 * Shows the server-rendered guest version straight away. For a signed-in owner or admin it then
 * swaps in the live record (draft, edit in review) and adds the owner bar.
 */
export function MemorialPageClient({ slug, initial }: MemorialPageClientProps) {
  const { user, loading } = useAuthContext();
  const [live, setLive] = useState<MemorialPageDetail | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    let alive = true;
    pages.get(slug).then((res) => {
      if (!alive) return;
      if (res.success && (user.role === 'admin' || res.data.owner.id === user.id)) setLive(res.data);
      setChecked(true);
    });
    return () => { alive = false; };
  }, [loading, user, slug]);

  const memorial = live ?? initial;
  // A guest's answer is final once auth has settled; a signed-in user waits for their own fetch.
  const done = checked || (!loading && !user);
  if (!memorial) return done ? <NotFoundScreen /> : <LoadingScreen />;

  const privileged = !!live;
  if (memorial.state !== 'active' && !privileged) return <ModerationScreen state={memorial.state} />;

  return (
    <div className="min-h-screen bg-white text-ink">
      {privileged && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <StateBadge state={memorial.state} />
          <Link href={`/memorial/${memorial.slug}/edit`} className={`${BTN_SM_DARK} shadow-badge no-underline`}>
            Edit
          </Link>
        </div>
      )}
      {privileged && memorial.state !== 'active' && memorial.has_published_version && (
        <p className="bg-amber-deep/10 text-amber-deep type-caption text-center px-4 py-2.5">
          You’re seeing your latest changes. Guests see the approved version until these are reviewed.
        </p>
      )}

      <main id="main">
        <MemorialProfile view={toMemorialView(memorial)} />
      </main>

      {/* The brand stays quiet here: this page belongs to the family, not to us. */}
      <footer className="border-t border-ink/10">
        <div className="content-1000 py-6 flex items-center justify-between flex-wrap gap-x-6 gap-y-2">
          <p className="type-caption text-muted">
            Kept by{' '}
            <Link href="/" className={`text-muted hover:text-ink underline underline-offset-4 decoration-ink/20 rounded-sm ${FOCUS}`}>
              Remember US
            </Link>
          </p>
          <ReportButton slug={memorial.slug} />
        </div>
      </footer>
    </div>
  );
}
