// Server-only: imported by server components and generateMetadata, never by client code.
import { cache } from 'react';
import { API_BASE } from '@/app/lib/config';
import type { ApiResponse, MemorialPageDetail } from '@/app/lib/types';

/**
 * The guest version of a memorial, fetched on the server without credentials.
 * `cache` makes the layout's metadata and the page share one API request per render.
 * Returns null for anything a guest may not see (404) or on a network failure.
 */
export const getGuestMemorial = cache(async (slug: string): Promise<MemorialPageDetail | null> => {
  try {
    const res = await fetch(`${API_BASE}/pages/${encodeURIComponent(slug)}/`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<MemorialPageDetail>;
    return json.success ? json.data : null;
  } catch {
    return null;
  }
});
