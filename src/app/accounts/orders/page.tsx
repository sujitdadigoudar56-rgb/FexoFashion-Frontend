'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import OrderCard from '@/components/account/OrderCard';
import { useAuth } from '@/context/AuthContext';
import type { OrderStatus } from '@/lib/types';

const TABS: { key: 'all' | OrderStatus | 'active'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];
const PAGE_SIZE = 5;

function Orders() {
  const { orders } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const q = query.trim().toLowerCase();
  const filtered = orders.filter((o) => {
    if (tab === 'active' && !['pending', 'confirmed', 'processing'].includes(o.status)) return false;
    if (tab !== 'all' && tab !== 'active' && o.status !== tab) return false;
    if (!q) return true;
    return o.order_number.toLowerCase().includes(q) || o.items.some((i) => i.product_name.toLowerCase().includes(q));
  });
  const numPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, numPages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <div className="fx-account-head">
        <h1 className="fx-h-title">My Orders</h1>
      </div>
      <div className="fx-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'fx-on' : undefined}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="fx-search-field">
        <Search size={16} aria-hidden />
        <input
          className="fx-control"
          placeholder="Search orders by item name or order number"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          aria-label="Search orders"
        />
      </div>

      {shown.length === 0 ? (
        <div className="fx-empty">
          <h3>{orders.length ? 'No orders match' : 'No orders yet'}</h3>
          <p>{orders.length ? 'Try another tab or search term.' : 'When you place an order it will appear here.'}</p>
          {!orders.length && <Link href="/shop" className="fx-btn fx-btn-solid fx-btn-round">Start shopping</Link>}
        </div>
      ) : (
        shown.map((order) => <OrderCard key={order.order_number} order={order} />)
      )}

      {numPages > 1 && (
        <nav className="fx-pagination" aria-label="Orders pagination">
          {current > 1 ? <button type="button" onClick={() => setPage(current - 1)}>Previous</button> : <span className="fx-disabled">Previous</span>}
          {Array.from({ length: numPages }, (_, i) => i + 1).map((p) =>
            p === current ? (
              <span key={p} className="fx-current" aria-current="page">{p}</span>
            ) : (
              <button key={p} type="button" onClick={() => setPage(p)}>{p}</button>
            )
          )}
          {current < numPages ? <button type="button" onClick={() => setPage(current + 1)}>Next</button> : <span className="fx-disabled">Next</span>}
        </nav>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <AccountLayout active="orders" crumbs={[{ label: 'My orders' }]}>
      <Orders />
    </AccountLayout>
  );
}
