// Ports templates/website/home.html.

import Link from 'next/link';
import ProductGrid from '@/components/product/ProductGrid';
import CategoryTile from '@/components/ui/CategoryTile';
import MagneticLink from '@/components/ui/MagneticLink';
import StarRating from '@/components/ui/StarRating';
import {
  getBanners,
  getBestSellers,
  getCategories,
  getFeaturedProducts,
  getInstagramPosts,
  getNewArrivals,
  getSiteSettings,
  getTestimonials,
  getTrendingProducts,
} from '@/lib/data';

export default async function HomePage() {
  const [
    siteSettings,
    banners,
    categories,
    featuredProducts,
    trendingProducts,
    newArrivals,
    bestSellers,
    testimonials,
    instagramPosts,
  ] = await Promise.all([
    getSiteSettings(),
    getBanners(),
    getCategories(),
    getFeaturedProducts(),
    getTrendingProducts(),
    getNewArrivals(),
    getBestSellers(),
    getTestimonials(),
    getInstagramPosts(),
  ]);

  const banner = banners[0];

  return (
    <>
      <section className="fx-hero">
        <div className="fx-hero-media">
          <img
            src={banner?.image ?? 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=1600'}
            alt={banner?.title ?? 'FEXO'}
          />
        </div>
        <div className="fx-hero-content">
          <span className="fx-eyebrow">{siteSettings.site_name} — Autumn Collection</span>
          <h1 className="fx-serif">
            Live in
            <br />
            Fashion.
          </h1>
          <p>Precision-cut silhouettes, uncompromising fabric, and a wardrobe built for permanence — not trend cycles.</p>
          <MagneticLink href="/shop" className="fx-btn fx-btn-solid fx-magnetic">
            Discover the Collection
          </MagneticLink>
        </div>
      </section>

      <section className="fx-section">
        <div className="fx-container">
          <div className="fx-section-head fx-reveal">
            <div>
              <span className="fx-eyebrow">Shop by</span>
              <h2>Category</h2>
            </div>
            <Link href="/shop" className="fx-view-all">View All</Link>
          </div>
          <div className="fx-cat-grid">
            {categories.length === 0 && (
              <p className="fx-muted">Categories will appear here once added in the admin dashboard.</p>
            )}
            {categories.map((cat) => (
              <CategoryTile key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="fx-section" style={{ background: 'var(--fx-secondary)' }}>
          <div className="fx-container">
            <div className="fx-section-head fx-reveal">
              <div>
                <span className="fx-eyebrow">Curated</span>
                <h2>Featured Pieces</h2>
              </div>
              <Link href="/shop" className="fx-view-all">View All</Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}

      {trendingProducts.length > 0 && (
        <section className="fx-section">
          <div className="fx-container">
            <div className="fx-section-head fx-reveal">
              <div>
                <span className="fx-eyebrow">Right Now</span>
                <h2>Trending</h2>
              </div>
              <Link href="/shop" className="fx-view-all">View All</Link>
            </div>
            <ProductGrid products={trendingProducts} />
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="fx-section" style={{ background: 'var(--fx-secondary)' }}>
          <div className="fx-container">
            <div className="fx-section-head fx-reveal">
              <div>
                <span className="fx-eyebrow">Just Landed</span>
                <h2>New Arrivals</h2>
              </div>
              <Link href="/shop" className="fx-view-all">View All</Link>
            </div>
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      )}

      <section className="fx-section fx-reveal">
        <div className="fx-container" style={{ textAlign: 'center', maxWidth: 760 }}>
          <span className="fx-eyebrow">The FEXO Standard</span>
          <h2 style={{ margin: '18px 0 24px', fontSize: 'clamp(28px,4vw,42px)' }}>
            Every piece is a quiet argument for restraint.
          </h2>
          <p className="fx-muted">
            We work with a small number of ateliers, favor natural fibers, and release in limited runs.
            No noise. No filler. Just clothing engineered to outlast the season it was made for.
          </p>
          <Link href="/about" className="fx-btn" style={{ marginTop: 28 }}>Our Story</Link>
        </div>
      </section>

      {bestSellers.length > 0 && (
        <section className="fx-section" style={{ background: 'var(--fx-secondary)' }}>
          <div className="fx-container">
            <div className="fx-section-head fx-reveal">
              <div>
                <span className="fx-eyebrow">Fan Favorites</span>
                <h2>Best Sellers</h2>
              </div>
              <Link href="/shop" className="fx-view-all">View All</Link>
            </div>
            <ProductGrid products={bestSellers} />
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="fx-section">
          <div className="fx-container">
            <div className="fx-section-head fx-reveal">
              <div>
                <span className="fx-eyebrow">Words</span>
                <h2>From Our Clientele</h2>
              </div>
            </div>
            <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              {testimonials.map((t) => (
                <div key={t.id} className="fx-reveal" style={{ border: '1px solid var(--fx-line-soft)', padding: 32 }}>
                  <StarRating />
                  <p className="fx-serif" style={{ fontSize: 19, margin: '16px 0', lineHeight: 1.5 }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <span className="fx-muted" style={{ fontSize: 13 }}>
                    {t.author_name}
                    {t.author_title ? `, ${t.author_title}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {instagramPosts.length > 0 && (
        <section className="fx-section" style={{ paddingTop: 0 }}>
          <div className="fx-container">
            <div className="fx-section-head fx-reveal">
              <div>
                <span className="fx-eyebrow">@fexo</span>
                <h2>Follow the House</h2>
              </div>
            </div>
            <div className="fx-cat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {instagramPosts.map((post) => (
                <a key={post.id} href={post.link_url || '#'} className="fx-cat-tile" style={{ aspectRatio: '1/1' }}>
                  <img src={post.image} alt="Instagram" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
