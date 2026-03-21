'use client';

// Re-export from shared AuthContext so all components share one auth state instance
export { useAuthContext as useAuth } from '@/app/context/AuthContext';
