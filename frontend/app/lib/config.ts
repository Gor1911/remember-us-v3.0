/** Base URL of the Django REST API (shared by client and server code). */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1';

/** Public origin of the site, e.g. https://example.com (no trailing slash). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
/** Host shown in front of memorial links ("example.com/"). */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

/** Media hosts that next.config's `images.remotePatterns` allows (keep the two lists in sync). */
const MEDIA_HOSTS = ['127.0.0.1', 'localhost', process.env.NEXT_PUBLIC_MEDIA_HOST].filter(Boolean) as string[];
const S3_MEDIA_HOST = process.env.NEXT_PUBLIC_S3_MEDIA_HOST || '';

/**
 * True when next/image may resize this URL (local files, backend /media/, the S3 bucket).
 * Object-URL previews and unknown hosts are served as they are.
 */
export function canOptimizeImage(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const u = new URL(src);
    if (S3_MEDIA_HOST && u.hostname === S3_MEDIA_HOST) return true;
    return MEDIA_HOSTS.includes(u.hostname) && u.pathname.startsWith('/media/');
  } catch {
    return false;
  }
}
