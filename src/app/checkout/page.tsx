'use client';

// Checkout for the lines ticked in the bag: 1) delivery address — choose
// a saved address or add a new one right here, 2) payment. Online payment
// (Razorpay: UPI, cards, net banking, wallets) is the default; cash on
// delivery is the alternative. An online order is only confirmed once the
// backend has verified the payment with Razorpay.

import { Banknote, Check, CreditCard, Info, Lock, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddressForm, { AddressLines } from '@/components/account/AddressForm';
import RequireAuth, { WhenCartReady } from '@/components/account/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useMessages } from '@/context/MessageContext';
import { apiFetch } from '@/lib/api';
import { clearSelection, readSelection } from '@/lib/bagSelection';
import { rupees } from '@/lib/format';
import { payWithRazorpay } from '@/lib/razorpay';
import type { CartState, Order, PaymentMethod } from '@/lib/types';

type Step = 'address' | 'payment';

function Steps({ step }: { step: Step }) {
  const items: { key: Step | 'bag' | 'review'; label: string }[] = [
    { key: 'bag', label: 'Bag' },
    { key: 'address', label: 'Address' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Confirmation' },
  ];
  const at = items.findIndex((i) => i.key === step);
  return (
    <ol className="fx-steps" aria-label="Checkout progress">
      {items.map((s, i) => (
        <li key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {i > 0 && <span className="fx-step-bar" aria-hidden />}
          <span className={`fx-step${i === at ? ' fx-on' : i < at ? ' fx-done' : ''}`} aria-current={i === at ? 'step' : undefined}>
            <span className="fx-step-num">{i < at ? <Check size={12} aria-hidden /> : i + 1}</span>
            <span className="fx-step-label">{s.label}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}


function Checkout() {
  const { user, addresses, addAddress, placeOrder, upsertOrder } = useAuth();
  const { cart, applyCoupon, refreshCart } = useCart();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [step, setStep] = useState<Step>('address');
  const [addressId, setAddressId] = useState<number | undefined>(() => (addresses.find((a) => a.is_default) ?? addresses[0])?.id);
  const [adding, setAdding] = useState(addresses.length === 0);
  const [notes, setNotes] = useState('');
  const [coupon, setCoupon] = useState('');
  const [placing, setPlacing] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('razorpay');
  // An online order created on an earlier attempt whose payment wasn't
  // completed (window closed / failed). Retrying pays that same order.
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  // Lines chosen in the bag (falls back to the whole bag).
  const [itemIds] = useState<number[]>(() => {
    const saved = readSelection();
    const ids = cart.items.map((l) => l.id);
    const picked = saved ? saved.filter((id) => ids.includes(id)) : ids;
    return picked.length ? picked : ids;
  });
  const lines = cart.items.filter((l) => itemIds.includes(l.id));

  const [totals, setTotals] = useState<CartState['selection'] | null>(null);
  useEffect(() => {
    let cancelled = false;
    apiFetch<CartState>(`/api/cart/?items=${itemIds.join(',') || '0'}`)
      .then((c) => !cancelled && setTotals(c.selection ?? null))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [itemIds, cart.coupon_code]);

  const address = addresses.find((a) => a.id === addressId);

  const completeOrder = async (order: Order) => {
    upsertOrder(order);
    clearSelection();
    await refreshCart();
    router.push(`/orders/success/${order.order_number}`);
  };

  const place = async () => {
    if (!addressId) return;
    setPlacing(true);
    setPayError(null);
    try {
      if (method === 'cod') {
        // Switching to COD after an unfinished online attempt: drop that one.
        if (pendingOrder) {
          await apiFetch(`/api/orders/${pendingOrder.order_number}/cancel/`, { method: 'POST' }).catch(() => undefined);
          setPendingOrder(null);
        }
        const order = await placeOrder({ shippingAddressId: addressId, billingAddressId: addressId, notes, itemIds, paymentMethod: 'cod' });
        await completeOrder(order);
        return;
      }

      const order = pendingOrder
        ? await apiFetch<Order>(`/api/orders/${pendingOrder.order_number}/pay/`, { method: 'POST' })
        : await placeOrder({ shippingAddressId: addressId, billingAddressId: addressId, notes, itemIds, paymentMethod: 'razorpay' });
      upsertOrder(order);
      if (!order.razorpay) throw new Error('Could not start the online payment.');
      setPendingOrder(order);

      const outcome = await payWithRazorpay(order.order_number, order.razorpay);
      if (outcome.status === 'paid') {
        setPendingOrder(null);
        pushMessage('Payment successful — your order is confirmed.', 'success');
        await completeOrder(outcome.order);
        return;
      }
      if (outcome.status === 'dismissed') {
        setPayError(`Payment not completed. Order #${order.order_number} is saved — pay now to confirm it, or choose cash on delivery.`);
      } else {
        setPayError(outcome.message);
      }
      setPlacing(false);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Could not place your order — please try again.');
      setPlacing(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="fx-container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="fx-empty">
          <h3>Nothing to check out</h3>
          <p>Your bag is empty or no items are selected.</p>
          <Link href="/cart" className="fx-btn fx-btn-solid fx-btn-round">Back to bag</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fx-container">
      <Steps step={step} />
      <div className="fx-checkout">
        <div>
          {step === 'address' ? (
            <>
              <h2 className="fx-h-title">Delivery Address</h2>
              {addresses.length > 0 && (
                <div className="fx-address-grid" style={{ marginBottom: 20 }} role="radiogroup" aria-label="Saved addresses">
                  {addresses.map((a) => (
                    <div key={a.id} className={`fx-address-card${a.id === addressId && !adding ? ' fx-on' : ''}`}>
                      <label className="fx-address-select">
                        <input
                          type="radio"
                          name="address"
                          className="sr-only-check"
                          checked={a.id === addressId && !adding}
                          onChange={() => {
                            setAddressId(a.id);
                            setAdding(false);
                          }}
                        />
                      </label>
                      <div className="fx-address-tags">
                        <span className="fx-pill">{a.id === addressId && !adding ? 'Delivering here' : 'Deliver here'}</span>
                        {a.is_default && <span className="fx-pill fx-pill-success">Default</span>}
                      </div>
                      <AddressLines a={a} />
                    </div>
                  ))}
                  {!adding && (
                    <button type="button" className="fx-address-add" onClick={() => setAdding(true)}>
                      <Plus size={16} aria-hidden /> Add new address
                    </button>
                  )}
                </div>
              )}

              {adding && (
                <section className="fx-panel fx-panel-pad" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'var(--fx-sans)', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>New delivery address</h3>
                  <AddressForm
                    defaults={{ full_name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(), phone: user?.phone ?? '', is_default: addresses.length === 0 }}
                    submitLabel="Deliver to this address"
                    saveLabel="Make this my default address"
                    onCancel={addresses.length ? () => setAdding(false) : undefined}
                    onSubmit={async (input) => {
                      try {
                        const created = await addAddress(input);
                        setAddressId(created.id);
                        setAdding(false);
                        pushMessage('Address saved.', 'success');
                      } catch {
                        pushMessage('Could not save that address — please check the details.', 'error');
                      }
                    }}
                  />
                </section>
              )}

              <div className="fx-field">
                <label className="fx-label" htmlFor="notes">Delivery instructions <span className="fx-muted" style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                <textarea id="notes" className="fx-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. leave with security" />
              </div>
              <button type="button" className="fx-btn fx-btn-solid fx-btn-block fx-btn-round" disabled={!address || adding} onClick={() => setStep('payment')}>
                Continue to payment
              </button>
            </>
          ) : (
            <>
              <h2 className="fx-h-title">Payment</h2>
              {address && (
                <div className="fx-notice" style={{ justifyContent: 'space-between' }}>
                  <span>
                    Delivering to <b style={{ color: 'var(--fx-accent)' }}>{address.full_name}</b>, {address.city} {address.postal_code}
                  </span>
                  <button type="button" className="fx-link" style={{ background: 'none', border: 'none', fontSize: 12 }} onClick={() => setStep('address')}>
                    Change
                  </button>
                </div>
              )}
              <div role="radiogroup" aria-label="Payment method">
                <div className={`fx-pay-option${method === 'razorpay' ? ' fx-on' : ''}`}>
                  <div className="fx-pay-head">
                    <label>
                      <input type="radio" name="payment" checked={method === 'razorpay'} onChange={() => setMethod('razorpay')} />
                      <CreditCard size={17} aria-hidden /> Pay online
                    </label>
                    <span className="fx-pill fx-pill-success">Recommended</span>
                  </div>
                  <p>UPI (GPay, PhonePe, Paytm), credit &amp; debit cards, net banking and wallets — secured by Razorpay.</p>
                </div>
                <div className={`fx-pay-option${method === 'cod' ? ' fx-on' : ''}`}>
                  <div className="fx-pay-head">
                    <label>
                      <input type="radio" name="payment" checked={method === 'cod'} onChange={() => setMethod('cod')} />
                      <Banknote size={17} aria-hidden /> Cash on delivery
                    </label>
                  </div>
                  <p>Pay in cash or by UPI to the delivery partner when your order arrives.</p>
                </div>
              </div>
              {payError && <div className="fx-form-error" role="alert">{payError}</div>}
              <button type="button" className="fx-btn fx-btn-solid fx-btn-block fx-btn-round" style={{ height: 52 }} disabled={placing || !totals} onClick={place}>
                {placing
                  ? method === 'razorpay' ? 'Waiting for payment…' : 'Placing order…'
                  : method === 'razorpay'
                    ? `${pendingOrder ? 'Complete payment' : 'Pay'} ${rupees(pendingOrder?.grand_total ?? totals?.grand_total ?? 0)}`
                    : `Place order · ${rupees(totals?.grand_total ?? 0)}`}
              </button>
              <div className="fx-secure-note">
                <span className="fx-icon-text"><Lock size={12} aria-hidden /> {method === 'razorpay' ? 'Payments secured by Razorpay' : 'Secure checkout'}</span>
              </div>
            </>
          )}
        </div>

        <aside className="fx-summary" aria-label="Order summary">
          <h2>Order Summary</h2>
          {lines.map((l) => (
            <div key={l.id} className="fx-sum-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.product.primary_image ?? 'https://placehold.co/108x136/121212/8a8a8a?text=FEXO'} alt="" />
              <div>
                <strong>{l.product.name}</strong>
                <span>{[l.product.color && `Colour: ${l.product.color}`, l.variant_size && `Size: ${l.variant_size}`, `Qty: ${l.quantity}`].filter(Boolean).join(' · ')}</span>
              </div>
              <b style={{ fontSize: 13 }}>{rupees(l.line_total)}</b>
            </div>
          ))}
          <form
            className="fx-promo"
            style={{ margin: '6px 0 18px' }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (coupon.trim() && (await applyCoupon(coupon.trim()))) setCoupon('');
            }}
          >
            <input className="fx-control" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} aria-label="Coupon code" />
            <button type="submit" className="fx-btn fx-btn-solid fx-btn-round" style={{ padding: '0 18px' }}>Apply</button>
          </form>
          <div className="fx-summary-line"><span>Subtotal</span><span>{rupees(totals?.subtotal ?? 0)}</span></div>
          {!!totals?.discount_amount && (
            <div className="fx-summary-line discount"><span>Discount ({cart.coupon_code})</span><span>−{rupees(totals.discount_amount)}</span></div>
          )}
          <div className="fx-summary-line"><span>GST</span><span>{rupees(totals?.gst_total ?? 0)}</span></div>
          <div className="fx-summary-line"><span>Shipping</span><span>{totals && totals.shipping_cost > 0 ? rupees(totals.shipping_cost) : 'Free'}</span></div>
          <div className="fx-summary-total"><span>Total</span><strong>{rupees(totals?.grand_total ?? 0)}</strong></div>
          {lines.length < cart.items.length && (
            <p className="fx-notice" style={{ marginTop: 16, marginBottom: 0 }}>
              <Info size={14} aria-hidden /> {cart.items.length - lines.length} other item{cart.items.length - lines.length === 1 ? '' : 's'} will stay in your bag.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <WhenCartReady>
        <Checkout />
      </WhenCartReady>
    </RequireAuth>
  );
}
