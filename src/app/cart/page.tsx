'use client';

// Ports templates/cart/cart.html. Quantity changes apply live (no
// separate "Update" step needed since the server response replaces the
// whole cart on every mutation). Requires sign-in, same as wishlist/
// checkout already did — see CartContext's header comment.

import Link from 'next/link';
import { useState } from 'react';
import RequireAuth from '@/components/account/RequireAuth';
import QtyBox from '@/components/product/QtyBox';
import PageHeader from '@/components/ui/PageHeader';
import { useCart } from '@/context/CartContext';

function CartContent() {
  const { cart, updateQuantity, removeItem, applyCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const ok = await applyCoupon(couponCode);
    if (ok) setCouponCode('');
  };

  return (
    <>
      <PageHeader eyebrow="Bag" title="Your Selections" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container">
          {cart.items.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 60 }}>
              <table className="fx-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((line) => (
                    <tr key={line.id}>
                      <td style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <img
                          className="fx-cart-item-media"
                          src={line.product.primary_image ?? 'https://placehold.co/200x250/121212/8a8a8a?text=FEXO'}
                          alt={line.product.name}
                        />
                        <div>
                          <div>{line.product.name}</div>
                          {line.variant_size && (
                            <div className="fx-muted" style={{ fontSize: 12 }}>Size: {line.variant_size}</div>
                          )}
                        </div>
                      </td>
                      <td>&#8377;{line.product.price}</td>
                      <td>
                        <QtyBox value={line.quantity} min={0} onChange={(q) => updateQuantity(line.id, q)} />
                      </td>
                      <td>&#8377;{line.line_total}</td>
                      <td>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: 'var(--fx-muted)' }}
                          onClick={() => removeItem(line.id)}
                          aria-label="Remove"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="fx-summary-box">
                <div className="fx-summary-row"><span>Subtotal</span><span>&#8377;{cart.subtotal}</span></div>
                <div className="fx-summary-row"><span>GST</span><span>&#8377;{cart.gst_total}</span></div>
                <div className="fx-summary-row">
                  <span>Shipping</span>
                  <span>{cart.shipping_cost === 0 ? 'Free' : `₹${cart.shipping_cost}`}</span>
                </div>
                {cart.coupon_code && (
                  <div className="fx-summary-row">
                    <span>Discount ({cart.coupon_code})</span>
                    <span>-&#8377;{cart.discount_amount}</span>
                  </div>
                )}
                <div className="fx-summary-row total"><span>Total</span><span>&#8377;{cart.grand_total}</span></div>

                <form style={{ display: 'flex', gap: 8, margin: '20px 0' }} onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    className="fx-input"
                    placeholder="Coupon code"
                    style={{ marginBottom: 0 }}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="submit" className="fx-btn">Apply</button>
                </form>

                <Link href="/checkout" className="fx-btn fx-btn-solid fx-btn-block">Proceed to Checkout</Link>
              </div>
            </div>
          ) : (
            <div className="fx-center" style={{ padding: '80px 0' }}>
              <p className="fx-muted" style={{ marginBottom: 24 }}>Your bag is empty.</p>
              <Link href="/shop" className="fx-btn fx-btn-solid">Continue Shopping</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function CartPage() {
  return (
    <RequireAuth>
      <CartContent />
    </RequireAuth>
  );
}
