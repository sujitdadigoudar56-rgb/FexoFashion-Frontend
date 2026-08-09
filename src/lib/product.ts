// Pure helpers mirroring the @property computed fields on the Django
// Product model (products/models.py) — kept as functions rather than
// stored fields so price/stock/rating stay derived from one source.

import type { Product, ProductImage, ProductReview } from './types';

export function sizesList(product: Product): string[] {
  return product.available_sizes
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isOnSale(product: Product): boolean {
  return Boolean(product.compare_at_price && product.compare_at_price > product.price);
}

export function discountPercent(product: Product): number {
  if (!isOnSale(product) || !product.compare_at_price) return 0;
  return Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100);
}

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
}

export function inStock(product: Product): boolean {
  return totalStock(product) > 0;
}

export function primaryImage(product: Product): ProductImage | undefined {
  return product.images.find((img) => img.is_primary) ?? product.images[0];
}

export function secondaryImage(product: Product): ProductImage | undefined {
  return product.images.find((img) => !img.is_primary) ?? product.images[1];
}

export function productReviews(product: Product, extra: ProductReview[] = []): ProductReview[] {
  // `product.reviews` comes nested from GET /api/products/<slug>/
  // (already approved-only, see products/serializers.py); `extra` lets
  // ProductReviews.tsx splice in a just-submitted review optimistically
  // without waiting for a refetch.
  const seen = new Set<number>();
  return [...extra, ...product.reviews]
    .filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function averageRating(product: Product, extra: ProductReview[] = []): number {
  const list = productReviews(product, extra);
  if (!list.length) return 0;
  return Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10;
}

export function reviewCount(product: Product, extra: ProductReview[] = []): number {
  return productReviews(product, extra).length;
}

export function productUrl(product: Product): string {
  return `/shop/${product.slug}`;
}

export function gstAmount(product: Product, quantity: number): number {
  return Math.round(product.price * quantity * (product.gst_percent / 100) * 100) / 100;
}
