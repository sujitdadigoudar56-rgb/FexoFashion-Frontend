'use client';

// Mimics Django's @login_required for the account pages — client-side
// only since there's no server session yet (PHASE 2: enforce this
// server-side once real auth exists).

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace('/accounts/login');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) return null;
  return <>{children}</>;
}
