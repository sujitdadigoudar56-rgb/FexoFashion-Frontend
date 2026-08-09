'use client';

// Ports templates/orders/checkout.html — POSTs to /api/orders/checkout/,
// which reads the signed-in user's server Cart directly (see
// AuthContext.placeOrder / orders/views.py's CheckoutAPIView), so this
// form only needs to collect the address ids + notes.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RequireAuth from '@/components/account/RequireAuth';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useMessages } from '@/context/MessageContext';

const headingStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
};

function CheckoutContent() {
  const { addresses, placeOrder } = useAuth();
  const { cart, clearCartState } = useCart();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [shippingId, setShippingId] = useState<number | undefined>(addresses[0]?.id);
  const [billingId, setBillingId] = useState<number | undefined>(addresses[0]?.id);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingId || !billingId) return;
    setSubmitting(true);
    try {
      const order = await placeOrder({ shippingAddressId: shippingId, billingAddressId: billingId, notes });
      clearCartState();
      pushMessage('Order placed successfully.', 'success');
      router.push(`/orders/success/${order.order_number}`);
    } catch {
      pushMessage('Could not place your order — please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Checkout" title="Complete Your Order" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container">
          {cart.items.length === 0 ? (
            <div className="fx-center" style={{ padding: '80px 0' }}>
              <p className="fx-muted" style={{ marginBottom: 24 }}>Your bag is empty.</p>
              <Link href="/shop" className="fx-btn fx-btn-solid">Continue Shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 60 }}>
              <form onSubmit={handleSubmit}>
                {addresses.length > 0 ? (
                  <>
                    <h4 style={{ ...headingStyle, marginBottom: 18 }}>Shipping Address</h4>
                    <select
                      className="fx-select"
                      value={shippingId}
                      onChange={(e) => setShippingId(Number(e.target.value))}
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name} — {a.line1}, {a.city}</option>
                      ))}
                    </select>

                    <h4 style={{ ...headingStyle, margin: '24px 0 18px' }}>Billing Address</h4>
                    <select
                      className="fx-select"
                      value={billingId}
                      onChange={(e) => setBillingId(Number(e.target.value))}
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name} — {a.line1}, {a.city}</option>
                      ))}
                    </select>

                    <h4 style={{ ...headingStyle, margin: '24px 0 18px' }}>Order Notes</h4>
                    <textarea
                      className="fx-textarea"
                      rows={3}
                      placeholder="Delivery instructions (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />

                    <h4 style={{ ...headingStyle, margin: '24px 0 18px' }}>Payment Method</h4>
                    <div style={{ border: '1px solid var(--fx-line)', padding: 16, marginBottom: 24 }}>
                      Cash on Delivery
                    </div>

                    <button type="submit" className="fx-btn fx-btn-solid fx-btn-block" disabled={submitting}>
                      {submitting ? 'Placing Order…' : 'Place Order'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="fx-muted">You need a saved address before checking out.</p>
                    <Link href="/accounts/addresses" className="fx-btn fx-btn-solid" style={{ marginTop: 16 }}>
                      Add an Address
                    </Link>
                  </>
                )}
              </form>

              <div className="fx-summary-box">
                <h4 style={{ ...headingStyle, marginBottom: 20 }}>Order Summary</h4>
                {cart.items.map((line) => (
                  <div key={line.id} className="fx-summary-row">
                    <span>{line.product.name} &times; {line.quantity}</span>
                    <span>&#8377;{line.line_total}</span>
                  </div>
                ))}
                <div className="fx-summary-row"><span>GST</span><span>&#8377;{cart.gst_total}</span></div>
                <div className="fx-summary-row">
                  <span>Shipping</span>
                  <span>{cart.shipping_cost === 0 ? 'Free' : `₹${cart.shipping_cost}`}</span>
                </div>
                {cart.coupon_code && (
                  <div className="fx-summary-row"><span>Discount</span><span>-&#8377;{cart.discount_amount}</span></div>
                )}
                <div className="fx-summary-row total"><span>Total</span><span>&#8377;{cart.grand_total}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}
