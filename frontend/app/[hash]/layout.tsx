import type { Metadata } from 'next';
import { API_BASE } from '@/app/lib/config';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ hash: string }>;
}

const ROBOTS = { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } } as const;

// Generic previews: link unfurlers must never reveal the person's name or photo.
const GENERIC_SOCIAL = {
  openGraph: {
    type: 'website' as const,
    title: 'A private memorial — Remember US',
    description: 'A private memorial shared with family and friends.',
  },
  twitter: {
    card: 'summary' as const,
    title: 'A private memorial — Remember US',
    description: 'A private memorial shared with family and friends.',
  },
};

interface MemorialEnvelope {
  success: boolean;
  data?: { first_name?: string; last_name?: string; full_name?: string };
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { hash } = await params;
  try {
    const res = await fetch(`${API_BASE}/pages/${encodeURIComponent(hash)}/`, { cache: 'no-store' });
    if (res.ok) {
      const json = (await res.json()) as MemorialEnvelope;
      if (json.success && json.data) {
        const { first_name, last_name, full_name } = json.data;
        const name = [first_name, last_name].filter(Boolean).join(' ') || full_name;
        if (name) return { title: `In Memory of ${name}`, robots: ROBOTS, ...GENERIC_SOCIAL };
      }
    }
  } catch {
    // fall through to generic title
  }
  return { title: 'Memorial', robots: ROBOTS, ...GENERIC_SOCIAL };
}

export default function MemorialLayout({ children }: Pick<LayoutProps, 'children'>) {
  return children;
}
