'use client';

import { ModalProvider } from '@/app/context/ModalContext';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { MemorialProfile } from '@/components/memorial/profile/MemorialProfile';
import { EXAMPLE_VIEW } from '@/components/example/exampleView';
import { ExampleCta } from '@/components/example/ExampleCta';

/** Public example — rendered by exactly the same components as a family's real memorial page. */
export default function ExamplePage() {
  return (
    <ModalProvider>
      <div className="min-h-screen bg-white text-ink">
        <Header />
        <div role="note" className="pt-16 bg-sand">
          <p className="content-1000 py-3 text-center type-caption text-ink">
            <span className="font-medium">Demonstration memorial</span> — the person, story and photographs are sample content for illustration.
          </p>
        </div>
        <main id="main">
          <MemorialProfile view={EXAMPLE_VIEW} />
          <ExampleCta />
        </main>
        <Footer />
      </div>
      <CreateMemorialModal />
    </ModalProvider>
  );
}
