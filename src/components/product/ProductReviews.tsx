'use client';

// Customer reviews: average + per-star breakdown, list, and the review
// form for signed-in customers.

import Link from 'next/link';
import { useState } from 'react';
import Stars from '@/components/ui/Stars';
import { useAuth } from '@/context/AuthContext';
import { averageRating, productReviews as resolveReviews } from '@/lib/product';
import type { Product, ProductReview } from '@/lib/types';
import ReviewForm from './ReviewForm';

export default function ProductReviews({ product }: { product: Product }) {
  const [extra, setExtra] = useState<ProductReview[]>([]);
  const [writing, setWriting] = useState(false);
  const { isAuthenticated } = useAuth();
  const reviews = resolveReviews(product, extra);
  const avg = averageRating(product, extra);
  const counts = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));

  return (
    <section className="fx-spec-section" id="reviews">
      <h2>Customer Reviews</h2>
      <div className="fx-reviews">
        <div>
          <div className="fx-reviews-score">
            <strong>{reviews.length ? avg.toFixed(1) : '–'}</strong>
          </div>
          <Stars value={avg} size={16} />
          <p className="fx-muted" style={{ fontSize: 12, marginTop: 6 }}>Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
          <div className="fx-bars">
            {counts.map(({ star, n }) => (
              <div key={star}>
                <span>{star}★</span>
                <i><b style={{ width: reviews.length ? `${(n / reviews.length) * 100}%` : 0 }} /></i>
                <span>{n}</span>
              </div>
            ))}
          </div>
          {isAuthenticated ? (
            <button type="button" className="fx-btn fx-btn-block fx-btn-round fx-btn-sm" onClick={() => setWriting((v) => !v)}>
              {writing ? 'Close' : 'Write a review'}
            </button>
          ) : (
            <Link href={`/accounts/login?next=/shop/${product.slug}`} className="fx-btn fx-btn-block fx-btn-round fx-btn-sm">Sign in to review</Link>
          )}
        </div>
        <div>
          {writing && (
            <ReviewForm
              productSlug={product.slug}
              onSubmitted={(r) => {
                setExtra((prev) => [r, ...prev]);
                setWriting(false);
              }}
            />
          )}
          {reviews.length === 0 && !writing && <p className="fx-muted">No reviews yet — be the first to share your experience.</p>}
          {reviews.slice(0, 8).map((review) => (
            <div key={review.id} className="fx-review">
              <Stars value={review.rating} size={12} />
              {review.title && <h4>{review.title}</h4>}
              {review.comment && <p>{review.comment}</p>}
              <small>
                {review.user.first_name || review.user.username} ·{' '}
                {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
