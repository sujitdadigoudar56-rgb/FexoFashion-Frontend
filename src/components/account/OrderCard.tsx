'use client';

// One order as a card: header (number, date, status) and its lines with
// image, size/colour/qty, and actions.

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useMessages } from '@/context/MessageContext';
import { formatDate, ORDER_STATUS_LABEL, rupees, statusTone } from '@/lib/format';
import PaymentActions, { PaymentPill } from './PaymentActions';
import type { Order } from '@/lib/types';

export function orderThumb(name: string) {
  return `https://placehold.co/160x200/0e0e0e/8a8a8a?text=${encodeURIComponent(name.slice(0, 12))}`;
}

export default function OrderCard({ order, maxLines }: { order: Order; maxLines?: number }) {
  const { addItem } = useCart();
  const { pushMessage } = useMessages();
  const [busy, setBusy] = useState(false);
  const lines = maxLines ? order.items.slice(0, maxLines) : order.items;
  const more = order.items.length - lines.length;

  // "Buy again" re-adds every line that still exists in the catalogue.
  const buyAgain = async () => {
    setBusy(true);
    let added = 0;
    for (const item of order.items) {
      if (item.product_slug && (await addItem(item.product_slug, item.product_name, item.quantity))) added += 1;
    }
    setBusy(false);
    if (added > 1) pushMessage(`Added ${added} items from ${order.order_number} to your bag`, 'success');
    if (!added) pushMessage('These items are no longer available.', 'error');
  };

  return (
    <div className="fx-order-card">
      <div className="fx-order-card-head">
        <div>
          <small>Order number</small>
          <strong>#{order.order_number}</strong>
        </div>
        <div>
          <small>Date placed</small>
          <strong>{formatDate(order.created_at)}</strong>
        </div>
        <div>
          <small>Total</small>
          <strong>{rupees(order.grand_total)}</strong>
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <PaymentPill order={order} />
          <span className={statusTone(order.status)}>{order.awaiting_payment ? 'Awaiting payment' : ORDER_STATUS_LABEL[order.status] ?? order.status}</span>
        </span>
      </div>
      {lines.map((item, i) => (
        <div key={`${item.product_slug}-${i}`} className="fx-order-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fx-order-thumb" src={item.product_image ?? orderThumb(item.product_name)} alt="" />
          <div className="fx-order-line-info">
            <strong>{item.product_name}</strong>
            <span>
              {[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`, `Qty: ${item.quantity}`].filter(Boolean).join('  |  ')}
            </span>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{rupees(item.line_total ?? item.unit_price * item.quantity)}</div>
          </div>
          {i === 0 && (
            <div className="fx-order-actions">
              <PaymentActions order={order} />
              <Link href={`/orders/${order.order_number}`} className="fx-btn fx-btn-solid fx-btn-sm fx-btn-round">
                View details
              </Link>
              {(order.status === 'delivered' || order.status === 'cancelled') && (
                <button type="button" className="fx-btn fx-btn-sm fx-btn-round" onClick={buyAgain} disabled={busy}>
                  {busy ? 'Adding…' : 'Buy again'}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
      {more > 0 && (
        <div className="fx-order-line" style={{ fontSize: 12, color: 'var(--fx-muted)' }}>
          + {more} more item{more === 1 ? '' : 's'} in this order
        </div>
      )}
    </div>
  );
}
