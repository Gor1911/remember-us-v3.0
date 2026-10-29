'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { access } from '@/app/lib/api';

export default function QrResolvePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    access.resolveQr(token).then((res) => {
      if (cancelled) return;
      if (res.success && res.data.slug) router.replace(`/${res.data.slug}`);
      else setFailed(true);
    });
    return () => { cancelled = true; };
  }, [token, router]);

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-6 text-center">
      {failed ? (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
            <span className="text-muted text-[11px] uppercase tracking-[0.14em] font-medium">Remember US</span>
          </div>
          <h1 className="text-[#1A1614] font-bold text-3xl tracking-tight">This QR code is not active</h1>
          <p className="text-muted text-sm max-w-sm leading-relaxed">
            If you believe this is a mistake, please contact the family who shared it.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-white border border-[#1A1614]/10 text-muted hover:text-[#1A1614] text-sm rounded-[14px] transition-colors no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]"
          >
            ← Return to Remember US
          </Link>
        </div>
      ) : (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
          <span className="w-2 h-2 rounded-full bg-[#8B0000] animate-pulse motion-reduce:animate-none" aria-hidden="true" />
          <p className="text-muted text-sm">Opening memorial…</p>
        </div>
      )}
    </main>
  );
}
