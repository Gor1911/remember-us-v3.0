'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useAuth } from '@/app/hooks/useAuth';
import { ModalProvider } from '@/app/context/ModalContext';
import { Header } from '@/components/landing/Header';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { useDashboardData } from '@/components/dashboard/useDashboardData';
import { DashboardHeading } from '@/components/dashboard/DashboardHeading';
import { ModerationQueue } from '@/components/dashboard/ModerationQueue';
import { MemorialGroups } from '@/components/dashboard/MemorialGroups';
import { AccountSection } from '@/components/dashboard/AccountSection';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ReportsQueue } from '@/components/dashboard/ReportsQueue';
import { CheckoutCanceledNotice } from '@/components/dashboard/CheckoutCanceledNotice';
import { PlanSelectDialog } from '@/components/payments/PlanSelectDialog';
import { AccessDialog } from '@/components/access/AccessDialog';
import type { MemorialPageListItem } from '@/app/lib/types';
import { NOTICE_ERROR, PAGE } from '@/components/ui/styles';

const CONTAINER = 'w-[min(100%-32px,1120px)] mx-auto';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'admin';

  const [planPage, setPlanPage] = useState<MemorialPageListItem | null>(null);
  const [accessSlug, setAccessSlug] = useState<string | null>(null);

  const data = useDashboardData(isAuthenticated, isAdmin);
  const { memorials, queue, fetching, error, actionError, busySlug } = data;

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated, router]);

  // Stagger cards in once data has loaded
  useEffect(() => {
    if (fetching || memorials.length === 0 || !listRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.memorial-card', {
        opacity: 0, y: 20, duration: 0.6, ease: 'power2.out', stagger: 0.1, clearProps: 'all',
      });
    }, listRef);
    return () => ctx.revert();
  }, [fetching, memorials.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <span className="type-caption text-muted">Loading…</span>
      </div>
    );
  }

  return (
    <ModalProvider>
    <div className={PAGE}>
      <Header />

      <main id="main" className={`${CONTAINER} pt-4 md:pt-8`}>
        <DashboardHeading
          user={user}
          total={memorials.length}
          active={memorials.filter((m) => m.state === 'active').length}
          inReview={memorials.filter((m) => m.state === 'moderation').length}
        />

        <CheckoutCanceledNotice />

        {(error || actionError) && (
          <p role="alert" className={`${NOTICE_ERROR} mb-10`}>
            {actionError || error}
          </p>
        )}

        {isAdmin && !fetching && <ReportsQueue onPageChanged={data.refresh} />}

        {isAdmin && !fetching && (
          <ModerationQueue
            items={queue}
            busySlug={busySlug}
            onApprove={data.approve}
            onReject={data.reject}
          />
        )}

        {fetching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-tile h-[240px] animate-pulse" />
            ))}
          </div>
        )}

        {!fetching && !error && memorials.length === 0 && <EmptyState />}

        {!fetching && memorials.length > 0 && (
          <div ref={listRef}>
            {isAdmin && (
              <h2 className="type-card-heading text-ink mb-8">All memorials</h2>
            )}
            <MemorialGroups
              memorials={memorials}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              busySlug={busySlug}
              onSubmit={data.submit}
              onChoosePlan={setPlanPage}
              onAccess={setAccessSlug}
              onChanged={data.refresh}
            />
          </div>
        )}

        {user && <AccountSection email={user.email} />}
      </main>

      {planPage && (
        <PlanSelectDialog
          slug={planPage.slug}
          name={`${planPage.first_name} ${planPage.last_name}`}
          onClose={() => setPlanPage(null)}
          onAlreadyPaid={data.refresh}
        />
      )}
      {accessSlug && (
        <AccessDialog slug={accessSlug} onClose={() => setAccessSlug(null)} onSlugChanged={data.refresh} />
      )}
    </div>
    <CreateMemorialModal />
    </ModalProvider>
  );
}
