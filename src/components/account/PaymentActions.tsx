'use client';

// "Complete payment" / "Cancel order" for an online order that hasn't been
// paid yet, plus a payment-status pill used across the order pages.

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useMessages } from '@/context/MessageContext';
import { apiFetch } from '@/lib/api';
import { rupees } from '@/lib/format';
import { payWithRazorpay } from '@/lib/razorpay';
import type { Order } from '@/lib/types';

export function paymentLabel(order: Pick<Order, 'payment_method' | 'payment_status'>): { text: string; tone: string } {
  const online = order.payment_method === 'razorpay';
  switch (order.payment_status) {
    case 'paid':
      return { text: online ? 'Paid online' : 'Paid (cash on delivery)', tone: 'fx-pill fx-pill-success' };
    case 'refunded':
      return { text: 'Refunded', tone: 'fx-pill fx-pill-info' };
    case 'failed':
      return { text: 'Payment failed', tone: 'fx-pill fx-pill-danger' };
    default:
      return online
        ? { text: 'Payment pending', tone: 'fx-pill fx-pill-warning' }
        : { text: 'Pay on delivery', tone: 'fx-pill' };
  }
}

export function PaymentPill({ order }: { order: Order }) {
  const { text, tone } = paymentLabel(order);
  return <span className={tone}>{text}</span>;
}

export default function PaymentActions({ order, onChange }: { order: Order; onChange?: (order: Order) => void }) {
  const { upsertOrder } = useAuth();
  const { refreshCart } = useCart();
  const { pushMessage } = useMessages();
  const [busy, setBusy] = useState<'pay' | 'cancel' | null>(null);

  if (!order.awaiting_payment) return null;

  const update = (o: Order) => {
    upsertOrder(o);
    onChange?.(o);
  };

  const pay = async () => {
    setBusy('pay');
    try {
      const fresh = await apiFetch<Order>(`/api/orders/${order.order_number}/pay/`, { method: 'POST' });
      if (!fresh.razorpay) throw new Error('Could not start the payment.');
      const outcome = await payWithRazorpay(order.order_number, fresh.razorpay);
      if (outcome.status === 'paid') {
        update(outcome.order);
        await refreshCart();
        pushMessage('Payment successful — your order is confirmed.', 'success');
      } else if (outcome.status === 'failed') {
        pushMessage(outcome.message, 'error');
        update({ ...order, payment_status: 'failed' });
      }
    } catch (err) {
      pushMessage(err instanceof Error ? err.message : 'Could not start the payment.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const cancel = async () => {
    if (!window.confirm(`Cancel order #${order.order_number}?`)) return;
    setBusy('cancel');
    try {
      update(await apiFetch<Order>(`/api/orders/${order.order_number}/cancel/`, { method: 'POST' }));
      pushMessage('Order cancelled.', 'success');
    } catch (err) {
      pushMessage(err instanceof Error ? err.message : 'Could not cancel this order.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <button type="button" className="fx-btn fx-btn-solid fx-btn-sm fx-btn-round" onClick={pay} disabled={busy !== null}>
        {busy === 'pay' ? 'Opening payment…' : `Complete payment · ${rupees(order.grand_total)}`}
      </button>
      <button type="button" className="fx-btn fx-btn-sm fx-btn-round" onClick={cancel} disabled={busy !== null}>
        {busy === 'cancel' ? 'Cancelling…' : 'Cancel order'}
      </button>
    </>
  );
}
