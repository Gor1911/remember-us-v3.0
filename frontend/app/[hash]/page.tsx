'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { MemorialPageDetail } from '@/app/lib/types';
import { pages } from '@/app/lib/api';
import { useAuthContext } from '@/app/context/AuthContext';
import { MemorialHero } from '@/components/memorial/MemorialHero';
import { MemorialBio } from '@/components/memorial/MemorialBio';
import { MemorialGallery } from '@/components/memorial/MemorialGallery';
import { MemorialAwards, MemorialQr } from '@/components/memorial/MemorialAwards';
import { ReportButton } from '@/components/memorial/ReportButton';
import { StateBadge } from '@/components/memorial/StateBadge';
import {
  ModerationScreen,
  NotFoundScreen,
  LoadingScreen,
} from '@/components/memorial/MemorialStatusScreens';

type FetchState =
  | { status: 'loading' }
  | { status: 'found'; data: MemorialPageDetail }
  | { status: 'moderation'; state: string }
  | { status: 'not_found' };

async function fetchMemorial(slug: string): Promise<FetchState> {
  const res = await pages.get(slug);
  // Hidden, deleted and unknown pages all come back as 404 — show the generic not-found screen.
  if (!res.success) return { status: 'not_found' };
  const { state } = res.data;
  if (state === 'draft' || state === 'moderation') return { status: 'moderation', state };
  return { status: 'found', data: res.data };
}

export default function MemorialPage() {
  const params = useParams();
  const hash = params?.hash as string;
  const { user } = useAuthContext();
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  useEffect(() => {
    if (!hash) return;
    fetchMemorial(hash).then(setState);
  }, [hash]);

  if (state.status === 'loading') return <LoadingScreen />;
  if (state.status === 'not_found') return <NotFoundScreen />;
  if (state.status === 'moderation') return <ModerationScreen state={state.state} />;

  const memorial = state.data;
  const canSeeState = !!user && (user.role === 'admin' || user.id === memorial.owner.id);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1614]">

      {canSeeState && (
        <div className="fixed top-20 right-4 z-50">
          <StateBadge state={memorial.state} />
        </div>
      )}

      <MemorialHero memorial={memorial} />
      <MemorialBio memorial={memorial} />
      <MemorialGallery mediaFiles={memorial.media_files} />

      {memorial.page_type === 'military' && memorial.military_awards.length > 0 && (
        <MemorialAwards awards={memorial.military_awards} />
      )}

      {memorial.qr_code && (
        <MemorialQr qrCode={memorial.qr_code} />
      )}

      <footer className="border-t border-[#1A1614]/[0.08] bg-[#F3F0EB]">
        <div className="site-container py-8 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="text-[#1A1614] text-xs tracking-tight font-medium">
              Remember <span className="text-muted">US</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <ReportButton slug={memorial.slug} />
            <p className="text-muted text-xs">Designed for Eternity. Built in USA.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
