'use client';

// Ports templates/wishlist/wishlist.html (the original view was
// @login_required, same here).

import RequireAuth from '@/components/account/RequireAuth';
import ProductGrid from '@/components/product/ProductGrid';
import PageHeader from '@/components/ui/PageHeader';
import { useWishlist } from '@/context/WishlistContext';

function WishlistContent() {
  const { items } = useWishlist();

  return (
    <>
      <PageHeader eyebrow="Saved" title="Your Wishlist" />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container">
          <ProductGrid
            products={items}
            emptyMessage="Nothing saved yet — tap the heart icon on any product to add it here."
          />
        </div>
      </div>
    </>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <WishlistContent />
    </RequireAuth>
  );
}
