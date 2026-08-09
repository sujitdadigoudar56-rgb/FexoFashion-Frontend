'use client';

// Ports the full-width "Add to Wishlist" form from products/product_detail.html.

import { useWishlist } from '@/context/WishlistContext';
import type { Product } from '@/lib/types';

export default function WishlistButton({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <button
      type="button"
      className="fx-btn fx-btn-block"
      style={{ marginTop: 14 }}
      onClick={() => toggleWishlist(product.slug, product.name)}
    >
      {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </button>
  );
}
