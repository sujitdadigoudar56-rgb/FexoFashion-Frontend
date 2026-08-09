'use client';

// Ports the "Recently Viewed" section from products/product_detail.html —
// backed by localStorage instead of the Django session-scoped
// RecentlyViewed model (that relied on session cookies, which the
// token-authenticated frontend doesn't send). Stores a small snapshot per
// product (not just an id) so no extra API call/lookup is needed to
// render this section.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readStorage, STORAGE_KEYS, writeStorage } from '@/lib/storage';
import type { Product } from '@/lib/types';

const MAX = 8;

interface ViewedSnapshot {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

function snapshotOf(product: Product): ViewedSnapshot {
  const primary = product.images.find((img) => img.is_primary) ?? product.images[0];
  return { id: product.id, name: product.name, slug: product.slug, price: product.price, image: primary?.image ?? null };
}

export default function RecentlyViewed({ product }: { product: Product }) {
  const [others, setOthers] = useState<ViewedSnapshot[]>([]);

  useEffect(() => {
    // Hydrate from localStorage post-mount (not available during SSR),
    // and record this product as viewed.
    const existing = readStorage<ViewedSnapshot[]>(STORAGE_KEYS.recentlyViewed, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOthers(existing.filter((p) => p.id !== product.id).slice(0, 4));
    const next = [snapshotOf(product), ...existing.filter((p) => p.id !== product.id)].slice(0, MAX);
    writeStorage(STORAGE_KEYS.recentlyViewed, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  if (!others.length) return null;

  return (
    <section className="fx-section">
      <div className="fx-container">
        <div className="fx-section-head">
          <div>
            <span className="fx-eyebrow">History</span>
            <h2>Recently Viewed</h2>
          </div>
        </div>
        <div className="fx-grid">
          {others.map((p) => (
            <div key={p.id} className="fx-card">
              <Link href={`/shop/${p.slug}`}>
                <div className="fx-card-media">
                  <img
                    className="fx-img-primary"
                    src={p.image ?? `https://placehold.co/600x800/0e0e0e/8a8a8a?text=${encodeURIComponent(p.name)}`}
                    alt={p.name}
                    loading="lazy"
                  />
                </div>
              </Link>
              <Link href={`/shop/${p.slug}`} className="fx-card-info">
                <h3>{p.name}</h3>
                <span className="fx-price">&#8377;{p.price}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
