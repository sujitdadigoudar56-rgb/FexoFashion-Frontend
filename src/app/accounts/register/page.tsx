import type { Metadata } from 'next';
import AuthLayout from '@/components/account/AuthLayout';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = { title: 'Create Account' };

export default function RegisterPage() {
  return (
    <AuthLayout caption="Atelier Minimalist" subcaption="Timeless silhouettes, quietly made">
      <RegisterForm />
    </AuthLayout>
  );
}
