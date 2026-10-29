import type { Metadata } from 'next';

const DESCRIPTION =
  'Explore a demonstration memorial: a living animated portrait, biography timeline and photo gallery. Sample content for illustration.';

export const metadata: Metadata = {
  title: 'Example Memorial',
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: '/example' },
  openGraph: {
    type: 'website',
    url: '/example',
    title: 'Example Memorial — Remember US',
    description: DESCRIPTION,
    images: [{ url: '/images/arlington.jpg' }],
  },
  twitter: { card: 'summary_large_image', title: 'Example Memorial — Remember US', description: DESCRIPTION },
};

export default function ExampleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
