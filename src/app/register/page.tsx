import { RegisterForm } from '@/components/auth/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Warranty Wallet',
  description: 'Create your Warranty Wallet account.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <RegisterForm />
    </div>
  );
}
