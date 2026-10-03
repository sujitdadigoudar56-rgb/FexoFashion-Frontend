// Data-access seam: every page/component reads content through these
// functions rather than calling the Django API directly. This is the
// same seam Phase 1 built against mock data — bodies now call the real
// REST API (Fexo_backend, mounted under /api/) instead, but the exported
// function names/signatures are unchanged, so no page had to change for
// the read side of this rewire.

import { apiFetch, ApiError } from './api';
import type {
  Banner,
  BlogPost,
  Category,
  Collection,
  FAQItem,
  InstagramPost,
  Product,
  ProductFacets,
  SiteSettings,
  Testimonial,
} from './types';

interface DRFPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Public catalogue/content is cached on the server for this long, so page
// navigations render from cache instead of waiting on the API each time.
// Admin edits show up within this window.
const CONTENT_TTL = 60;
const CATALOG_TTL = 30;

async function getOrUndefined<T>(path: string, revalidate = CATALOG_TTL): Promise<T | undefined> {
  try {
    return await apiFetch<T>(path, { revalidate });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return apiFetch<SiteSettings>('/api/site-settings/', { revalidate: CONTENT_TTL });
}

export async function getBanners(): Promise<Banner[]> {
  return apiFetch<Banner[]>('/api/banners/', { revalidate: CONTENT_TTL });
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/categories/', { revalidate: CONTENT_TTL });
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return getOrUndefined<Category>(`/api/categories/${encodeURIComponent(slug)}/`);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  return getOrUndefined<Collection>(`/api/collections/${encodeURIComponent(slug)}/`);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>('/api/testimonials/', { revalidate: CONTENT_TTL });
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  return apiFetch<InstagramPost[]>('/api/instagram-posts/', { revalidate: CONTENT_TTL });
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return apiFetch<BlogPost[]>('/api/journal/', { revalidate: CONTENT_TTL });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return getOrUndefined<BlogPost>(`/api/journal/${encodeURIComponent(slug)}/`);
}

export async function getFAQs(): Promise<FAQItem[]> {
  return apiFetch<FAQItem[]>('/api/faqs/', { revalidate: CONTENT_TTL });
}

export async function getAllProducts(): Promise<Product[]> {
  const page = await apiFetch<DRFPage<Product>>('/api/products/', { revalidate: CATALOG_TTL });
  return page.results;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return getOrUndefined<Product>(`/api/products/${encodeURIComponent(slug)}/`);
}

async function getFlagged(flag: string, limit: number): Promise<Product[]> {
  const page = await apiFetch<DRFPage<Product>>(`/api/products/?${flag}=true`, { revalidate: CATALOG_TTL });
  return page.results.slice(0, limit);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return getFlagged('is_featured', limit);
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  return getFlagged('is_trending', limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return getFlagged('is_new_arrival', limit);
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return getFlagged('is_best_seller', limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const page = await apiFetch<DRFPage<Product>>(
    `/api/products/?category=${encodeURIComponent(product.category.slug)}`,
    { revalidate: CATALOG_TTL }
  );
  return page.results.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getCompleteTheLook(product: Product, limit = 4): Promise<Product[]> {
  // No dedicated endpoint for this — same "other category, random order"
  // rule the original product_detail view used, just requested via the
  // list endpoint's sort=random instead of computed server-side per call.
  const page = await apiFetch<DRFPage<Product>>('/api/products/?sort=random', { revalidate: CATALOG_TTL });
  return page.results.filter((p) => p.id !== product.id && p.category.id !== product.category.id).slice(0, limit);
}

export type ProductSort =
  | 'newest'
  | 'relevance'
  | 'popularity'
  | 'rating'
  | 'price_low'
  | 'price_high'
  | 'discount_high'
  | 'name';

export interface ProductFilters {
  categories?: string[];
  collection?: string;
  sizes?: string[];
  colors?: string[];
  /** Price bands like "0-1000" or "3000-" (open-ended). */
  prices?: string[];
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
}

export interface ProductPage {
  items: Product[];
  count: number;
  page: number;
  pageSize: number;
  numPages: number;
}

export const SHOP_PAGE_SIZE = 9; // 3 x 3 grid

export async function getFilteredProducts(filters: ProductFilters): Promise<ProductPage> {
  const params = new URLSearchParams();
  if (filters.categories?.length) params.set('category', filters.categories.join(','));
  if (filters.collection) params.set('collection', filters.collection);
  if (filters.sizes?.length) params.set('size', filters.sizes.join(','));
  if (filters.colors?.length) params.set('color', filters.colors.join(','));
  if (filters.prices?.length) params.set('price', filters.prices.join(','));
  if (filters.inStock) params.set('in_stock', 'true');
  if (filters.minPrice !== undefined) params.set('min_price', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('max_price', String(filters.maxPrice));
  if (filters.sort) params.set('sort', filters.sort);
  params.set('page', String(filters.page ?? 1));
  params.set('page_size', String(SHOP_PAGE_SIZE));

  try {
    const data = await apiFetch<DRFPage<Product>>(`/api/products/?${params.toString()}`, { revalidate: CATALOG_TTL });
    return {
      items: data.results,
      count: data.count,
      page: filters.page ?? 1,
      pageSize: SHOP_PAGE_SIZE,
      numPages: Math.max(1, Math.ceil(data.count / SHOP_PAGE_SIZE)),
    };
  } catch (err) {
    // DRF answers 404 for a page past the end (e.g. after narrowing filters).
    if (err instanceof ApiError && err.status === 404 && (filters.page ?? 1) > 1) {
      return getFilteredProducts({ ...filters, page: 1 });
    }
    throw err;
  }
}

export async function getProductFacets(): Promise<ProductFacets> {
  return apiFetch<ProductFacets>('/api/products/facets/', { revalidate: CONTENT_TTL });
}

export interface SearchSuggestion {
  name: string;
  slug: string;
}

export async function searchProducts(query: string): Promise<SearchSuggestion[]> {
  if (query.trim().length < 2) return [];
  const data = await apiFetch<{ results: SearchSuggestion[] }>(
    `/api/products/search-suggestions/?q=${encodeURIComponent(query)}`
  );
  return data.results;
}
