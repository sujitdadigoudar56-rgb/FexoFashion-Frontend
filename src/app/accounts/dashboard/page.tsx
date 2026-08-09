'use client';

// Ports templates/accounts/dashboard.html.

import Link from 'next/link';
import AccountSidebar from '@/components/account/AccountSidebar';
import RequireAuth from '@/components/account/RequireAuth';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function DashboardContent() {
  const { user, orders, addresses } = useAuth();
  const { items: wishlistItems } = useWishlist();

  return (
    <>
      <PageHeader eyebrow="Account" title={`Welcome, ${user?.first_name || user?.username}`} />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48 }}>
          <AccountSidebar active="dashboard" />
          <div>
            <div className="fx-cat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 50 }}>
              <div style={{ border: '1px solid var(--fx-line-soft)', padding: 28 }}>
                <div className="fx-serif" style={{ fontSize: 34 }}>{orders.length}</div>
                <div className="fx-muted" style={{ fontSize: 13, marginTop: 6 }}>Orders</div>
              </div>
              <div style={{ border: '1px solid var(--fx-line-soft)', padding: 28 }}>
                <div className="fx-serif" style={{ fontSize: 34 }}>{wishlistItems.length}</div>
                <div className="fx-muted" style={{ fontSize: 13, marginTop: 6 }}>Wishlist Items</div>
              </div>
              <div style={{ border: '1px solid var(--fx-line-soft)', padding: 28 }}>
                <div className="fx-serif" style={{ fontSize: 34 }}>{addresses.length}</div>
                <div className="fx-muted" style={{ fontSize: 13, marginTop: 6 }}>Saved Addresses</div>
              </div>
            </div>

            <h4 style={{ fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 20 }}>
              Recent Orders
            </h4>
            <table className="fx-table">
              <thead>
                <tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={4} className="fx-muted">No orders yet.</td></tr>
                )}
                {orders.slice(0, 5).map((order) => (
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
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
