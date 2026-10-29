import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot password',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      intro="Enter the email you registered with and we will send you a link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
