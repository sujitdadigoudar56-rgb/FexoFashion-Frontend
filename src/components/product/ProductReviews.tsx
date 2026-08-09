'use client';

// Ports the "Reviews" section from products/product_detail.html —
// `product.reviews` is already nested in the GET /api/products/<slug>/
// response; `extra` just splices in a just-submitted review optimistically.

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productReviews as resolveReviews, reviewCount } from '@/lib/product';
import type { Product, ProductReview } from '@/lib/types';
import StarRating from '../ui/StarRating';
import ReviewForm from './ReviewForm';

export default function ProductReviews({ product }: { product: Product }) {
  const [extraReviews, setExtraReviews] = useState<ProductReview[]>([]);
  const { isAuthenticated } = useAuth();

  const reviews = resolveReviews(product, extraReviews);

  return (
    <section className="fx-section" style={{ background: 'var(--fx-secondary)' }}>
      <div className="fx-container" style={{ maxWidth: 800 }}>
        <div className="fx-section-head">
          <div>
            <span className="fx-eyebrow">Reviews</span>
            <h2>{reviewCount(product, extraReviews)} Reviews</h2>
          </div>
        </div>

        {reviews.length === 0 && (
          <p className="fx-muted">No reviews yet — be the first to share your experience.</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} style={{ borderBottom: '1px solid var(--fx-line-soft)', padding: '20px 0' }}>
            <StarRating value={review.rating} />
            <h4 style={{ fontFamily: 'var(--fx-sans)', fontSize: 15, margin: '8px 0 4px' }}>{review.title}</h4>
            <p className="fx-muted" style={{ fontSize: 14 }}>{review.comment}</p>
            <span className="fx-muted" style={{ fontSize: 12 }}>
              {review.user.first_name || review.user.username} &middot;{' '}
              {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        ))}

        {isAuthenticated ? (
          <ReviewForm productSlug={product.slug} onSubmitted={(r) => setExtraReviews((prev) => [r, ...prev])} />
        ) : (
          <p className="fx-muted">
            <Link href="/accounts/login" style={{ textDecoration: 'underline' }}>
              Sign in
            </Link>{' '}
            to leave a review.
          </p>
        )}
      </div>
    </section>
  );
}
