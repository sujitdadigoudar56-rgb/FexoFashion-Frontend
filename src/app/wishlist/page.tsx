'use client';

// Wishlist: saved products with size picker and "Add to bag" per item.

import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import RequireAuth from '@/components/account/RequireAuth';
import { fallbackImage } from '@/components/product/ProductCard';
import Stars from '@/components/ui/Stars';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { colorHex, rupees } from '@/lib/format';
import { averageRating, discountPercent, isOnSale, primaryImage, productUrl, reviewCount } from '@/lib/product';
import type { Product } from '@/lib/types';

function WishCard({ product }: { product: Product }) {
  const { toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const inStock = product.variants.filter((v) => v.stock_quantity > 0);
  const [variantId, setVariantId] = useState<number | null>(inStock[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const rating = averageRating(product);
  const reviews = reviewCount(product);
  const soldOut = product.variants.length > 0 && inStock.length === 0;

  return (
    <article className="fx-pcard fx-wish-card">
      <div className="fx-pcard-media">
        <Link href={productUrl(product)} aria-label={product.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fx-img-primary" src={primaryImage(product)?.image ?? fallbackImage(product.name)} alt={product.name} loading="lazy" />
        </Link>
        <button type="button" className="fx-pcard-heart" aria-label={`Remove ${product.name} from wishlist`} onClick={() => toggleWishlist(product.slug, product.name)}>
          <X size={16} aria-hidden />
        </button>
      </div>
      <div className="fx-pcard-body">
        <div className="fx-pcard-rating">
          {reviews > 0 ? (
            <>
              <Stars value={rating} size={12} /> <strong>{rating.toFixed(1)}</strong> <span>({reviews})</span>
            </>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>
        <div className="fx-wish-row">
          <Link href={productUrl(product)} className="fx-pcard-name">{product.name}</Link>
          <span className="fx-wish-price">{rupees(product.price)}</span>
        </div>
        {/* Always rendered (even when empty) so every card lines up. */}
        <div className="fx-wish-row fx-wish-meta">
          <span>
            {product.color && (
              <span className="fx-swatch" style={{ background: colorHex(product.color) }} title={product.color} aria-label={`Colour: ${product.color}`} />
            )}
          </span>
          {isOnSale(product) && (
            <span>
              <span className="fx-strike">{rupees(product.compare_at_price)}</span> <span className="fx-money-off">−{discountPercent(product)}%</span>
            </span>
          )}
        </div>
        <div className="fx-wish-sizes" role="radiogroup" aria-label="Size">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={variantId === v.id}
                className={`fx-size-btn${variantId === v.id ? ' fx-on' : ''}`}
                disabled={v.stock_quantity === 0}
                onClick={() => setVariantId(v.id)}
              >
                {v.size}
              </button>
            ))}
          </div>
        <button
          type="button"
          className="fx-btn fx-btn-solid fx-btn-block fx-btn-sm fx-btn-round"
          disabled={soldOut || adding}
          onClick={async () => {
            setAdding(true);
            await addItem(product.slug, product.name, 1, variantId);
            setAdding(false);
          }}
        >
          {soldOut ? 'Sold out' : adding ? 'Adding…' : 'Add to bag'}
        </button>
      </div>
    </article>
  );
}

function Wishlist() {
  const { items, ready } = useWishlist();
  if (!ready) return <div className="fx-container fx-route-loading"><div className="fx-skeleton" style={{ height: 320 }} /></div>;
  return (
    <div className="fx-container" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <h1 className="fx-h-title" style={{ marginBottom: 24 }}>
        My Wishlist <small>({items.length} item{items.length === 1 ? '' : 's'})</small>
      </h1>
      {items.length > 0 ? (
        <div className="fx-wish-grid">
          {items.map((p) => (
            <WishCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="fx-empty">
          <div className="fx-empty-icon"><Heart size={20} aria-hidden /></div>
          <h3>Your wishlist is waiting.</h3>
          <p>Save the pieces you love — tap the heart on any product.</p>
          <Link href="/shop" className="fx-btn fx-btn-solid fx-btn-round">Explore the collection</Link>
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <Wishlist />
    </RequireAuth>
  );
}
