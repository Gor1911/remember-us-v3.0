import { ModalProvider } from '@/app/context/ModalContext';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { PLACEHOLDER_BODY, type LegalSection } from '@/components/legal/legalTypes';

interface LegalPageProps {
  title: string;
  sections: LegalSection[];
}

export const LegalPage = ({ title, sections }: LegalPageProps) => (
  <ModalProvider>
    <Header />
    <main className="bg-[#FAF8F5] min-h-screen pt-28 pb-24">
      <div className="site-container max-w-3xl">
        <h1 className="text-[#1A1614] font-bold text-3xl md:text-4xl tracking-tight">{title}</h1>
        <p className="mt-3 text-[#6B6560] text-[15px]">Last updated: —</p>

        <div
          role="note"
          className="mt-8 rounded-[24px] border-2 border-[#8B0000]/40 bg-[#8B0000]/[0.07] px-6 py-5 text-[#8B0000] text-base font-semibold leading-snug"
        >
          Draft — placeholder text. This document has not been reviewed by legal counsel and is not yet in effect.
        </div>

        <nav aria-label="Table of contents" className="glass rounded-[32px] p-6 mt-10">
          <h2 className="uppercase text-[#8A7F74] text-[11px] tracking-[0.12em] font-medium mb-4">Contents</h2>
          <ol className="flex flex-col gap-2 list-decimal pl-5 marker:text-[#8A7F74]">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-[#1A1614] text-[15px] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000] rounded"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 flex flex-col gap-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-[#1A1614] font-semibold text-xl tracking-tight">
                {i + 1}. {s.title}
              </h2>
              <p className="mt-3 text-[#6B6560] text-base leading-relaxed">{s.summary}</p>
              <p className="mt-3 text-[#6B6560] text-base leading-relaxed italic">{PLACEHOLDER_BODY}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
    <Footer />
    <CreateMemorialModal />
  </ModalProvider>
);
