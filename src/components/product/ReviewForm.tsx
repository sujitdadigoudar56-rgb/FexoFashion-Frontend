'use client';

// Ports the review submission form gated on `user.is_authenticated` from
// products/product_detail.html.

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessageContext';
import { apiFetch } from '@/lib/api';
import type { ProductReview } from '@/lib/types';

export default function ReviewForm({
  productSlug,
  onSubmitted,
}: {
  productSlug: string;
  onSubmitted: (review: ProductReview) => void;
}) {
  const { user } = useAuth();
  const { pushMessage } = useMessages();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const review = await apiFetch<ProductReview>(`/api/products/${productSlug}/review/`, {
        method: 'POST',
        body: { rating, title, comment },
      });
      onSubmitted(review);
      pushMessage('Thanks — your review has been posted.', 'success');
      setTitle('');
      setComment('');
      setRating(5);
    } catch {
      pushMessage('Could not post your review — please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 30 }}>
      <select className="fx-select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
        <option value={5}>5 — Excellent</option>
        <option value={4}>4 — Great</option>
        <option value={3}>3 — Good</option>
        <option value={2}>2 — Fair</option>
        <option value={1}>1 — Poor</option>
      </select>
      <input
        type="text"
        className="fx-input"
        placeholder="Review title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="fx-textarea"
        rows={4}
        placeholder="Share your thoughts"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit" className="fx-btn fx-btn-solid" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
