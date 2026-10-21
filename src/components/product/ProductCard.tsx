'use client';

// Product tile used on the shop grid, home rails, related products and
// wishlist: image (hover swaps to the second photo), NEW / SALE tag,
// wishlist heart, Quick Add, rating, name, price with MRP + % off, colour.

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Stars from '@/components/ui/Stars';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { colorHex, rupees } from '@/lib/format';
import { averageRating, discountPercent, isOnSale, primaryImage, productUrl, reviewCount, secondaryImage } from '@/lib/product';
import type { Product } from '@/lib/types';

export function fallbackImage(name: string) {
  return `https://placehold.co/600x750/0e0e0e/8a8a8a?text=${encodeURIComponent(name)}`;
}

export default function ProductCard({ product, color }: { product: Product; color?: string }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  // One card per colour (see cardColors): show that colour's photos and open the PDP on it.
  const tinted = color ? product.images.filter((img) => img.color === color) : [];
  const primary = tinted[0] ?? primaryImage(product);
  const secondary = tinted.length ? tinted[1] : secondaryImage(product);
  const href = color ? `${productUrl(product)}?color=${encodeURIComponent(color)}` : productUrl(product);
  const wishlisted = isWishlisted(product.id);
  const onSale = isOnSale(product);
  const rating = averageRating(product);
  const reviews = reviewCount(product);
  // Quick Add puts the first in-stock size in the bag.
  const variant = product.variants.find((v) => v.stock_quantity > 0 && (!color || v.color === color));
  const soldOut = product.variants.length > 0 && !variant;

  const quickAdd = async () => {
    setAdding(true);
    await addItem(product.slug, product.name, 1, variant?.id ?? null);
    setAdding(false);
  };

  return (
    <article className="fx-pcard">
      <div className="fx-pcard-media">
        <Link href={href} aria-label={product.name}>
          {onSale ? (
            <span className="fx-pcard-tag sale">Sale</span>
          ) : product.is_new_arrival ? (
            <span className="fx-pcard-tag">New</span>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fx-img-primary" src={primary?.image ?? fallbackImage(product.name)} alt={product.name} loading="lazy" />
          {secondary && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="fx-img-hover" src={secondary.image} alt="" loading="lazy" />
          )}
        </Link>
        <button
          type="button"
          className={`fx-pcard-heart${wishlisted ? ' fx-on' : ''}`}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          onClick={() => toggleWishlist(product.slug, product.name)}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} aria-hidden />
        </button>
        <button type="button" className="fx-pcard-quick" onClick={quickAdd} disabled={soldOut || adding}>
          {soldOut ? 'Sold out' : adding ? 'Adding…' : `Quick add${variant ? ` · ${variant.size}` : ''} +`}
        </button>
      </div>
      <div className="fx-pcard-body">
        <div className="fx-pcard-rating">
          {reviews > 0 ? (
            <>
              <Stars value={rating} size={12} />
              <strong>{rating.toFixed(1)}</strong>
              <span>({reviews})</span>
            </>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>
        <Link href={href} className="fx-pcard-name">
          {product.name}
        </Link>
        <div className="fx-pcard-price">
          <span>{rupees(product.price)}</span>
          {onSale && (
            <>
              <span className="fx-strike">{rupees(product.compare_at_price)}</span>
              <span className="fx-money-off">{discountPercent(product)}% OFF</span>
            </>
          )}
        </div>
        {product.colors.length > 0 && (
          <div className="fx-pcard-colors" title={product.colors.join(', ')}>
            {product.colors.map((c) => (
              <span key={c} className="fx-swatch" style={{ background: colorHex(c) }} aria-label={`Colour: ${c}`} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
