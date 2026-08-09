'use client';

// Real auth against the Django API (Token authentication) — see
// accounts/views.py's RegisterAPIView/LoginAPIView/LogoutAPIView/MeAPIView
// and AddressListCreateAPIView/AddressDeleteAPIView, orders/views.py's
// CheckoutAPIView. The token is the only thing persisted client-side
// (localStorage, via lib/api.ts); user/addresses/orders are always
// fetched fresh from the server, never cached locally beyond this
// context's in-memory state.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, ApiError, clearToken, getToken, setToken } from '@/lib/api';
import type { Address, Order, User } from '@/lib/types';

interface RegisterInput {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password1: string;
  password2: string;
}

interface PlaceOrderInput {
  shippingAddressId: number;
  billingAddressId: number;
  notes: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  ready: boolean;
  addresses: Address[];
  orders: Order[];
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; errors: string[] }>;
  logout: () => void;
  updateProfile: (partial: Partial<Pick<User, 'first_name' | 'last_name' | 'email' | 'phone'>>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (id: number) => Promise<void>;
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function flattenErrors(body: unknown): string[] {
  if (body && typeof body === 'object') {
    return Object.values(body as Record<string, unknown>)
      .flat()
      .map((e) => String(e));
  }
  return [];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  async function loadAccount() {
    const [me, addressList, orderList] = await Promise.all([
      apiFetch<User>('/api/accounts/me/'),
      apiFetch<Address[]>('/api/accounts/addresses/'),
      apiFetch<Order[]>('/api/orders/'),
    ]);
    setUser(me);
    setAddresses(addressList);
    setOrders(orderList);
  }

  useEffect(() => {
    async function bootstrap() {
      if (getToken()) {
        try {
          await loadAccount();
        } catch {
          // Stale/invalid token — drop it and fall back to signed-out.
          clearToken();
        }
      }
      setReady(true);
    }
    bootstrap();
  }, []);

  const login: AuthContextValue['login'] = async (username, password) => {
    try {
      const data = await apiFetch<{ token: string; user: User }>('/api/accounts/login/', {
        method: 'POST',
        body: { username, password },
        skipAuth: true,
      });
      setToken(data.token);
      await loadAccount();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Invalid username or password.' };
    }
  };

  const register: AuthContextValue['register'] = async (input) => {
    try {
      const data = await apiFetch<{ token: string; user: User }>('/api/accounts/register/', {
        method: 'POST',
        body: input,
        skipAuth: true,
      });
      setToken(data.token);
      setUser(data.user);
      setAddresses([]);
      setOrders([]);
      return { success: true, errors: [] };
    } catch (err) {
      const errors = err instanceof ApiError ? flattenErrors(err.body) : [];
      return { success: false, errors: errors.length ? errors : ['Registration failed. Please try again.'] };
    }
  };

  const logout = () => {
    apiFetch('/api/accounts/logout/', { method: 'POST' }).catch(() => {});
    clearToken();
    setUser(null);
    setAddresses([]);
    setOrders([]);
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (partial) => {
    const updated = await apiFetch<User>('/api/accounts/me/', { method: 'PATCH', body: partial });
    setUser(updated);
  };

  const addAddress: AuthContextValue['addAddress'] = async (address) => {
    const created = await apiFetch<Address>('/api/accounts/addresses/', { method: 'POST', body: address });
    setAddresses((prev) =>
      created.is_default ? [...prev.map((a) => ({ ...a, is_default: false })), created] : [...prev, created]
    );
  };

  const removeAddress: AuthContextValue['removeAddress'] = async (id) => {
    await apiFetch(`/api/accounts/addresses/${id}/`, { method: 'DELETE' });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const placeOrder: AuthContextValue['placeOrder'] = async (input) => {
    const order = await apiFetch<Order>('/api/orders/checkout/', {
      method: 'POST',
      body: {
        shipping_address: input.shippingAddressId,
        billing_address: input.billingAddressId,
        notes: input.notes,
      },
    });
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      ready,
      addresses,
      orders,
      login,
      register,
      logout,
      updateProfile,
      addAddress,
      removeAddress,
      placeOrder,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, addresses, orders, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
