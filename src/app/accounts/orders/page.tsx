'use client';

// Ports templates/accounts/orders.html.

import Link from 'next/link';
import AccountSidebar from '@/components/account/AccountSidebar';
import RequireAuth from '@/components/account/RequireAuth';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function OrdersContent() {
  const { orders } = useAuth();

  return (
    <>
      <PageHeader eyebrow="Account" title="My Orders" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48 }}>
          <AccountSidebar active="orders" />
          <table className="fx-table">
            <thead>
              <tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={4} className="fx-muted">No orders yet.</td></tr>
              )}
              {orders.map((order) => (
                <tr key={order.order_number}>
                  <td><Link href={`/orders/${order.order_number}`}>{order.order_number}</Link></td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>{statusLabel(order.status)}</td>
                  <td>&#8377;{order.grand_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}
