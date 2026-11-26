import { getGuestMemorial } from '@/app/lib/serverMemorial';
import { MemorialPageClient } from '@/components/memorial/MemorialPageClient';

interface MemorialPageProps {
  params: Promise<{ hash: string }>;
}

/**
 * Server-rendered memorial: the guest version arrives as HTML, so the cover, portrait and story
 * paint without waiting for JavaScript and a second API round-trip. The owner's live version is
 * swapped in on the client (see MemorialPageClient).
 */
export default async function MemorialPage({ params }: MemorialPageProps) {
  const { hash } = await params;
  const initial = await getGuestMemorial(hash);
  return <MemorialPageClient slug={hash} initial={initial} />;
}
