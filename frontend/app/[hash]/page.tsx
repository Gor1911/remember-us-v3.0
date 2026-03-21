'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { MemorialPageDetail } from '@/app/lib/types';
import { MemorialHero } from '@/components/memorial/MemorialHero';
import { MemorialBio } from '@/components/memorial/MemorialBio';
import { MemorialGallery } from '@/components/memorial/MemorialGallery';
import { MemorialAwards, MemorialQr } from '@/components/memorial/MemorialAwards';
import { StateBadge } from '@/components/memorial/StateBadge';

type FetchState =
  | { status: 'loading' }
  | { status: 'found'; data: MemorialPageDetail }
  | { status: 'moderation'; state: string }
  | { status: 'not_found' };

async function fetchMemorial(slug: string): Promise<FetchState> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/v1/pages/${slug}/`, { headers });
    if (!res.ok) return { status: 'not_found' };
    const json = await res.json() as { success: boolean; data?: MemorialPageDetail };
    if (!json.success || !json.data) return { status: 'not_found' };

    const { state } = json.data;
    if (state === 'draft' || state === 'moderation') {
      return { status: 'moderation', state };
    }
    return { status: 'found', data: json.data };
  } catch {
    return { status: 'not_found' };
  }
}

// ─── Status screens ────────────────────────────────────────────────────────

function ModerationScreen({ state }: { state: string }) {
  const isDraft = state === 'draft';
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
        <span className="text-white/30 text-xs uppercase tracking-[0.15em]">
          {isDraft ? 'Draft' : 'Under Review'}
        </span>
      </div>

      <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6">
        {isDraft ? (
          <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-[#8B0000]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      <h1 className="text-white text-2xl font-semibold tracking-tight mb-3">
        {isDraft ? 'Memorial is a Draft' : 'Awaiting Moderation'}
      </h1>
      <p className="text-white/30 text-sm max-w-sm leading-relaxed mb-10">
        {isDraft
          ? 'This memorial has not been submitted for review yet. Submit it from your account to begin the approval process.'
          : 'This memorial has been submitted and is currently being reviewed by our team. It will become visible after approval, usually within 24 hours.'}
      </p>

      <Link
        href="/"
        className="px-6 py-2.5 text-white/40 hover:text-white text-sm transition-colors border border-white/[0.06] rounded-[12px] hover:border-white/[0.12]"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

function NotFoundScreen() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
        <span className="text-white/30 text-xs uppercase tracking-[0.15em]">Access Denied</span>
      </div>

      <h1 className="text-white text-2xl font-semibold tracking-tight mb-3">
        Memorial Not Found
      </h1>
      <p className="text-white/30 text-sm max-w-sm leading-relaxed mb-10">
        This memorial is private or does not exist.
        Access requires a personal QR code. If you received a link, please check it and try again.
      </p>

      <Link
        href="/"
        className="px-6 py-2.5 text-white/40 hover:text-white text-sm transition-colors border border-white/[0.06] rounded-[12px] hover:border-white/[0.12]"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MemorialPage() {
  const params = useParams();
  const hash = params?.hash as string;
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  useEffect(() => {
    if (!hash) return;
    fetchMemorial(hash).then(setState);
  }, [hash]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
      </div>
    );
  }

  if (state.status === 'not_found') return <NotFoundScreen />;
  if (state.status === 'moderation') return <ModerationScreen state={state.state} />;

  const memorial = state.data;

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">

      {/* State badge (only for owner preview of non-active) */}
      <div className="fixed top-4 right-4 z-50">
        <StateBadge state={memorial.state} />
      </div>

      <MemorialHero memorial={memorial} />
      <MemorialBio memorial={memorial} />
      <MemorialGallery mediaFiles={memorial.media_files} />

      {memorial.page_type === 'military' && memorial.military_awards.length > 0 && (
        <MemorialAwards awards={memorial.military_awards} />
      )}

      {memorial.qr_code && (
        <MemorialQr qrCode={memorial.qr_code} />
      )}

      <footer className="border-t border-white/[0.04]">
        <div className="site-container py-8 flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="text-white/20 text-xs tracking-tight">
              Remember <span className="text-white/10">US</span>
            </span>
          </Link>
          <p className="text-white/10 text-xs">Designed for Eternity. Built in USA.</p>
        </div>
      </footer>

    </div>
  );
}
