'use client';

// Razorpay Checkout (https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/).
// The backend creates the Razorpay order and returns these options; the
// signed result goes back to the backend, which verifies it with Razorpay
// before the order is confirmed.

import { apiFetch } from './api';
import type { Order, RazorpayCheckout } from './types';

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', cb: (resp: { error?: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not in a browser'));
  if (window.Razorpay) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loading = null;
        reject(new Error('Could not load the payment window. Check your connection and try again.'));
      };
      document.body.appendChild(script);
    });
  }
  return loading;
}

export type PaymentOutcome =
  | { status: 'paid'; order: Order }
  | { status: 'dismissed' }
  | { status: 'failed'; message: string };

/** Open Razorpay Checkout for an order and settle the result with the
 *  backend. Resolves once the customer pays, closes the window, or the
 *  verification fails. */
export async function payWithRazorpay(orderNumber: string, checkout: RazorpayCheckout): Promise<PaymentOutcome> {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error('Payment window unavailable.');

  return new Promise<PaymentOutcome>((resolve) => {
    let settled = false;
    const finish = (outcome: PaymentOutcome) => {
      if (!settled) {
        settled = true;
        resolve(outcome);
      }
    };

    const rzp = new window.Razorpay!({
      key: checkout.key_id,
      order_id: checkout.razorpay_order_id,
      amount: checkout.amount,
      currency: checkout.currency,
      name: checkout.name,
      description: checkout.description,
      image: `${window.location.origin}/fexo-logo.jpg`,
      prefill: checkout.prefill,
      notes: { fexo_order: orderNumber },
      theme: { color: '#111111' },
      handler: async (resp: RazorpaySuccess) => {
        try {
          const order = await apiFetch<Order>(`/api/orders/${orderNumber}/verify-payment/`, { method: 'POST', body: resp });
          finish({ status: 'paid', order });
        } catch (err) {
          finish({ status: 'failed', message: err instanceof Error ? err.message : 'We could not confirm your payment.' });
        }
      },
      modal: {
        ondismiss: () => finish({ status: 'dismissed' }),
        confirm_close: true,
      },
    });

    rzp.on('payment.failed', (resp) => {
      // Razorpay keeps its window open so the customer can retry another
      // method; record the attempt but don't resolve yet.
      apiFetch(`/api/orders/${orderNumber}/payment-failed/`, { method: 'POST' }).catch(() => undefined);
      if (resp?.error?.description) console.warn('Razorpay payment failed:', resp.error.description);
    });

    rzp.open();
  });
}
