'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, AUTH_EXPIRED_EVENT } from '@/app/lib/api';
import type { User } from '@/app/lib/types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, display_name: string, accept_terms: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    const token = typeof window !== 'undefined' && localStorage.getItem('access');
    if (!token) { setUser(null); setLoading(false); return; }
    const res = await auth.me();
    if (res.success) {
      setUser(res.data);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial session bootstrap
  useEffect(() => { fetchMe(); }, [fetchMe]);

  // Session could not be refreshed — drop the user so guards redirect
  useEffect(() => {
    const onExpired = () => { setUser(null); setLoading(false); };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const res = await auth.login(email, password);
    if (!res.success) {
      setError(res.error);
      setLoading(false);
      return false;
    }
    await fetchMe();
    return true;
  }, [fetchMe]);

  const register = useCallback(async (email: string, password: string, display_name: string, accept_terms: boolean) => {
    setLoading(true);
    setError(null);
    const res = await auth.register({ email, password, display_name, accept_terms });
    if (!res.success) {
      setError(res.error ?? null);
      setLoading(false);
      return false;
    }
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
