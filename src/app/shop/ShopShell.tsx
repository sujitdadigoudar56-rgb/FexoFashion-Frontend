'use client';

// Interactive shell around the server-rendered product grid: filter
// sidebar, result count, sort menu and active-filter chips. Every change
// rewrites the URL (no "Apply" button); the grid dims while the new page
// streams in.

import { CircleCheck, SlidersHorizontal, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Dropdown from '@/components/ui/Dropdown';
import { colorHex } from '@/lib/format';
import type { ProductFacets } from '@/lib/types';
import { activeFilterCount, PRICE_BANDS, SORT_OPTIONS, type ShopState, toQuery } from './shopParams';

type ListKey = 'categories' | 'sizes' | 'colors' | 'prices';

export default function ShopShell({
  state,
  facets,
  basePath,
  count,
  rangeStart,
  rangeEnd,
  scopeLabel,
  children,
}: {
  state: ShopState;
  facets: ProductFacets;
  /** /shop, or /shop/collection/<slug> for a collection page. */
  basePath: string;
  count: number;
  rangeStart: number;
  rangeEnd: number;
  scopeLabel?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (next: ShopState) => {
    startTransition(() => {
      router.push(`${basePath}${toQuery({ ...next })}`, { scroll: false });
    });
  };

  const toggle = (key: ListKey, value: string) => {
    const current = state[key];
    const nextList = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    go({ ...state, [key]: nextList, page: 1 });
  };

  const clearAll = () => go({ ...state, categories: [], sizes: [], colors: [], prices: [], inStock: false, page: 1 });

  const n = activeFilterCount(state);
  const categoryName = (slug: string) => facets.categories.find((c) => c.slug === slug)?.name ?? slug;
  const priceLabel = (v: string) => PRICE_BANDS.find((b) => b.value === v)?.label ?? v;

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...state.categories.map((v) => ({ key: `c-${v}`, label: categoryName(v), remove: () => toggle('categories', v) })),
    ...state.sizes.map((v) => ({ key: `s-${v}`, label: `Size: ${v}`, remove: () => toggle('sizes', v) })),
    ...state.colors.map((v) => ({ key: `col-${v}`, label: v, remove: () => toggle('colors', v) })),
    ...state.prices.map((v) => ({ key: `p-${v}`, label: priceLabel(v), remove: () => toggle('prices', v) })),
    ...(state.inStock ? [{ key: 'stock', label: 'In stock', remove: () => go({ ...state, inStock: false, page: 1 }) }] : []),
  ];

  return (
    <div className="fx-shop">
      <div>
        <button type="button" className="fx-btn fx-btn-sm fx-btn-round fx-filters-toggle" onClick={() => setMobileOpen((v) => !v)} aria-expanded={mobileOpen}>
          <SlidersHorizontal size={14} aria-hidden /> Filters{n ? ` (${n})` : ''}
        </button>
        <aside className={`fx-filters${mobileOpen ? ' fx-open' : ''}`} aria-label="Product filters">
          {chips.length > 0 && (
            <div className="fx-filter-group">
              <div className="fx-filter-title">
                Active filters
                <button type="button" className="fx-clear-all" onClick={clearAll}>Clear all</button>
              </div>
              <div className="fx-active-filters">
                {chips.map((c) => (
                  <span key={c.key} className="fx-chip">
                    {c.label}
                    <button type="button" onClick={c.remove} aria-label={`Remove ${c.label}`}>
                      <X size={12} aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {facets.categories.length > 0 && (
            <div className="fx-filter-group">
              <div className="fx-filter-title">Category</div>
              <div className="fx-filter-list">
                {facets.categories.map((c) => {
                  const on = state.categories.includes(c.slug);
                  return (
                    <label key={c.slug} className={`fx-check${on ? ' fx-on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => toggle('categories', c.slug)} />
                      {c.name}
                      <span className="fx-count">{c.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {facets.sizes.length > 0 && (
            <div className="fx-filter-group">
              <div className="fx-filter-title">Size</div>
              <div className="fx-size-grid">
                {facets.sizes.map((s) => {
                  const on = state.sizes.includes(s);
                  return (
                    <button key={s} type="button" className={`fx-size-btn${on ? ' fx-on' : ''}`} aria-pressed={on} onClick={() => toggle('sizes', s)}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {facets.colors.length > 0 && (
            <div className="fx-filter-group">
              <div className="fx-filter-title">Colour</div>
              <div className="fx-filter-list">
                {facets.colors.map((c) => {
                  const on = state.colors.some((v) => v.toLowerCase() === c.toLowerCase());
                  return (
                    <label key={c} className={`fx-check${on ? ' fx-on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => toggle('colors', c)} className="sr-only-check" />
                      <span className={`fx-swatch-ring${on ? ' fx-on' : ''}`}>
                        <span className="fx-swatch" style={{ background: colorHex(c) }} />
                      </span>
                      {c}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="fx-filter-group">
            <div className="fx-filter-title">Price range</div>
            <div className="fx-filter-list">
              {PRICE_BANDS.map((b) => {
                const on = state.prices.includes(b.value);
                return (
                  <label key={b.value} className={`fx-check${on ? ' fx-on' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => toggle('prices', b.value)} />
                    {b.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="fx-filter-group">
            <div className="fx-filter-title">Availability</div>
            <div className="fx-filter-list">
              <label className={`fx-check${state.inStock ? ' fx-on' : ''}`}>
                <input type="checkbox" checked={state.inStock} onChange={() => go({ ...state, inStock: !state.inStock, page: 1 })} />
                In stock only
              </label>
            </div>
          </div>
        </aside>
      </div>

      <div>
        <div className="fx-shop-bar">
          <span className="fx-shop-count" aria-live="polite">
            {count > 0 ? (
              <>
                Showing <strong>{rangeStart}–{rangeEnd}</strong> of <strong>{count}</strong> product{count === 1 ? '' : 's'}
                {scopeLabel ? <> in <strong>{scopeLabel}</strong></> : null}
              </>
            ) : (
              'No products found'
            )}
          </span>
          <Dropdown label="Sort" value={state.sort} options={SORT_OPTIONS} onChange={(v) => go({ ...state, sort: v as ShopState['sort'], page: 1 })} />
        </div>
        {n > 0 && (
          <p className="fx-filter-note" role="status">
            <CircleCheck size={15} aria-hidden />
            {n} filter{n === 1 ? '' : 's'} applied — showing matching products only.
          </p>
        )}
        <div className={pending ? 'fx-shop-loading' : undefined} aria-busy={pending}>
          {children}
        </div>
      </div>
    </div>
  );
}
