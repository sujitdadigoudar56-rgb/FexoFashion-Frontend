'use client';

// Thin wrapper over the real, server-persisted wishlist API
// (wishlist/views.py) — authenticated-only, matching how the original
// Django app already gated wishlist behind @login_required. Stores full
// Product objects (not just ids) since GET /api/wishlist/ already
// returns them, so /wishlist/page.tsx can render straight from this
// context with no extra lookup.

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useMessages } from './MessageContext';

interface WishlistContextValue {
  items: Product[];
  ready: boolean;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productSlug: string, productName: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready: authReady } = useAuth();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      // Reacting to the sign-out signal from AuthContext, not deriving
      // state from a prop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      setReady(true);
      return;
    }
    apiFetch<Product[]>('/api/wishlist/')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setReady(true));
  }, [authReady, isAuthenticated]);

  const toggleWishlist: WishlistContextValue['toggleWishlist'] = async (productSlug, productName) => {
    if (!isAuthenticated) {
      pushMessage('Sign in to save items to your wishlist.', 'error');
      router.push('/accounts/login');
      return;
    }
    const data = await apiFetch<{ added: boolean; items: Product[] }>(
      `/api/wishlist/toggle/${encodeURIComponent(productSlug)}/`,
      { method: 'POST' }
    );
    setItems(data.items);
    pushMessage(data.added ? `Added ${productName} to wishlist` : `Removed ${productName} from wishlist`, 'success');
  };

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      ready,
      isWishlisted: (productId: number) => items.some((p) => p.id === productId),
      toggleWishlist,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, ready]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
