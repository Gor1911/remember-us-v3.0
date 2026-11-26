'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrIcon } from '@/components/ui/icons';
import { LINK } from '@/components/ui/styles';
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
    <main id="main" className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center px-4 py-16 text-center">
      {failed ? (
        <div className="w-full max-w-[440px] bg-white rounded-[24px] p-8 shadow-card flex flex-col items-center gap-5">
          <span className="grid place-items-center w-14 h-14 rounded-full bg-soft text-bronze" aria-hidden="true">
            <QrIcon className="w-7 h-7" />
          </span>
          <h1 className="type-card-heading text-balance">This memorial can’t be opened right now</h1>
          <p className="type-body text-muted text-pretty">
            The family may have paused this code, or the memorial is still being prepared. If you know the
            family, they can check it from their account.
          </p>
          <Link href="/" className={`type-caption mt-1 ${LINK}`}>What is Remember US?</Link>
        </div>
      ) : (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
          <span className="w-2 h-2 rounded-full bg-bronze animate-pulse motion-reduce:animate-none" aria-hidden="true" />
          <p className="type-caption text-muted">Opening the memorial…</p>
        </div>
      )}
    </main>
  );
}
