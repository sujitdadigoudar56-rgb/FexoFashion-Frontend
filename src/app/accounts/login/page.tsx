import type { Metadata } from 'next';
import AuthLayout from '@/components/account/AuthLayout';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <AuthLayout caption="The New Season" subcaption="Considered menswear, made to last">
      <LoginForm />
    </AuthLayout>
  );
}
