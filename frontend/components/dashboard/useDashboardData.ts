'use client';

import { useCallback, useEffect, useState } from 'react';
import { pages } from '@/app/lib/api';
import type { ApiResponse, MemorialPageListItem } from '@/app/lib/types';

/** Loads the memorial list (and moderation queue for admins) plus workflow actions. */
export function useDashboardData(enabled: boolean, isAdmin: boolean) {
  const [memorials, setMemorials]     = useState<MemorialPageListItem[]>([]);
  const [queue, setQueue]             = useState<MemorialPageListItem[]>([]);
  const [fetching, setFetching]       = useState(true);
  const [error, setError]             = useState('');
  const [actionError, setActionError] = useState('');
  const [busySlug, setBusySlug]       = useState<string | null>(null);

  const load = useCallback(async () => {
    const [list, mod] = await Promise.all([
      pages.list(),
      isAdmin ? pages.moderationList() : Promise.resolve(null),
    ]);
    if (list.success) { setMemorials(list.data); setError(''); } else setError(list.error);
    if (mod?.success) setQueue(mod.data);
    else if (mod) setError(mod.error);
    setFetching(false);
  }, [isAdmin]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    if (enabled) void load();
  }, [enabled, load]);

  const run = useCallback(async <T,>(slug: string, call: () => Promise<ApiResponse<T>>) => {
    setBusySlug(slug);
    setActionError('');
    const res = await call();
    if (res.success) await load();
    else setActionError(res.error);
    setBusySlug(null);
    return res.success;
  }, [load]);

  return {
    memorials, queue, fetching, error, actionError, busySlug, refresh: load,
    submit:  (slug: string) => run(slug, () => pages.submit(slug)),
    approve: (slug: string) => run(slug, () => pages.approve(slug)),
    reject:  (slug: string, note: string) => run(slug, () => pages.reject(slug, note || undefined)),
  };
}
