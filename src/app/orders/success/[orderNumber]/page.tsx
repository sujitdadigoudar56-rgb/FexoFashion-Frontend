'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { orderThumb } from '@/components/account/OrderCard';
import RequireAuth from '@/components/account/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { deliveryWindow, rupees } from '@/lib/format';
import type { Order } from '@/lib/types';

function OrderSuccess() {
  const params = useParams<{ orderNumber: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    apiFetch<Order>(`/api/orders/${params.orderNumber}/`)
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [params.orderNumber]);

  if (order === undefined) return <div className="fx-container fx-route-loading"><div className="fx-skeleton" style={{ height: 360 }} /></div>;
  if (!order) {
    return (
      <div className="fx-confirm">
        <div className="fx-empty">
          <h3>Order not found</h3>
          <Link href="/accounts/orders" className="fx-btn fx-btn-solid fx-btn-round">View my orders</Link>
        </div>
      </div>
    );
  }

  const a = order.shipping_address;

  return (
    <div className="fx-container">
      <div className="fx-confirm">
        <div className="fx-confirm-icon"><Check size={26} strokeWidth={2.5} aria-hidden /></div>
        <h1 className="fx-serif">Order Confirmed!</h1>
        <p className="fx-muted">Thank you for shopping with FEXO.</p>
        <p className="fx-confirm-meta">
          Order number: <b>#{order.order_number}</b>
          <br />
          Estimated delivery: <b>{deliveryWindow(order.created_at)}</b>
        </p>

        <section className="fx-panel fx-panel-pad">
          <h2 style={{ fontFamily: 'var(--fx-sans)', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Order details</h2>
          {order.items.map((item, i) => (
            <div key={i} className="fx-sum-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.product_image ?? orderThumb(item.product_name)} alt="" />
              <div>
                <strong>{item.product_name}</strong>
                <span>{[item.size && `Size: ${item.size}`, `Qty: ${item.quantity}`].filter(Boolean).join(' · ')}</span>
              </div>
              <b style={{ fontSize: 13 }}>{rupees(item.line_total ?? item.unit_price * item.quantity)}</b>
            </div>
          ))}
          <hr className="fx-divider" style={{ margin: '16px 0' }} />
          <div className="fx-field-row" style={{ fontSize: 12, lineHeight: 1.6 }}>
            <div>
              <p className="fx-label" style={{ fontSize: 10, color: 'var(--fx-muted)' }}>Shipping address</p>
              {a ? (
                <p>
                  {a.full_name}, {a.line1}
                  {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} – {a.postal_code}
                </p>
              ) : (
                <p>—</p>
              )}
            </div>
            <div>
              <p className="fx-label" style={{ fontSize: 10, color: 'var(--fx-muted)' }}>Payment method</p>
              <p>{order.payment_method === 'razorpay' ? `Paid online${order.razorpay_payment_id ? ` (${order.razorpay_payment_id})` : ''}` : 'Cash on delivery'}</p>
            </div>
          </div>
          <hr className="fx-divider" style={{ margin: '16px 0' }} />
          <div className="fx-summary-total" style={{ border: 'none', padding: 0, margin: 0 }}>
            <span>{order.payment_status === 'paid' ? 'Total paid' : order.payment_method === 'cod' ? 'Amount to pay on delivery' : 'Amount due'}</span>
            <strong>{rupees(order.grand_total)}</strong>
          </div>
        </section>

        <div className="fx-confirm-actions">
          <Link href={`/orders/${order.order_number}`} className="fx-btn fx-btn-solid fx-btn-round">Track order</Link>
          <Link href="/shop" className="fx-btn fx-btn-round">Continue shopping</Link>
        </div>
        {user?.email && <p className="fx-muted" style={{ fontSize: 12, marginTop: 18 }}>Your order is saved to your account ({user.email}).</p>}
        <p style={{ fontSize: 12, marginTop: 10 }}>
          Need to change something? <Link href="/contact" className="fx-link">Contact support</Link>
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <RequireAuth>
      <OrderSuccess />
    </RequireAuth>
  );
}
