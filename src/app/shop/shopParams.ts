// Shop URL <-> filter state. Every filter lives in the query string so a
// filtered view can be shared, bookmarked and navigated with Back.

import type { ProductFilters, ProductSort } from '@/lib/data';

export interface ShopSearchParams {
  category?: string;
  collection?: string;
  size?: string;
  color?: string;
  price?: string;
  in_stock?: string;
  sort?: string;
  page?: string;
}

export interface ShopState {
  categories: string[];
  sizes: string[];
  colors: string[];
  prices: string[];
  inStock: boolean;
  sort: ProductSort;
  page: number;
}

export const PRICE_BANDS = [
  { value: '0-4999', label: 'Under ₹5,000' },
  { value: '5000-9999', label: '₹5,000 – ₹9,999' },
  { value: '10000-14999', label: '₹10,000 – ₹14,999' },
  { value: '15000-', label: '₹15,000 & above' },
];

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'discount_high', label: 'Biggest discount' },
  { value: 'name', label: 'Name A–Z' },
];

const list = (v?: string) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

export function parseShopParams(sp: ShopSearchParams, fixedCategory?: string): ShopState {
  const sort = SORT_OPTIONS.some((o) => o.value === sp.sort) ? (sp.sort as ProductSort) : 'newest';
  const categories = list(sp.category);
  if (fixedCategory && !categories.includes(fixedCategory)) categories.unshift(fixedCategory);
  return {
    categories,
    sizes: list(sp.size),
    colors: list(sp.color),
    prices: list(sp.price),
    inStock: sp.in_stock === 'true',
    sort,
    page: Math.max(1, Number(sp.page) || 1),
  };
}

export function toFilters(state: ShopState, collection?: string): ProductFilters {
  return {
    categories: state.categories,
    collection,
    sizes: state.sizes,
    colors: state.colors,
    prices: state.prices,
    inStock: state.inStock,
    sort: state.sort,
    page: state.page,
  };
}

/** Query string for a state (page omitted when 1, sort when "newest"). */
export function toQuery(state: ShopState): string {
  const p = new URLSearchParams();
  if (state.categories.length) p.set('category', state.categories.join(','));
  if (state.sizes.length) p.set('size', state.sizes.join(','));
  if (state.colors.length) p.set('color', state.colors.join(','));
  if (state.prices.length) p.set('price', state.prices.join(','));
  if (state.inStock) p.set('in_stock', 'true');
  if (state.sort !== 'newest') p.set('sort', state.sort);
  if (state.page > 1) p.set('page', String(state.page));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export function activeFilterCount(state: ShopState): number {
  return state.categories.length + state.sizes.length + state.colors.length + state.prices.length + (state.inStock ? 1 : 0);
}
