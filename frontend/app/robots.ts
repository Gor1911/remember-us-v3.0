import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Note: robots.txt is a courtesy for crawlers, NOT access control.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/example'],
      disallow: ['/dashboard', '/memorial/', '/api/', '/terms', '/privacy'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
