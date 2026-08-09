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
  itemCount: number;
  ready: boolean;
  addItem: (productSlug: string, productName: string, quantity?: number, variantId?: number | null) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  clearCartState: () => void;
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
    if (!requireAuth()) return;
    const updated = await apiFetch<CartState>(`/api/cart/add/${encodeURIComponent(productSlug)}/`, {
      method: 'POST',
      body: { quantity, variant: variantId },
    });
    setCart(updated);
    pushMessage(`Added ${productName} to bag`, 'success');
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

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      ready,
      addItem,
      updateQuantity,
      removeItem,
      applyCoupon,
      clearCartState,
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
