'use client';

// Ports the filter <aside> from templates/products/shop.html. Submits by
// pushing a new /shop?... URL built from `baseParams` (which already
// carries whatever category/collection/sort context the current page has,
// whether that came from a path segment or the query string) merged with
// the price/size fields.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Category } from '@/lib/types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const headingStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  marginBottom: 18,
};

export default function ShopFilters({
  categories,
  currentCategorySlug,
  baseParams,
}: {
  categories: Category[];
  currentCategorySlug?: string;
  baseParams: Record<string, string>;
}) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams(baseParams);
    (['min_price', 'max_price', 'size'] as const).forEach((key) => {
      const value = form.get(key);
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <aside>
      <form onSubmit={handleSubmit}>
        <h4 style={headingStyle}>Category</h4>
        <ul style={{ marginBottom: 32 }}>
          <li style={{ marginBottom: 10 }}>
            <Link href="/shop" className={!currentCategorySlug ? 'fx-active' : 'fx-muted'}>All</Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id} style={{ marginBottom: 10 }}>
              <Link
                href={`/shop/category/${cat.slug}`}
                className={currentCategorySlug === cat.slug ? 'fx-active' : 'fx-muted'}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>

        <h4 style={headingStyle}>Price</h4>
        <input type="number" name="min_price" className="fx-input" placeholder="Min" defaultValue={baseParams.min_price ?? ''} />
        <input type="number" name="max_price" className="fx-input" placeholder="Max" defaultValue={baseParams.max_price ?? ''} />

        <h4 style={{ ...headingStyle, margin: '24px 0 18px' }}>Size</h4>
        <select name="size" className="fx-select" defaultValue={baseParams.size ?? ''}>
          <option value="">Any</option>
          {SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <button type="submit" className="fx-btn fx-btn-block">Apply Filters</button>
      </form>
    </aside>
  );
}
