import { ModalProvider } from '@/app/context/ModalContext';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { CreateMemorialModal } from '@/components/landing/CreateMemorialModal';

interface AuthShellProps {
  title: string;
  intro?: string;
  children: React.ReactNode;
}

export const AuthShell = ({ title, intro, children }: AuthShellProps) => (
  <ModalProvider>
    <Header />
    <main className="bg-[#FAF8F5] min-h-screen pt-28 pb-24">
      <div className="site-container max-w-md">
        <h1 className="text-[#1A1614] font-bold text-3xl tracking-tight">{title}</h1>
        {intro && <p className="mt-3 text-muted text-base leading-relaxed">{intro}</p>}
        <div className="glass p-8 mt-8">{children}</div>
      </div>
    </main>
    <Footer />
    <CreateMemorialModal />
  </ModalProvider>
);
