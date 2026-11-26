import { ModalProvider } from '@/app/context/ModalContext';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';
import { NARROW, PAGE } from '@/components/ui/styles';

interface AuthShellProps {
  title: string;
  intro?: string;
  children: React.ReactNode;
}

/** Auth page scaffolding: canvas page with one centred white card in a narrow column. */
export const AuthShell = ({ title, intro, children }: AuthShellProps) => (
  <ModalProvider>
    <Header />
    <main id="main" className={`${PAGE} md:pt-32 md:pb-28`}>
      <div className={NARROW}>
        <div className="bg-white rounded-[24px] p-8 shadow-card flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="type-card-heading">{title}</h1>
            {intro && <p className="type-body text-muted">{intro}</p>}
          </div>
          {children}
        </div>
      </div>
    </main>
    <Footer />
    <CreateMemorialModal />
  </ModalProvider>
);
