'use client';

// Ports templates/orders/order_success.html — fetched directly from the
// API so a refresh on this page still works.

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import RequireAuth from '@/components/account/RequireAuth';
import { apiFetch } from '@/lib/api';
import type { Order } from '@/lib/types';

function OrderSuccessContent() {
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
      <div className="fx-auth-wrap fx-center">
        <h1 className="fx-serif">Order Not Found</h1>
        <Link href="/accounts/orders" className="fx-btn fx-btn-solid">View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="fx-auth-wrap fx-center">
      <div className="fx-stars" style={{ fontSize: 34, marginBottom: 20 }}>&#10003;</div>
      <h1 className="fx-serif">Order Confirmed</h1>
      <p className="fx-sub">
        Order <strong>{order.order_number}</strong> has been placed successfully. You&apos;ll pay
        &#8377;{order.grand_total} via Cash on Delivery upon arrival.
      </p>
      <Link href="/accounts/orders" className="fx-btn fx-btn-solid">View My Orders</Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <RequireAuth>
      <OrderSuccessContent />
    </RequireAuth>
  );
}
