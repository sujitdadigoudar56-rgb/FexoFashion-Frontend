'use client';

// Ports templates/products/includes/product_card.html — reused across
// home, shop, wishlist, related/complete-the-look/recently-viewed
// sections exactly like the original `{% include %}`.

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { discountPercent, isOnSale, primaryImage, productUrl, secondaryImage } from '@/lib/product';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const primary = primaryImage(product);
  const secondary = secondaryImage(product);
  const wishlisted = isWishlisted(product.id);
  const onSale = isOnSale(product);
  const fallbackImage = `https://placehold.co/600x800/0e0e0e/8a8a8a?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="fx-card fx-reveal">
      <Link href={productUrl(product)}>
        <div className="fx-card-media">
          {product.is_new_arrival && <span className="fx-badge-tag">New</span>}
          {onSale && <span className="fx-badge-tag">-{discountPercent(product)}%</span>}
          <img className="fx-img-primary" src={primary?.image ?? fallbackImage} alt={product.name} loading="lazy" />
          {secondary && <img className="fx-img-hover" src={secondary.image} alt={product.name} loading="lazy" />}
        </div>
      </Link>
      <div className="fx-card-actions">
        <button
          type="button"
          className="fx-icon-btn"
          aria-label="Wishlist"
          onClick={() => toggleWishlist(product.slug, product.name)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4c2-.3 3.8.6 5 2.2C11.8 4.6 13.6 3.7 15.6 4c3.6.5 5.2 4 3.6 7.7C16.7 16.4 12 21 12 21z" />
          </svg>
        </button>
      </div>
      <Link href={productUrl(product)} className="fx-card-info">
        <h3>{product.name}</h3>
        <span className="fx-price">
          {onSale && <del>&#8377;{product.compare_at_price}</del>}
          &#8377;{product.price}
        </span>
      </Link>
      <button type="button" className="fx-quick-add" onClick={() => addItem(product.slug, product.name, 1)}>
        Quick Add
      </button>
    </div>
  );
}
