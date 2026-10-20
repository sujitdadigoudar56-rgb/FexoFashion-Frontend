'use client';

// Ports the "Recently Viewed" section from products/product_detail.html —
// backed by localStorage instead of the Django session-scoped
// RecentlyViewed model (that relied on session cookies, which the
// token-authenticated frontend doesn't send). Stores a small snapshot per
// product, re-checked against the API on each view so deleted products
// drop out and price/image changes show up.

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiError, apiFetch } from '@/lib/api';
import { readStorage, STORAGE_KEYS, writeStorage } from '@/lib/storage';
import { rupees } from '@/lib/format';
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
    const existing = readStorage<ViewedSnapshot[]>(STORAGE_KEYS.recentlyViewed, []).filter((p) => p.id !== product.id);
    writeStorage(STORAGE_KEYS.recentlyViewed, [snapshotOf(product), ...existing].slice(0, MAX));
    let cancelled = false;
    // Only a 404 removes an entry; a network blip keeps the old snapshot.
    Promise.all(
      existing.map((p) =>
        apiFetch<Product>(`/api/products/${encodeURIComponent(p.slug)}/`, { skipAuth: true }).then(snapshotOf, (err) =>
          err instanceof ApiError && err.status === 404 ? null : p
        )
      )
    ).then((live) => {
      if (cancelled) return;
      const alive = live.filter((p): p is ViewedSnapshot => p !== null);
      setOthers(alive.slice(0, 4));
      writeStorage(STORAGE_KEYS.recentlyViewed, [snapshotOf(product), ...alive].slice(0, MAX));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  if (!others.length) return null;

  return (
    <section className="fx-spec-section">
      <h2>Recently Viewed</h2>
      <div className="fx-grid">
        {others.map((p) => (
          <article key={p.id} className="fx-pcard">
            <Link href={`/shop/${p.slug}`} className="fx-pcard-media" aria-label={p.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="fx-img-primary"
                src={p.image ?? `https://placehold.co/600x750/0e0e0e/8a8a8a?text=${encodeURIComponent(p.name)}`}
                alt={p.name}
                loading="lazy"
              />
            </Link>
            <div className="fx-pcard-body">
              <Link href={`/shop/${p.slug}`} className="fx-pcard-name">{p.name}</Link>
              <div className="fx-pcard-price">{rupees(p.price)}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
