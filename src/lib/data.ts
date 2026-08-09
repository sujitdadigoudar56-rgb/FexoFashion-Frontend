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
  SiteSettings,
  Testimonial,
} from './types';

interface DRFPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function getOrUndefined<T>(path: string): Promise<T | undefined> {
  try {
    return await apiFetch<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return apiFetch<SiteSettings>('/api/site-settings/');
}

export async function getBanners(): Promise<Banner[]> {
  return apiFetch<Banner[]>('/api/banners/');
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/categories/');
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return getOrUndefined<Category>(`/api/categories/${encodeURIComponent(slug)}/`);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  return getOrUndefined<Collection>(`/api/collections/${encodeURIComponent(slug)}/`);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>('/api/testimonials/');
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  return apiFetch<InstagramPost[]>('/api/instagram-posts/');
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return apiFetch<BlogPost[]>('/api/journal/');
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return getOrUndefined<BlogPost>(`/api/journal/${encodeURIComponent(slug)}/`);
}

export async function getFAQs(): Promise<FAQItem[]> {
  return apiFetch<FAQItem[]>('/api/faqs/');
}

export async function getAllProducts(): Promise<Product[]> {
  const page = await apiFetch<DRFPage<Product>>('/api/products/');
  return page.results;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return getOrUndefined<Product>(`/api/products/${encodeURIComponent(slug)}/`);
}

async function getFlagged(flag: string, limit: number): Promise<Product[]> {
  const page = await apiFetch<DRFPage<Product>>(`/api/products/?${flag}=true`);
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
  const page = await apiFetch<DRFPage<Product>>(`/api/products/?category=${encodeURIComponent(product.category.slug)}`);
  return page.results.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function getCompleteTheLook(product: Product, limit = 4): Promise<Product[]> {
  // No dedicated endpoint for this — same "other category, random order"
  // rule the original product_detail view used, just requested via the
  // list endpoint's sort=random instead of computed server-side per call.
  const page = await apiFetch<DRFPage<Product>>('/api/products/?sort=random');
  return page.results.filter((p) => p.id !== product.id && p.category.id !== product.category.id).slice(0, limit);
}

export interface ProductFilters {
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  sort?: 'newest' | 'price_low' | 'price_high' | 'name';
  page?: number;
  pageSize?: number;
}

export interface ProductPage {
  items: Product[];
  count: number;
  page: number;
  numPages: number;
}

const PAGE_SIZE = 12; // matches REST_FRAMEWORK['PAGE_SIZE'] in fexo_project/settings.py

export async function getFilteredProducts(filters: ProductFilters): Promise<ProductPage> {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.collection) params.set('collection', filters.collection);
  if (filters.minPrice !== undefined) params.set('min_price', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('max_price', String(filters.maxPrice));
  if (filters.size) params.set('size', filters.size);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));

  const data = await apiFetch<DRFPage<Product>>(`/api/products/?${params.toString()}`);
  return {
    items: data.results,
    count: data.count,
    page: filters.page ?? 1,
    numPages: Math.max(1, Math.ceil(data.count / PAGE_SIZE)),
  };
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
