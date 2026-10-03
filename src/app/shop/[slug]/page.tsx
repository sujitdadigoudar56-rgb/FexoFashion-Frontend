import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductActions from '@/components/product/ProductActions';
import ProductCard from '@/components/product/ProductCard';
import ProductGallery from '@/components/product/ProductGallery';
import ProductReviews from '@/components/product/ProductReviews';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import Stars from '@/components/ui/Stars';
import { getCompleteTheLook, getProductBySlug, getRelatedProducts } from '@/lib/data';
import { rupees } from '@/lib/format';
import { averageRating, discountPercent, isOnSale, reviewCount, sizesList } from '@/lib/product';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product?.name ?? 'Product',
    description: product ? product.short_description || product.name : undefined,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, completeTheLook] = await Promise.all([
    getRelatedProducts(product, 4).catch(() => []),
    getCompleteTheLook(product, 4).catch(() => []),
  ]);
  const suggestions = [...related, ...completeTheLook.filter((p) => !related.some((r) => r.id === p.id))].slice(0, 4);

  const onSale = isOnSale(product);
  const rating = averageRating(product);
  const reviews = reviewCount(product);
  const eyebrow = product.is_new_arrival ? 'New arrival' : product.is_best_seller ? 'Best seller' : product.category.name;

  const specs: [string, string][] = [
    ['Category', product.category.name],
    ['Colour', product.color || '—'],
    ['Sizes', sizesList(product).join(', ') || '—'],
    ['SKU', product.sku],
    ['Fabric & care', product.fabric_details || '—'],
    ['GST', `${product.gst_percent}% (included at checkout)`],
  ];

  return (
    <div className="fx-container">
      <nav className="fx-breadcrumbs" aria-label="Breadcrumb" style={{ paddingTop: 22 }}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="fx-pdp">
        <ProductGallery product={product} />
        <div className="fx-pdp-info">
          <span className="fx-eyebrow">{eyebrow}</span>
          <h1>{product.name}</h1>
          <div className="fx-pdp-rating">
            {reviews > 0 ? (
              <>
                <Stars value={rating} size={14} />
                <span>{rating.toFixed(1)}</span>
                <span className="fx-muted">|</span>
                <a href="#reviews">{reviews} review{reviews === 1 ? '' : 's'}</a>
              </>
            ) : (
              <a href="#reviews" className="fx-muted">No reviews yet — write the first</a>
            )}
          </div>
          <div className="fx-pdp-price">
            <strong>{rupees(product.price)}</strong>
            {onSale && (
              <>
                <span className="fx-strike">MRP {rupees(product.compare_at_price)}</span>
                <span className="off">({discountPercent(product)}% OFF)</span>
              </>
            )}
          </div>
          <p className="fx-pdp-tax">Price excludes GST, which is added at checkout.</p>
          {product.short_description && <p className="fx-muted" style={{ lineHeight: 1.7, fontSize: 14, marginBottom: 6 }}>{product.short_description}</p>}
          <ProductActions product={product} />
        </div>
      </div>

      <section className="fx-spec-section">
        <h2>Product Details &amp; Specifications</h2>
        <p className="fx-muted" style={{ lineHeight: 1.8, fontSize: 14, maxWidth: 820, marginBottom: 20 }}>{product.description}</p>
        <div className="fx-spec-grid">
          {specs.map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </section>

      {suggestions.length > 0 && (
        <section className="fx-spec-section">
          <h2>You May Also Like</h2>
          <div className="fx-grid">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <ProductReviews product={product} />
      <RecentlyViewed product={product} />
    </div>
  );
}
