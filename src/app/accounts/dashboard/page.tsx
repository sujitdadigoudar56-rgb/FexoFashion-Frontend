'use client';

import Link from 'next/link';
import AccountLayout from '@/components/account/AccountLayout';
import OrderCard from '@/components/account/OrderCard';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

function Dashboard() {
  const { user, orders, addresses } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const thisYear = new Date().getFullYear();
  const deliveredThisYear = orders.filter((o) => o.status === 'delivered' && new Date(o.created_at).getFullYear() === thisYear).length;
  const defaultAddress = addresses.find((a) => a.is_default);

  return (
    <>
      <div className="fx-account-head">
        <div>
          <h1 className="fx-h-title">Welcome back, {user?.first_name || user?.username}</h1>
          <p>From your dashboard you can view recent activity and manage your account.</p>
        </div>
      </div>

      <div className="fx-stat-grid">
        <Link href="/accounts/orders" className="fx-stat">
          <small>Total orders</small>
          <strong>{orders.length}</strong>
          <span>{deliveredThisYear} delivered this year</span>
        </Link>
        <Link href="/wishlist" className="fx-stat">
          <small>Wishlist items</small>
          <strong>{wishlistItems.length}</strong>
          <span>Saved for later</span>
        </Link>
        <Link href="/accounts/addresses" className="fx-stat">
          <small>Saved addresses</small>
          <strong>{addresses.length}</strong>
          <span>{defaultAddress ? `Default: ${defaultAddress.city}` : 'No default set'}</span>
        </Link>
      </div>

      <div className="fx-account-head" style={{ marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'var(--fx-sans)', fontSize: 17, fontWeight: 600 }}>Recent orders</h2>
        {orders.length > 0 && (
          <Link href="/accounts/orders" className="fx-btn fx-btn-sm fx-btn-round">View all orders</Link>
        )}
      </div>
      {orders.length === 0 ? (
        <div className="fx-empty">
          <h3>No orders yet</h3>
          <p>When you place an order it will appear here.</p>
          <Link href="/shop" className="fx-btn fx-btn-solid fx-btn-round">Start shopping</Link>
        </div>
      ) : (
        orders.slice(0, 2).map((order) => <OrderCard key={order.order_number} order={order} maxLines={1} />)
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <AccountLayout active="dashboard">
      <Dashboard />
    </AccountLayout>
  );
}
