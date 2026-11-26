import type { Metadata } from 'next';
import { getGuestMemorial } from '@/app/lib/serverMemorial';

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

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { hash } = await params;
  // Same request as the page body (deduplicated by `cache`).
  const memorial = await getGuestMemorial(hash);
  if (memorial) {
    const name = [memorial.first_name, memorial.last_name].filter(Boolean).join(' ') || memorial.full_name;
    if (name) return { title: `In memory of ${name}`, robots: ROBOTS, ...GENERIC_SOCIAL };
  }
  return { title: 'Memorial', robots: ROBOTS, ...GENERIC_SOCIAL };
}

export default function MemorialLayout({ children }: Pick<LayoutProps, 'children'>) {
  return children;
}
