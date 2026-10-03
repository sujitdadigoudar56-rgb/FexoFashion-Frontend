'use client';

// Client-side sign-in gate for account/bag/checkout pages. Sends signed-out
// visitors to the login page and back here afterwards.

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

function Loading() {
  return (
    <div className="fx-container fx-route-loading" aria-busy="true">
      <div className="fx-skeleton bar" />
      <div className="fx-skeleton" style={{ height: 240 }} />
    </div>
  );
}

/** Renders children once the signed-in user's bag has loaded. */
export function WhenCartReady({ children }: { children: React.ReactNode }) {
  const { ready } = useCart();
  return ready ? <>{children}</> : <Loading />;
}

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(`/accounts/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, isAuthenticated, router, pathname]);

  if (!ready || !isAuthenticated) return <Loading />;
  return <>{children}</>;
}
