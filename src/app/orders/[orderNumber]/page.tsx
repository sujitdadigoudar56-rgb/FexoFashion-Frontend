'use client';

import { Check } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountLayout from '@/components/account/AccountLayout';
import { AddressLines } from '@/components/account/AddressForm';
import { orderThumb } from '@/components/account/OrderCard';
import PaymentActions, { PaymentPill } from '@/components/account/PaymentActions';
import { apiFetch } from '@/lib/api';
import { deliveryWindow, formatDate, ORDER_STATUS_LABEL, rupees, statusTone } from '@/lib/format';
import type { Order } from '@/lib/types';

const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
const STEP_LABEL: Record<(typeof FLOW)[number], string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  processing: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

function Timeline({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return <p className="fx-form-error" style={{ marginBottom: 0 }}>This order was cancelled.</p>;
  }
  const reached = FLOW.indexOf(order.status as (typeof FLOW)[number]);
  return (
    <ol className="fx-timeline">
      {FLOW.map((step, i) => {
        const done = i <= reached;
        const note =
          i === 0
            ? formatDate(order.created_at, true)
            : i === reached
              ? 'Current status'
              : step === 'delivered' && !done
                ? `Expected ${deliveryWindow(order.created_at)}`
                : done
                  ? 'Completed'
                  : 'Pending';
        return (
          <li key={step} className={done ? 'done' : undefined}>
            <span className="fx-timeline-dot">{done && <Check size={13} strokeWidth={3} aria-hidden />}</span>
            <div>
              <strong>{STEP_LABEL[step]}</strong>
              <span>{note}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetail() {
  const params = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    apiFetch<Order>(`/api/orders/${params.orderNumber}/`)
      .then(setOrder)
      .catch(() => setOrder(null));
  }, [params.orderNumber]);

  if (order === undefined) return <div className="fx-skeleton" style={{ height: 320 }} aria-busy="true" />;
  if (!order) {
    return (
      <div className="fx-empty">
        <h3>Order not found</h3>
        <p>We couldn&apos;t find that order on your account.</p>
        <Link href="/accounts/orders" className="fx-btn fx-btn-solid fx-btn-round">View my orders</Link>
      </div>
    );
  }

  const units = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <div className="fx-account-head">
        <div>
          <h1 className="fx-h-title">Order #{order.order_number}</h1>
          <p>Placed on {formatDate(order.created_at, true)} &nbsp;|&nbsp; {units} item{units === 1 ? '' : 's'}</p>
        </div>
        <span style={{ display: 'flex', gap: 6 }}>
          <PaymentPill order={order} />
          <span className={statusTone(order.status)}>{order.awaiting_payment ? 'Awaiting payment' : ORDER_STATUS_LABEL[order.status] ?? order.status}</span>
        </span>
      </div>

      {order.awaiting_payment && (
        <div className="fx-notice" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <span>This order isn&apos;t confirmed yet — complete the payment to confirm it.</span>
          <span style={{ display: 'flex', gap: 8 }}>
            <PaymentActions order={order} onChange={setOrder} />
          </span>
        </div>
      )}

      <div className="fx-field-row" style={{ gap: 20, alignItems: 'start', marginBottom: 20 }}>
        <section className="fx-panel fx-panel-pad">
          <h2 style={{ fontFamily: 'var(--fx-sans)', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Delivery timeline</h2>
          <Timeline order={order} />
        </section>
        <section className="fx-panel fx-panel-pad" style={{ background: 'var(--fx-secondary)', border: 'none' }}>
          <h2 style={{ fontFamily: 'var(--fx-sans)', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Need help with this order?</h2>
          <p className="fx-muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            {order.status === 'delivered'
              ? 'Something not right? Our team can help with returns and exchanges.'
              : `Estimated delivery: ${deliveryWindow(order.created_at)}. We'll update this page as your order moves.`}
          </p>
          <Link href="/contact" className="fx-btn fx-btn-solid fx-btn-sm fx-btn-round">Contact support</Link>
          <p style={{ marginTop: 14, fontSize: 12 }}>
            <Link href="/returns" className="fx-link">Returns &amp; exchanges policy</Link>
          </p>
        </section>
      </div>

      <section className="fx-panel" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--fx-sans)', fontSize: 15, fontWeight: 600, padding: '20px 18px 4px' }}>Items ordered</h2>
        {order.items.map((item, i) => (
          <div key={i} className="fx-order-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="fx-order-thumb" src={item.product_image ?? orderThumb(item.product_name)} alt="" />
            <div className="fx-order-line-info">
              {item.product_slug ? (
                <Link href={`/shop/${item.product_slug}`}><strong>{item.product_name}</strong></Link>
              ) : (
                <strong>{item.product_name}</strong>
              )}
              <span>{[item.size && `Size: ${item.size}`, item.color && `Colour: ${item.color}`, `Qty: ${item.quantity}`].filter(Boolean).join('  |  ')}</span>
            </div>
            <strong>{rupees(item.line_total ?? item.unit_price * item.quantity)}</strong>
          </div>
        ))}
      </section>

      <div className="fx-field-row" style={{ gap: 20, alignItems: 'start' }}>
        <div>
          <section className="fx-panel fx-panel-pad fx-address-card" style={{ marginBottom: 20 }}>
            <h2 className="fx-label" style={{ marginBottom: 10 }}>Delivery address</h2>
            {order.shipping_address ? <AddressLines a={order.shipping_address} /> : <p>Not available</p>}
          </section>
          <section className="fx-panel fx-panel-pad">
            <h2 className="fx-label" style={{ marginBottom: 10 }}>Payment method</h2>
            <p style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="fx-pill">{order.payment_method === 'razorpay' ? 'Online' : 'COD'}</span>
              {order.payment_method === 'razorpay' ? 'Online payment (Razorpay)' : 'Cash on delivery'}
              <PaymentPill order={order} />
            </p>
            {order.razorpay_payment_id && (
              <p className="fx-muted" style={{ fontSize: 12, marginTop: 6 }}>Payment ID: {order.razorpay_payment_id}</p>
            )}
            {order.payment_status === 'refunded' && (
              <p className="fx-muted" style={{ fontSize: 12, marginTop: 6 }}>Your refund has been issued; it usually reaches your account in 5–7 working days.</p>
            )}
            {order.payment_method === 'cod' && order.payment_status === 'pending' && order.status !== 'cancelled' && (
              <p className="fx-muted" style={{ fontSize: 12, marginTop: 6 }}>Pay {rupees(order.grand_total)} on delivery.</p>
            )}
          </section>
        </div>
        <section className="fx-summary" style={{ position: 'static' }}>
          <h2 className="fx-label" style={{ fontFamily: 'var(--fx-sans)', fontSize: 12, marginBottom: 14 }}>Cost summary</h2>
          <div className="fx-summary-line"><span>Subtotal</span><span>{rupees(order.subtotal)}</span></div>
          {order.discount_amount > 0 && (
            <div className="fx-summary-line discount"><span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span><span>−{rupees(order.discount_amount)}</span></div>
          )}
          <div className="fx-summary-line"><span>Shipping</span><span>{order.shipping_cost ? rupees(order.shipping_cost) : 'Free'}</span></div>
          <div className="fx-summary-line"><span>GST</span><span>{rupees(order.gst_amount)}</span></div>
          <div className="fx-summary-total"><span>Total amount</span><strong>{rupees(order.grand_total)}</strong></div>
        </section>
      </div>
    </>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  return (
    <AccountLayout active="orders" crumbs={[{ label: 'Orders', href: '/accounts/orders' }, { label: `#${params.orderNumber}` }]}>
      <OrderDetail />
    </AccountLayout>
  );
}
