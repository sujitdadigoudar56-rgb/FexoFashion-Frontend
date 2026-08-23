'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { inStock, sizesList } from '@/lib/product';
import type { Product } from '@/lib/types';
import QtyBox from './QtyBox';

export default function ProductActions({ product }: { product: Product }) {
  const sizes = sizesList(product);
  const [variantId, setVariantId] = useState<number | null>(product.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();
  const stocked = inStock(product);
  const [buying, setBuying] = useState(false);

  const handleBuyNow = async () => {
    setBuying(true);
    await addItem(product.slug, product.name, quantity, variantId);
    setBuying(false);
    router.push('/checkout');
  };

  return (
    <div>
      {/* ...size picker + QtyBox unchanged... */}

      <div style={{ display: 'flex', gap: 14 }}>
        <button
          type="button"
          className="fx-btn fx-btn-solid"
          style={{ flex: 1 }}
          disabled={!stocked}
          onClick={() => addItem(product.slug, product.name, quantity, variantId)}
        >
          {stocked ? 'Add to Bag' : 'Out of Stock'}
        </button>
      </div>
      <button
        type="button"
        className="fx-btn fx-btn-block"
        style={{ marginTop: 14 }}
        disabled={!stocked || buying}
        onClick={handleBuyNow}
      >
        {buying ? 'Please wait…' : 'Buy Now'}
      </button>
    </div>
  );
}