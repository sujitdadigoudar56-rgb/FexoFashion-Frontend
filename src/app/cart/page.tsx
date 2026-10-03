'use client';

// Bag. Every line has a checkbox: only ticked lines go to checkout, and
// the summary shows totals for the ticked lines (computed by the server,
// GET /api/cart/?items=…), so customers can keep items in the bag for
// later without removing them.

import { Minus, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import RequireAuth, { WhenCartReady } from '@/components/account/RequireAuth';
import ProductCard from '@/components/product/ProductCard';
import { useCart } from '@/context/CartContext';
import { useMessages } from '@/context/MessageContext';
import { useWishlist } from '@/context/WishlistContext';
import { apiFetch } from '@/lib/api';
import { readSelection, writeSelection } from '@/lib/bagSelection';
import { getFeaturedProducts } from '@/lib/data';
import { rupees } from '@/lib/format';
import type { CartState, Product } from '@/lib/types';

function Bag() {
  const { cart, updateQuantity, removeItem, applyCoupon } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { pushMessage } = useMessages();
  const router = useRouter();
  const [coupon, setCoupon] = useState('');
  const [busyLine, setBusyLine] = useState<number | null>(null);
  const [suggested, setSuggested] = useState<Product[]>([]);

  // Selection: previously ticked ids that are still in the bag, plus any
  // line that wasn't in the bag last time (new items start ticked).
  const lineIds = useMemo(() => cart.items.map((l) => l.id), [cart.items]);
  const [selected, setSelected] = useState<number[]>(() => {
    const saved = readSelection();
    return saved ? saved : lineIds;
  });
  const [knownIds, setKnownIds] = useState<number[]>(lineIds);
  if (knownIds.join() !== lineIds.join()) {
    const added = lineIds.filter((id) => !knownIds.includes(id));
    setKnownIds(lineIds);
    setSelected((prev) => [...prev.filter((id) => lineIds.includes(id)), ...added]);
  }
  const ticked = selected.filter((id) => lineIds.includes(id));

  useEffect(() => writeSelection(ticked), [ticked]);

  // Totals for the ticked lines.
  const [totals, setTotals] = useState<CartState['selection'] | null>(null);
  const selectionKey = `${ticked.join(',')}|${cart.items.map((l) => `${l.id}:${l.quantity}`).join()}|${cart.coupon_code}`;
  useEffect(() => {
    let cancelled = false;
    apiFetch<CartState>(`/api/cart/?items=${ticked.join(',') || '0'}`)
      .then((c) => !cancelled && setTotals(c.selection ?? null))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey]);

  useEffect(() => {
    getFeaturedProducts(8)
      .then((items) => setSuggested(items))
      .catch(() => undefined);
  }, []);

  const toggle = (id: number) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const allTicked = ticked.length === lineIds.length && lineIds.length > 0;

  const withBusy = async (id: number, fn: () => Promise<unknown>) => {
    setBusyLine(id);
    try {
      await fn();
    } catch {
      pushMessage('Something went wrong — please try again.', 'error');
    } finally {
      setBusyLine(null);
    }
  };

  const moveToWishlist = (lineId: number, slug: string, name: string, productId: number) =>
    withBusy(lineId, async () => {
      if (!isWishlisted(productId)) await toggleWishlist(slug, name);
      await removeItem(lineId);
      pushMessage(`Moved ${name} to your wishlist`, 'success');
    });

  const savings =
    cart.items
      .filter((l) => ticked.includes(l.id) && l.product.compare_at_price && l.product.compare_at_price > l.product.price)
      .reduce((s, l) => s + ((l.product.compare_at_price ?? 0) - l.product.price) * l.quantity, 0) + (totals?.discount_amount ?? 0);
  const inBagIds = new Set(cart.items.map((l) => l.product.id));
  const alsoLike = suggested.filter((p) => !inBagIds.has(p.id)).slice(0, 4);

  if (cart.items.length === 0) {
    return (
      <div className="fx-container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 className="fx-h-title" style={{ marginBottom: 24 }}>Your Bag</h1>
        <div className="fx-empty">
          <h3>Your bag is empty</h3>
          <p>Browse the collection and add something you love.</p>
          <Link href="/shop" className="fx-btn fx-btn-solid fx-btn-round">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fx-container">
      <h1 className="fx-h-title" style={{ paddingTop: 28 }}>
        Your Bag <small>({cart.items.length} item{cart.items.length === 1 ? '' : 's'})</small>
      </h1>
      <div className="fx-bag">
        <div>
          <div className="fx-bag-selectbar">
            <label className="fx-check">
              <input type="checkbox" checked={allTicked} onChange={() => setSelected(allTicked ? [] : lineIds)} />
              {ticked.length} of {lineIds.length} selected for checkout
            </label>
            <span className="fx-muted" style={{ fontSize: 12 }}>Unticked items stay in your bag</span>
          </div>

          {cart.items.map((line) => {
            const on = ticked.includes(line.id);
            const sale = line.product.compare_at_price && line.product.compare_at_price > line.product.price;
            return (
              <div key={line.id} className={`fx-bag-line${on ? '' : ' fx-unselected'}`} aria-busy={busyLine === line.id}>
                <input type="checkbox" checked={on} onChange={() => toggle(line.id)} aria-label={`Select ${line.product.name} for checkout`} style={{ width: 16, height: 16, accentColor: '#111', marginTop: 4 }} />
                <Link href={`/shop/${line.product.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={line.product.primary_image ?? 'https://placehold.co/200x250/121212/8a8a8a?text=FEXO'} alt={line.product.name} />
                </Link>
                <div>
                  <h3><Link href={`/shop/${line.product.slug}`}>{line.product.name}</Link></h3>
                  <div className="fx-bag-meta">
                    {line.product.color && <span>Colour: <b>{line.product.color}</b></span>}
                    {line.variant_size && <span>Size: <b>{line.variant_size}</b></span>}
                  </div>
                  <div className="fx-bag-controls">
                    <div className="fx-qty" aria-label="Quantity">
                      <button type="button" aria-label="Decrease quantity" disabled={line.quantity <= 1 || busyLine === line.id} onClick={() => withBusy(line.id, () => updateQuantity(line.id, line.quantity - 1))}>
                        <Minus size={14} />
                      </button>
                      <span>{line.quantity}</span>
                      <button type="button" aria-label="Increase quantity" disabled={busyLine === line.id} onClick={() => withBusy(line.id, () => updateQuantity(line.id, line.quantity + 1))}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button type="button" className="fx-text-btn" onClick={() => moveToWishlist(line.id, line.product.slug, line.product.name, line.product.id)} disabled={busyLine === line.id}>
                      Move to wishlist
                    </button>
                    <button type="button" className="fx-text-btn danger" onClick={() => withBusy(line.id, () => removeItem(line.id))} disabled={busyLine === line.id}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="fx-bag-price">
                  {rupees(line.line_total)}
                  {sale && <span className="fx-strike">{rupees((line.product.compare_at_price ?? 0) * line.quantity)}</span>}
                  {line.quantity > 1 && <span className="fx-muted" style={{ display: 'block', fontSize: 11, fontWeight: 400 }}>{rupees(line.product.price)} each</span>}
                </div>
              </div>
            );
          })}

          <div className="fx-panel fx-panel-pad" style={{ marginTop: 8 }}>
            <label className="fx-label" htmlFor="promo">Have a promo code?</label>
            <form
              className="fx-promo"
              onSubmit={async (e) => {
                e.preventDefault();
                if (coupon.trim() && (await applyCoupon(coupon.trim()))) setCoupon('');
              }}
            >
              <input id="promo" className="fx-control" placeholder="Enter code here" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              <button type="submit" className="fx-btn fx-btn-solid fx-btn-round" style={{ padding: '0 22px' }}>Apply</button>
            </form>
            {cart.coupon_code && (
              <div className="fx-promo-applied">
                <span>{cart.coupon_code} applied{totals?.discount_amount ? ` — ${rupees(totals.discount_amount)} off` : ''}</span>
              </div>
            )}
          </div>
        </div>

        <aside className="fx-summary" aria-label="Order summary">
          <h2>Order Summary</h2>
          <div className="fx-summary-line"><span>Subtotal ({totals?.item_count ?? 0} unit{totals?.item_count === 1 ? '' : 's'})</span><span>{rupees(totals?.subtotal ?? 0)}</span></div>
          {!!totals?.discount_amount && (
            <div className="fx-summary-line discount"><span>Coupon ({cart.coupon_code})</span><span>−{rupees(totals.discount_amount)}</span></div>
          )}
          <div className="fx-summary-line"><span>GST</span><span>{rupees(totals?.gst_total ?? 0)}</span></div>
          <div className="fx-summary-line"><span>Shipping</span><span>{totals && totals.shipping_cost > 0 ? rupees(totals.shipping_cost) : 'Free'}</span></div>
          <div className="fx-summary-total"><span>Total</span><strong>{rupees(totals?.grand_total ?? 0)}</strong></div>
          {savings > 0 && <p className="fx-savings">You save {rupees(savings)} on this order</p>}
          <button
            type="button"
            className="fx-btn fx-btn-solid fx-btn-block fx-btn-round"
            disabled={!ticked.length}
            onClick={() => {
              writeSelection(ticked);
              router.push('/checkout');
            }}
          >
            {ticked.length ? `Proceed to checkout (${ticked.length})` : 'Select items to check out'}
          </button>
          <Link href="/shop" className="fx-btn fx-btn-block fx-btn-round" style={{ marginTop: 10, border: 'none' }}>Continue shopping</Link>
          <div className="fx-trust">
            <span className="fx-icon-text"><ShieldCheck size={15} aria-hidden /> Secure checkout</span>
            <span className="fx-icon-text"><RotateCcw size={15} aria-hidden /> Easy returns — see our returns policy</span>
            <span className="fx-icon-text"><Truck size={15} aria-hidden /> Free shipping on orders over ₹2,999</span>
          </div>
        </aside>
      </div>

      {alsoLike.length > 0 && (
        <section style={{ padding: '24px 0 80px' }}>
          <h2 className="fx-h-title" style={{ fontSize: 26, marginBottom: 20 }}>You May Also Like</h2>
          <div className="fx-grid">
            {alsoLike.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <RequireAuth>
      <WhenCartReady>
        <Bag />
      </WhenCartReady>
    </RequireAuth>
  );
}
