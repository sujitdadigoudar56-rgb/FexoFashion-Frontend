'use client';

// Real auth against the Django API (Token authentication) — see
// accounts/views.py and orders/views.py's CheckoutAPIView. The token is the
// only thing persisted client-side (localStorage, via lib/api.ts);
// user/addresses/orders are always fetched fresh from the server, never
// cached locally beyond this context's in-memory state.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, ApiError, clearToken, getToken, setToken } from '@/lib/api';
import type { Address, Order, PaymentMethod, User } from '@/lib/types';

export interface RegisterInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password1: string;
  password2: string;
  newsletter_opt_in: boolean;
}

export interface PlaceOrderInput {
  shippingAddressId: number;
  billingAddressId: number;
  notes: string;
  /** Cart line ids to buy; omit to buy the whole bag. */
  itemIds?: number[];
  paymentMethod: PaymentMethod;
}

export type AddressInput = Omit<Address, 'id'>;

export type ProfileInput = Partial<Pick<User, 'first_name' | 'last_name' | 'email' | 'phone' | 'date_of_birth'>>;

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  ready: boolean;
  addresses: Address[];
  orders: Order[];
  /** `identifier` is an email address, mobile number or username. */
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; errors: Record<string, string[]> }>;
  logout: () => void;
  updateProfile: (partial: ProfileInput) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addAddress: (address: AddressInput) => Promise<Address>;
  updateAddress: (id: number, partial: Partial<AddressInput>) => Promise<void>;
  removeAddress: (id: number) => Promise<void>;
  /** COD orders come back placed; online orders come back with
   *  `razorpay` checkout details and still awaiting payment. */
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  /** Replace one order in the in-memory list (after paying/cancelling). */
  upsertOrder: (order: Order) => void;
  refreshOrders: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** DRF validation body -> { field: [messages] } (non-field errors under "form"). */
export function fieldErrors(body: unknown): Record<string, string[]> {
  if (!body || typeof body !== 'object') return {};
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const field = key === 'detail' || key === 'non_field_errors' ? 'form' : key;
    out[field] = (Array.isArray(value) ? value : [value]).map(String);
  }
  return out;
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

  const login: AuthContextValue['login'] = async (identifier, password) => {
    try {
      const data = await apiFetch<{ token: string; user: User }>('/api/accounts/login/', {
        method: 'POST',
        body: { username: identifier, password },
        skipAuth: true,
      });
      setToken(data.token);
      await loadAccount();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Invalid email/mobile number or password.' };
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
      return { success: true, errors: {} };
    } catch (err) {
      const errors = err instanceof ApiError ? fieldErrors(err.body) : {};
      return {
        success: false,
        errors: Object.keys(errors).length ? errors : { form: ['Registration failed. Please try again.'] },
      };
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
    setUser(await apiFetch<User>('/api/accounts/me/', { method: 'PATCH', body: partial }));
  };

  const uploadAvatar: AuthContextValue['uploadAvatar'] = async (file) => {
    const form = new FormData();
    form.append('avatar', file);
    setUser(await apiFetch<User>('/api/accounts/me/avatar/', { method: 'POST', body: form }));
  };

  const changePassword: AuthContextValue['changePassword'] = async (currentPassword, newPassword) => {
    await apiFetch('/api/accounts/password/change/', {
      method: 'POST',
      body: { current_password: currentPassword, new_password: newPassword },
    });
  };

  const addAddress: AuthContextValue['addAddress'] = async (address) => {
    const created = await apiFetch<Address>('/api/accounts/addresses/', { method: 'POST', body: address });
    setAddresses((prev) =>
      created.is_default ? [...prev.map((a) => ({ ...a, is_default: false })), created] : [...prev, created]
    );
    return created;
  };

  const updateAddress: AuthContextValue['updateAddress'] = async (id, partial) => {
    const updated = await apiFetch<Address>(`/api/accounts/addresses/${id}/`, { method: 'PATCH', body: partial });
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? updated : updated.is_default ? { ...a, is_default: false } : a))
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
        ...(input.itemIds?.length ? { item_ids: input.itemIds } : {}),
        payment_method: input.paymentMethod,
      },
    });
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const upsertOrder = (order: Order) => {
    setOrders((prev) =>
      prev.some((o) => o.order_number === order.order_number)
        ? prev.map((o) => (o.order_number === order.order_number ? order : o))
        : [order, ...prev]
    );
  };

  const refreshOrders = async () => {
    setOrders(await apiFetch<Order[]>('/api/orders/'));
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
      uploadAvatar,
      changePassword,
      addAddress,
      updateAddress,
      removeAddress,
      placeOrder,
      upsertOrder,
      refreshOrders,
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
