'use client';

// Ports templates/orders/order_detail.html — fetched directly from the
// API (rather than looked up from AuthContext's in-memory orders list) so
// a direct visit/refresh works correctly too.

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import RequireAuth from '@/components/account/RequireAuth';
import PageHeader from '@/components/ui/PageHeader';
import { apiFetch } from '@/lib/api';
import type { Order } from '@/lib/types';

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function OrderDetailContent() {
  const params = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    apiFetch<Order>(`/api/orders/${params.orderNumber}/`)
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [params.orderNumber]);

  if (order === undefined) return null;

  if (!order) {
    return (
      <div className="fx-section" style={{ paddingTop: 150 }}>
        <div className="fx-container fx-center">
          <p className="fx-muted">Order not found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Order" title={order.order_number} />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ maxWidth: 800 }}>
          <p className="fx-muted" style={{ marginBottom: 24 }}>
            Status: <strong style={{ color: 'var(--fx-accent)' }}>{statusLabel(order.status)}</strong> &middot; Placed{' '}
            {formatDate(order.created_at)}
          </p>
          <table className="fx-table">
            <thead>
              <tr><th>Product</th><th>Size</th><th>Qty</th><th>Total</th></tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name}</td>
                  <td>{item.size || '—'}</td>
                  <td>{item.quantity}</td>
                  <td>&#8377;{item.unit_price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="fx-summary-box" style={{ marginTop: 30, maxWidth: 340, marginLeft: 'auto' }}>
            <div className="fx-summary-row"><span>Subtotal</span><span>&#8377;{order.subtotal}</span></div>
            <div className="fx-summary-row"><span>GST</span><span>&#8377;{order.gst_amount}</span></div>
            <div className="fx-summary-row"><span>Shipping</span><span>&#8377;{order.shipping_cost}</span></div>
            {order.discount_amount > 0 && (
              <div className="fx-summary-row"><span>Discount</span><span>-&#8377;{order.discount_amount}</span></div>
            )}
            <div className="fx-summary-row total"><span>Total</span><span>&#8377;{order.grand_total}</span></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <OrderDetailContent />
    </RequireAuth>
  );
}
