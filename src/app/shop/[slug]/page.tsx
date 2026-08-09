// Ports templates/products/product_detail.html.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductActions from '@/components/product/ProductActions';
import ProductGallery from '@/components/product/ProductGallery';
import ProductGrid from '@/components/product/ProductGrid';
import ProductReviews from '@/components/product/ProductReviews';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import WishlistButton from '@/components/product/WishlistButton';
import StarRating from '@/components/ui/StarRating';
import { getCompleteTheLook, getProductBySlug, getRelatedProducts } from '@/lib/data';
import { averageRating, isOnSale, reviewCount } from '@/lib/product';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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
    getRelatedProducts(product),
    getCompleteTheLook(product),
  ]);

  const onSale = isOnSale(product);
  const shortDescription = product.short_description || product.description.split(' ').slice(0, 40).join(' ');
  const detailHeadingStyle: React.CSSProperties = {
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ paddingTop: 110 }}>
      <div className="fx-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
        <ProductGallery product={product} />

        <div>
          <span className="fx-eyebrow">{product.category.name}</span>
          <h1 className="fx-serif" style={{ fontSize: 36, margin: '12px 0 8px' }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <StarRating />
            <span className="fx-muted" style={{ fontSize: 13 }}>
              {averageRating(product)} ({reviewCount(product)} reviews)
            </span>
          </div>
          <div style={{ fontSize: 24, marginBottom: 22 }}>
            {onSale && <del className="fx-muted" style={{ marginRight: 12 }}>&#8377;{product.compare_at_price}</del>}
            &#8377;{product.price}
          </div>
          <p className="fx-muted" style={{ lineHeight: 1.7, marginBottom: 28 }}>{shortDescription}</p>

          <ProductActions product={product} />
          <WishlistButton product={product} />

          <div style={{ marginTop: 40, borderTop: '1px solid var(--fx-line-soft)', paddingTop: 24 }}>
            <details style={{ marginBottom: 16 }}>
              <summary style={detailHeadingStyle}>Description</summary>
              <p className="fx-muted" style={{ marginTop: 12, lineHeight: 1.7 }}>{product.description}</p>
            </details>
            {product.fabric_details && (
              <details style={{ marginBottom: 16 }}>
                <summary style={detailHeadingStyle}>Fabric &amp; Care</summary>
                <p className="fx-muted" style={{ marginTop: 12, lineHeight: 1.7 }}>{product.fabric_details}</p>
              </details>
            )}
            {product.size_guide && (
              <details>
                <summary style={detailHeadingStyle}>Size Guide</summary>
                <p className="fx-muted" style={{ marginTop: 12, lineHeight: 1.7 }}>{product.size_guide}</p>
              </details>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="fx-section">
          <div className="fx-container">
            <div className="fx-section-head">
              <div><span className="fx-eyebrow">You May Also Like</span><h2>Related Pieces</h2></div>
            </div>
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      {completeTheLook.length > 0 && (
        <section className="fx-section" style={{ background: 'var(--fx-secondary)' }}>
          <div className="fx-container">
            <div className="fx-section-head">
              <div><span className="fx-eyebrow">Styled Together</span><h2>Complete the Look</h2></div>
            </div>
            <ProductGrid products={completeTheLook} />
          </div>
        </section>
      )}

      <RecentlyViewed product={product} />
      <ProductReviews product={product} />
    </div>
  );
}
