
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Warrity',
  description: 'Log in to your Warrity account.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 sm:p-8">
      <div className="text-center mb-10">
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
          shop small
        </h1>
        <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
          win big!
        </h1>
      </div>
      <LoginForm />
    </div>
  );
}
