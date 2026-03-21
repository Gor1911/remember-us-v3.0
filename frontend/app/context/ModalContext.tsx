'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ModalCtx {
  isCreateOpen: boolean;
  authRedirectTo: string;
  openCreate: () => void;
  closeCreate: () => void;
  handleCreateClick: () => void;
  openAuth: (redirectTo?: string) => void;
}

const ModalContext = createContext<ModalCtx>({
  isCreateOpen: false,
  authRedirectTo: '/memorial/new',
  openCreate: () => {},
  closeCreate: () => {},
  handleCreateClick: () => {},
  openAuth: () => {},
});

export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState('/memorial/new');
  const router = useRouter();

  const openCreate = useCallback(() => {
    setAuthRedirectTo('/memorial/new');
    setIsCreateOpen(true);
  }, []);

  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  // If already logged in → go straight to /memorial/new, else open modal
  const handleCreateClick = useCallback(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('access');
    if (token) {
      router.push('/memorial/new');
    } else {
      setAuthRedirectTo('/memorial/new');
      setIsCreateOpen(true);
    }
  }, [router]);

  // Open auth modal for plain sign-in (no redirect to /memorial/new)
  const openAuth = useCallback((redirectTo = '/') => {
    setAuthRedirectTo(redirectTo);
    setIsCreateOpen(true);
  }, []);

  return (
    <ModalContext.Provider value={{ isCreateOpen, authRedirectTo, openCreate, closeCreate, handleCreateClick, openAuth }}>
      {children}
    </ModalContext.Provider>
  );
}
