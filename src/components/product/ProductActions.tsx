'use client';

// Ports the size picker + qty stepper + "Add to Bag" form from
// products/product_detail.html.

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { inStock, sizesList } from '@/lib/product';
import type { Product } from '@/lib/types';
import QtyBox from './QtyBox';

export default function ProductActions({ product }: { product: Product }) {
  const sizes = sizesList(product);
  const [variantId, setVariantId] = useState<number | null>(product.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const stocked = inStock(product);

  return (
    <div>
      {sizes.length > 0 && (
        <>
          <div className="fx-form-label">Size</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {product.variants.map((variant) => {
              const outOfStock = variant.stock_quantity === 0;
              const selected = variantId === variant.id;
              return (
                <label
                  key={variant.id}
                  style={{
                    border: '1px solid var(--fx-line)',
                    padding: '10px 16px',
                    cursor: outOfStock ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                    opacity: outOfStock ? 0.5 : 1,
                    background: selected ? 'var(--fx-accent)' : 'transparent',
                    color: selected ? 'var(--fx-on-accent)' : 'var(--fx-accent)',
                  }}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={variant.id}
                    checked={selected}
                    onChange={() => setVariantId(variant.id)}
                    disabled={outOfStock}
                    style={{ display: 'none' }}
                  />
                  {variant.size} {outOfStock && <span className="fx-muted">(Out)</span>}
                </label>
              );
            })}
          </div>
        </>
      )}

      <div style={{ marginBottom: 24 }}>
        <QtyBox value={quantity} onChange={setQuantity} min={1} />
      </div>

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
    </div>
  );
}
