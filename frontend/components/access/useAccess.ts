'use client';

import { useCallback, useEffect, useState } from 'react';
import { access as accessApi } from '@/app/lib/api';
import type { ApiResponse, PageAccess } from '@/app/lib/types';

/** Loads the link/QR state for a page and runs the access actions. */
export function useAccess(initialSlug: string, onSlugChanged: () => void) {
  const [slug, setSlug] = useState(initialSlug);
  const [data, setData] = useState<PageAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void accessApi.get(initialSlug).then((res) => {
      if (!alive) return;
      if (res.success) setData(res.data); else setError(res.error);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [initialSlug]);

  const run = useCallback(async (key: string, call: (s: string) => Promise<ApiResponse<PageAccess>>) => {
    if (busy) return false;
    setBusy(key);
    setError('');
    const res = await call(slug);
    if (res.success) {
      setData(res.data);
      if (res.data.slug && res.data.slug !== slug) { setSlug(res.data.slug); onSlugChanged(); }
    } else {
      setError(res.error);
    }
    setBusy(null);
    return res.success;
  }, [busy, slug, onSlugChanged]);

  const downloadQr = useCallback(async (format: 'png' | 'svg') => {
    if (busy) return;
    setBusy(`download-${format}`);
    setError('');
    const res = await accessApi.downloadQr(slug, format);
    if (res.success) {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remember-us-qr-${slug}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } else {
      setError(res.error);
    }
    setBusy(null);
  }, [busy, slug]);

  return {
    data, loading, error, busy, downloadQr,
    rotateLink: () => run('rotate-link', accessApi.rotateLink),
    generateQr: () => run('generate', accessApi.generateQr),
    disableQr: () => run('disable', accessApi.disableQr),
    enableQr: () => run('enable', accessApi.enableQr),
    rotateQr: () => run('rotate-qr', accessApi.rotateQr),
  };
}
