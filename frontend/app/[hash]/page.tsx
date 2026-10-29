'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { MemorialPageDetail } from '@/app/lib/types';
import { API_BASE } from '@/app/lib/config';
import { useAuthContext } from '@/app/context/AuthContext';
import { MemorialHero } from '@/components/memorial/MemorialHero';
import { MemorialBio } from '@/components/memorial/MemorialBio';
import { MemorialGallery } from '@/components/memorial/MemorialGallery';
import { MemorialAwards, MemorialQr } from '@/components/memorial/MemorialAwards';
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/pages/${slug}/`, { headers });
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
              Remember <span className="text-[#8A7F74]">US</span>
            </span>
          </Link>
          <p className="text-[#8A7F74] text-xs">Designed for Eternity. Built in USA.</p>
        </div>
      </footer>

    </div>
  );
}
