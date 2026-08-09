// Shared rendering for templates/products/shop.html — reused by
// /shop, /shop/category/[slug] and /shop/collection/[slug].

import ProductGrid from '@/components/product/ProductGrid';
import PageHeader from '@/components/ui/PageHeader';
import { getCategories, getFilteredProducts, type ProductFilters } from '@/lib/data';
import type { Category, Collection } from '@/lib/types';
import ShopFilters from './ShopFilters';
import ShopPagination from './ShopPagination';
import SortSelect from './SortSelect';

export interface ShopSearchParams {
  category?: string;
  collection?: string;
  min_price?: string;
  max_price?: string;
  size?: string;
  sort?: string;
  page?: string;
}

export default async function ShopView({
  searchParams,
  categoryObj,
  collectionObj,
}: {
  searchParams: ShopSearchParams;
  categoryObj?: Category;
  collectionObj?: Collection;
}) {
  const categories = await getCategories();
  const sort = (searchParams.sort as ProductFilters['sort']) ?? 'newest';
  const categorySlug = categoryObj?.slug ?? searchParams.category;
  const collectionSlug = collectionObj?.slug ?? searchParams.collection;

  const result = await getFilteredProducts({
    category: categorySlug,
    collection: collectionSlug,
    minPrice: searchParams.min_price ? Number(searchParams.min_price) : undefined,
    maxPrice: searchParams.max_price ? Number(searchParams.max_price) : undefined,
    size: searchParams.size,
    sort,
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  const baseParams: Record<string, string> = {};
  if (categorySlug) baseParams.category = categorySlug;
  if (collectionSlug) baseParams.collection = collectionSlug;
  if (searchParams.min_price) baseParams.min_price = searchParams.min_price;
  if (searchParams.max_price) baseParams.max_price = searchParams.max_price;
  if (searchParams.size) baseParams.size = searchParams.size;
  if (sort) baseParams.sort = sort;

  const eyebrow = categoryObj ? 'Category' : collectionObj ? 'Collection' : 'Shop';
  const title = categoryObj?.name ?? collectionObj?.name ?? 'All Products';

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <div className="fx-section" style={{ paddingTop: 56 }}>
        <div className="fx-container" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 48 }}>
          <ShopFilters categories={categories} currentCategorySlug={categorySlug} baseParams={baseParams} />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <span className="fx-muted" style={{ fontSize: 13 }}>{result.count} pieces</span>
              <SortSelect currentSort={sort ?? 'newest'} baseParams={baseParams} />
            </div>
            <ProductGrid products={result.items} emptyMessage="No products match your filters yet." />
            {result.numPages > 1 && (
              <ShopPagination page={result.page} numPages={result.numPages} baseParams={baseParams} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
