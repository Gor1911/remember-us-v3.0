import { ModalProvider } from '@/app/context/ModalContext';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { PLACEHOLDER_BODY, type LegalSection } from '@/components/legal/legalTypes';
import { EYEBROW, FOCUS, NOTICE_WARN, PAGE, TILE } from '@/components/ui/styles';

interface LegalPageProps {
  title: string;
  sections: LegalSection[];
}

/** Calm long-read for legal documents: a ~720px measure on the canvas. */
export const LegalPage = ({ title, sections }: LegalPageProps) => (
  <ModalProvider>
    <Header />
    <main id="main" className={`${PAGE} md:pt-32 md:pb-28`}>
      <div className="w-[min(100%-32px,720px)] mx-auto">
        <h1 className="type-heading">{title}</h1>
        <p className="mt-4 type-caption text-muted">Last updated: —</p>

        <div role="note" className={`${NOTICE_WARN} mt-8 font-medium`}>
          Draft — placeholder text. This document has not been reviewed by legal counsel and is not yet in effect.
        </div>

        <nav aria-label="Table of contents" className={`${TILE} mt-10`}>
          <h2 className={`${EYEBROW} mb-4`}>Contents</h2>
          <ol className="flex flex-col gap-2 list-decimal pl-5 marker:text-muted type-body">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`text-ink underline-offset-4 decoration-ink/30 hover:underline rounded-sm ${FOCUS}`}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-14 flex flex-col gap-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="type-card-heading">
                {i + 1}. {s.title}
              </h2>
              <p className="mt-3 type-body text-muted">{s.summary}</p>
              <p className="mt-3 type-body text-muted italic">{PLACEHOLDER_BODY}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
    <Footer />
    <CreateMemorialModal />
  </ModalProvider>
);
