'use client';

// Buy box: colour (round swatch), size, quantity, add to bag / wishlist,
// buy it now, delivery check and the Fexo Mirror try-on.

import { BadgeCheck, Banknote, Heart, Minus, Plus, RotateCcw, Ruler, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import FexoMirror from '@/components/mirror/Fexomirror';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { writeSelection } from '@/lib/bagSelection';
import { colorHex } from '@/lib/format';
import { inStock } from '@/lib/product';
import type { Product } from '@/lib/types';
import SizeChart from './SizeChart';

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductActions({ product }: { product: Product }) {
  const variants = [...product.variants].sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
  const firstAvailable = variants.find((v) => v.stock_quantity > 0);
  const [variantId, setVariantId] = useState<number | null>(firstAvailable?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [showGuide, setShowGuide] = useState(false);
  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState<string | null>(null);
  const [busy, setBusy] = useState<'add' | 'buy' | null>(null);
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const router = useRouter();
  const stocked = inStock(product) || product.variants.length === 0;
  const variant = variants.find((v) => v.id === variantId);
  const maxQty = variant ? Math.min(10, variant.stock_quantity) : 10;
  const wishlisted = isWishlisted(product.id);

  const add = async (mode: 'add' | 'buy') => {
    setBusy(mode);
    const updated = await addItem(product.slug, product.name, quantity, variantId);
    setBusy(null);
    if (updated && mode === 'buy') {
      // Buy it now checks out just this item; the rest of the bag stays.
      const line = updated.items.find((l) => l.product.slug === product.slug && (l.variant ?? null) === variantId);
      if (line) writeSelection([line.id]);
      router.push(line ? '/checkout' : '/cart');
    }
  };

  return (
    <div>
      {product.color && (
        <div className="fx-pdp-block">
          <div className="fx-pdp-block-title">
            <span style={{ fontWeight: 700, color: 'var(--fx-accent)', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 12 }}>
              Colour: <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--fx-muted)' }}>{product.color}</span>
            </span>
          </div>
          <span className="fx-swatch-ring fx-on" title={product.color}>
            <span className="fx-swatch fx-swatch-lg" style={{ background: colorHex(product.color) }} aria-label={product.color} />
          </span>
        </div>
      )}

      {variants.length > 0 && (
        <div className="fx-pdp-block">
          <div className="fx-pdp-block-title">
            Select size
            <button type="button" onClick={() => setShowGuide((v) => !v)} aria-expanded={showGuide}>
              <Ruler size={14} aria-hidden /> Size guide
            </button>
          </div>
          <div className="fx-pdp-sizes" role="radiogroup" aria-label="Size">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={variantId === v.id}
                className={`fx-size-btn${variantId === v.id ? ' fx-on' : ''}`}
                disabled={v.stock_quantity === 0}
                title={v.stock_quantity === 0 ? 'Out of stock' : undefined}
                onClick={() => {
                  setVariantId(v.id);
                  setQuantity(1);
                }}
              >
                {v.size}
              </button>
            ))}
          </div>
          {variant && variant.stock_quantity > 0 && variant.stock_quantity <= variant.low_stock_threshold && (
            <p className="fx-error" style={{ marginTop: 10 }}>Only {variant.stock_quantity} left in this size</p>
          )}
          {showGuide && <SizeChart note={product.size_guide} />}
        </div>
      )}

      <div className="fx-pdp-block">
        <div className="fx-pdp-block-title">Quantity</div>
        <div className="fx-qty">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)}><Minus size={14} /></button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" aria-label="Increase quantity" disabled={quantity >= maxQty} onClick={() => setQuantity((q) => q + 1)}><Plus size={14} /></button>
        </div>
      </div>

      <div className="fx-pdp-ctas">
        <button type="button" className="fx-btn fx-btn-solid" disabled={!stocked || busy !== null} onClick={() => add('add')}>
          {!stocked ? 'Out of stock' : busy === 'add' ? 'Adding…' : 'Add to bag'}
        </button>
        <button
          type="button"
          className={`fx-heart-btn${wishlisted ? ' fx-on' : ''}`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
          onClick={() => toggleWishlist(product.slug, product.name)}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button type="button" className="fx-btn fx-btn-block" style={{ marginTop: 10 }} disabled={!stocked || busy !== null} onClick={() => add('buy')}>
        {busy === 'buy' ? 'Please wait…' : 'Buy it now'}
      </button>
      <button type="button" className="fx-btn fx-btn-block" style={{ marginTop: 10, border: '1px dashed var(--fx-line)' }} onClick={() => setMirrorOpen(true)}>
        <Sparkles size={14} aria-hidden /> Try in Fexo Mirror
      </button>

      <div className="fx-pdp-block" style={{ marginTop: 22 }}>
        <div className="fx-pdp-block-title">Check delivery</div>
        <form
          className="fx-pdp-pin"
          onSubmit={(e) => {
            e.preventDefault();
            setPinResult(/^\d{6}$/.test(pin) ? `Delivery to ${pin} usually takes 5–7 business days. Cash on delivery available.` : 'Enter a valid 6-digit PIN code.');
          }}
        >
          <input className="fx-control" inputMode="numeric" maxLength={6} placeholder="Enter PIN code" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} aria-label="PIN code" />
          <button type="submit" className="fx-btn fx-btn-solid">Check</button>
        </form>
        {pinResult && <p className="fx-muted" style={{ fontSize: 12, marginTop: 8 }} role="status">{pinResult}</p>}
        <div className="fx-pdp-perks">
          <span className="fx-icon-text"><Truck size={14} aria-hidden /> Free delivery over ₹2,999</span>
          <span className="fx-icon-text"><RotateCcw size={14} aria-hidden /> Easy returns</span>
          <span className="fx-icon-text"><Banknote size={14} aria-hidden /> COD available</span>
        </div>
      </div>
      <div className="fx-pdp-trust">
        <span className="fx-icon-text"><BadgeCheck size={14} aria-hidden /> 100% original</span>
        <span className="fx-icon-text"><RotateCcw size={14} aria-hidden /> Easy returns</span>
        <span className="fx-icon-text"><ShieldCheck size={14} aria-hidden /> Secure checkout</span>
      </div>

      <FexoMirror
        open={mirrorOpen}
        onClose={() => setMirrorOpen(false)}
        garmentImageUrl={product.images?.[0]?.image ?? ''}
        garmentName={product.name}
      />
    </div>
  );
}
