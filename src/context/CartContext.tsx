'use client';

// Thin wrapper over the real, server-persisted cart API (cart/views.py) —
// authenticated-only, per the confirmed decision (no guest/local cart
// path). The server response already carries subtotal/gst_total/
// shipping_cost/discount_amount/grand_total (same math as cart/models.py's
// Cart properties), so this context just holds and refreshes that
// response rather than recomputing anything client-side.

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { CartState } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useMessages } from './MessageContext';

const EMPTY_CART: CartState = {
  id: 0,
  items: [],
  subtotal: 0,
  gst_total: 0,
  shipping_cost: 0,
  discount_amount: 0,
  grand_total: 0,
  coupon_code: null,
};

interface CartContextValue {
  cart: CartState;
  /** Number of distinct products in the bag (adding the same product again
   *  raises its quantity, not this count). */
  itemCount: number;
  ready: boolean;
  /** Resolves to the updated bag, or null when nothing was added. */
  addItem: (productSlug: string, productName: string, quantity?: number, variantId?: number | null) => Promise<CartState | null>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  clearCartState: () => void;
  /** Re-read the bag from the server (e.g. after checking out only some items). */
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready: authReady } = useAuth();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      // Reacting to the sign-out signal from AuthContext, not deriving
      // state from a prop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart(EMPTY_CART);
      setReady(true);
      return;
    }
    // Signed in (again): the bag isn't ready until this user's cart loads.
    setReady(false);
    apiFetch<CartState>('/api/cart/')
      .then(setCart)
      .catch(() => setCart(EMPTY_CART))
      .finally(() => setReady(true));
  }, [authReady, isAuthenticated]);

  function requireAuth(): boolean {
    if (isAuthenticated) return true;
    pushMessage('Sign in to add items to your bag.', 'error');
    router.push('/accounts/login');
    return false;
  }

  const addItem: CartContextValue['addItem'] = async (productSlug, productName, quantity = 1, variantId = null) => {
    if (!requireAuth()) return null;
    const alreadyInBag = cart.items.some(
      (line) => line.product.slug === productSlug && (line.variant ?? null) === (variantId ?? null)
    );
    try {
      const updated = await apiFetch<CartState>(`/api/cart/add/${encodeURIComponent(productSlug)}/`, {
        method: 'POST',
        body: { quantity, variant: variantId },
      });
      setCart(updated);
      pushMessage(alreadyInBag ? `Updated quantity of ${productName} in your bag` : `Added ${productName} to bag`, 'success');
      return updated;
    } catch (err) {
      pushMessage(err instanceof Error ? err.message : 'Could not add this item to your bag.', 'error');
      return null;
    }
  };

  const updateQuantity: CartContextValue['updateQuantity'] = async (itemId, quantity) => {
    const updated = await apiFetch<CartState>(`/api/cart/update/${itemId}/`, { method: 'POST', body: { quantity } });
    setCart(updated);
  };

  const removeItem: CartContextValue['removeItem'] = async (itemId) => {
    const updated = await apiFetch<CartState>(`/api/cart/remove/${itemId}/`, { method: 'POST' });
    setCart(updated);
  };

  const applyCoupon: CartContextValue['applyCoupon'] = async (code) => {
    try {
      const updated = await apiFetch<CartState>('/api/cart/coupon/apply/', { method: 'POST', body: { code } });
      setCart(updated);
      pushMessage(`Coupon ${updated.coupon_code} applied`, 'success');
      return true;
    } catch (err) {
      pushMessage(err instanceof Error ? err.message : 'That coupon code is not valid', 'error');
      return false;
    }
  };

  // Called right after a successful checkout — the server cart is already
  // empty at that point (checkout clears it), so this just resets local
  // state without an extra round trip.
  const clearCartState = () => setCart(EMPTY_CART);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    try {
      setCart(await apiFetch<CartState>('/api/cart/'));
    } catch {
      // keep the current state; the next mutation will resync it
    }
  };

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: cart.items.length,
      ready,
      addItem,
      updateQuantity,
      removeItem,
      applyCoupon,
      clearCartState,
      refreshCart,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, ready]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
