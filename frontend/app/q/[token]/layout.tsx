import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remember US',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false, noimageindex: true } },
  referrer: 'no-referrer',
};

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return children;
}
