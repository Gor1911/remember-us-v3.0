'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useAuth } from '@/app/hooks/useAuth';
import { Header } from '@/components/landing/Header';
import { useDashboardData } from '@/components/dashboard/useDashboardData';
import { DashboardHeading } from '@/components/dashboard/DashboardHeading';
import { ModerationQueue } from '@/components/dashboard/ModerationQueue';
import { MemorialGroups } from '@/components/dashboard/MemorialGroups';
import { AccountSection } from '@/components/dashboard/AccountSection';
import { EmptyState } from '@/components/dashboard/EmptyState';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'admin';

  const data = useDashboardData(isAuthenticated, isAdmin);
  const { memorials, queue, fetching, error, actionError, busySlug } = data;

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated, router]);

  // Stagger cards in once data has loaded
  useEffect(() => {
    if (fetching || memorials.length === 0 || !listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.memorial-card', {
        opacity: 0, y: 20, duration: 0.6, ease: 'power2.out', stagger: 0.1, clearProps: 'all',
      });
    }, listRef);
    return () => ctx.revert();
  }, [fetching, memorials.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <span className="text-[#6B6560] text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1614]">
      <Header />

      <div className="site-container pt-28 pb-20 max-w-4xl mx-auto">
        <DashboardHeading
          user={user}
          total={memorials.length}
          active={memorials.filter((m) => m.state === 'active').length}
          inReview={memorials.filter((m) => m.state === 'moderation').length}
        />

        {(error || actionError) && (
          <p role="alert" className="text-[#8B0000] text-sm bg-[#8B0000]/[0.06] border border-[#8B0000]/15 rounded-[12px] px-4 py-3 mb-8">
            {actionError || error}
          </p>
        )}

        {isAdmin && !fetching && (
          <ModerationQueue
            items={queue}
            busySlug={busySlug}
            onApprove={data.approve}
            onReject={data.reject}
          />
        )}

        {fetching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-[24px] p-6 h-[180px] animate-pulse" />
            ))}
          </div>
        )}

        {!fetching && !error && memorials.length === 0 && <EmptyState />}

        {!fetching && memorials.length > 0 && (
          <div ref={listRef}>
            {isAdmin && (
              <h2 className="text-[#1A1614] font-bold text-xl tracking-tight mb-6">All memorials</h2>
            )}
            <MemorialGroups
              memorials={memorials}
              currentUserId={user?.id}
              showOwner={isAdmin}
              busySlug={busySlug}
              onSubmit={data.submit}
            />
          </div>
        )}

        {user && <AccountSection email={user.email} />}
      </div>
    </div>
  );
}
