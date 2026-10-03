// Shop listing shared by /shop, /shop/category/[slug] and
// /shop/collection/[slug].

import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { getFilteredProducts, getProductFacets } from '@/lib/data';
import type { Category, Collection } from '@/lib/types';
import ShopPagination from './ShopPagination';
import ShopShell from './ShopShell';
import { parseShopParams, type ShopSearchParams, toFilters } from './shopParams';

export type { ShopSearchParams };

export default async function ShopView({
  searchParams,
  categoryObj,
  collectionObj,
}: {
  searchParams: ShopSearchParams;
  categoryObj?: Category;
  collectionObj?: Collection;
}) {
  const state = parseShopParams(searchParams, categoryObj?.slug);
  const [result, facets] = await Promise.all([
    getFilteredProducts(toFilters(state, collectionObj?.slug)),
    getProductFacets(),
  ]);
  const page = { ...state, page: result.page };
  // Collection pages keep their path; category/all-products filtering
  // lives on /shop so categories can be combined freely.
  const basePath = collectionObj ? `/shop/collection/${collectionObj.slug}` : '/shop';
  const title = collectionObj?.name ?? (state.categories.length === 1 ? facets.categories.find((c) => c.slug === state.categories[0])?.name : undefined) ?? 'All Products';
  const rangeStart = result.count ? (result.page - 1) * result.pageSize + 1 : 0;
  const rangeEnd = Math.min(result.count, result.page * result.pageSize);

  return (
    <div className="fx-container">
      <div style={{ paddingTop: 24 }}>
        <nav className="fx-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          {title === 'All Products' ? (
            <span aria-current="page">Shop</span>
          ) : (
            <>
              <Link href="/shop">Shop</Link>
              <span>/</span>
              <span aria-current="page">{title}</span>
            </>
          )}
        </nav>
        <h1 className="fx-h-title" style={{ marginTop: 10 }}>{title}</h1>
        {collectionObj?.description && <p className="fx-muted" style={{ marginTop: 8, maxWidth: 640, fontSize: 14 }}>{collectionObj.description}</p>}
      </div>

      <ShopShell
        state={page}
        facets={facets}
        basePath={basePath}
        count={result.count}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        scopeLabel={title !== 'All Products' ? title : undefined}
      >
        {result.items.length ? (
          <div className="fx-grid-3">
            {result.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="fx-empty">
            <h3>No products match these filters</h3>
            <p>Try removing a filter or two to see more of the collection.</p>
          </div>
        )}
        <ShopPagination state={page} numPages={result.numPages} basePath={basePath} />
      </ShopShell>
    </div>
  );
}
