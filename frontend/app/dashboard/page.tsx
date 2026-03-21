'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useAuth } from '@/app/hooks/useAuth';

import { pages } from '@/app/lib/api';
import type { MemorialPageListItem, PageState } from '@/app/lib/types';
import { Header } from '@/components/landing/Header';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATE_LABEL: Record<PageState, string> = {
  draft:      'Draft',
  moderation: 'In Review',
  active:     'Active',
};

const STATE_COLOR: Record<PageState, string> = {
  draft:      'bg-white/[0.06] text-white/40',
  moderation: 'bg-amber-500/10 text-amber-400/80 border border-amber-500/20',
  active:     'bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).getFullYear().toString();
}

// ─── Memorial card ────────────────────────────────────────────────────────────

function MemorialCard({ page }: { page: MemorialPageListItem }) {
  return (
    <div className="memorial-card glass rounded-[24px] p-6 flex flex-col gap-4 hover:bg-white/[0.06] transition-colors duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
              {page.page_type === 'military' ? '⭐ Military' : '🕊 Civilian'}
            </span>
          </div>
          <h3 className="text-white font-semibold text-base leading-tight">
            {page.first_name} {page.last_name}
          </h3>
          <p className="text-white/30 text-xs font-mono">
            {formatDate(page.birth_date)} — {formatDate(page.death_date)}
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full ${STATE_COLOR[page.state]}`}>
          {STATE_LABEL[page.state]}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* Slug */}
      <div className="flex items-center gap-2">
        <span className="text-white/20 text-xs">remember.us/</span>
        <span className="text-white/50 text-xs font-mono">{page.slug}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <Link
          href={`/${page.slug}`}
          className="flex-1 py-2.5 text-center text-xs font-medium text-white/60 hover:text-white glass rounded-[12px] transition-colors no-underline"
        >
          View →
        </Link>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-2xl">
        🕊
      </div>
      <div>
        <p className="text-white/60 font-medium">No memorials yet</p>
        <p className="text-white/25 text-sm mt-1">Create your first memorial to get started</p>
      </div>
      <Link
        href="/memorial/new"
        className="px-6 py-3 bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium rounded-[14px] transition-colors no-underline"
      >
        Create Memorial
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [memorials, setMemorials] = useState<MemorialPageListItem[]>([]);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    pages.list().then((res) => {
      if (res.success) setMemorials(res.data);
      else setError(res.error);
      setFetching(false);
    });
  }, [isAuthenticated]);


  // Cards stagger — after data loads
  useEffect(() => {
    if (fetching || memorials.length === 0) return;
    gsap.set('.memorial-card', { opacity: 0, y: 20 });
    gsap.to('.memorial-card', {
      opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08, delay: 0.05,
    });
  }, [fetching, memorials]);

  const active     = memorials.filter((m) => m.state === 'active');
  const inReview   = memorials.filter((m) => m.state === 'moderation');
  const drafts     = memorials.filter((m) => m.state === 'draft');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <span className="text-white/30 text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Header />

      <div className="site-container pt-28 pb-20 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
              <span className="text-[#9BA4B5] text-[11px] uppercase tracking-[0.12em] font-medium">
                My Account
              </span>
            </div>
            <h1 className="text-white font-bold text-3xl tracking-tight">
              {user?.display_name ?? 'Dashboard'}
            </h1>
            {user?.email && (
              <p className="text-white/30 text-sm mt-1">{user.email}</p>
            )}
          </div>
          <Link
            href="/memorial/new"
            className="px-6 py-3 bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium rounded-[14px] transition-colors no-underline"
          >
            + New Memorial
          </Link>
        </div>

        {/* Stats row */}
        {memorials.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Total',     value: memorials.length },
              { label: 'Active',    value: active.length },
              { label: 'In Review', value: inReview.length },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-[20px] p-5 flex flex-col gap-1">
                <span className="text-white font-bold text-2xl">{value}</span>
                <span className="text-white/30 text-xs uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-[#8B0000] text-sm text-center py-8">{error}</p>
        )}

        {/* Loading skeleton */}
        {fetching && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-[24px] p-6 h-[180px] animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!fetching && !error && memorials.length === 0 && <EmptyState />}

        {/* Groups */}
        {!fetching && memorials.length > 0 && (
          <div className="flex flex-col gap-10">
            {active.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[#9BA4B5] text-[11px] uppercase tracking-widest font-medium">Active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {active.map((p) => <MemorialCard key={p.id} page={p} />)}
                </div>
              </section>
            )}
            {inReview.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                  <span className="text-[#9BA4B5] text-[11px] uppercase tracking-widest font-medium">In Review</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inReview.map((p) => <MemorialCard key={p.id} page={p} />)}
                </div>
              </section>
            )}
            {drafts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="text-[#9BA4B5] text-[11px] uppercase tracking-widest font-medium">Drafts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drafts.map((p) => <MemorialCard key={p.id} page={p} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
