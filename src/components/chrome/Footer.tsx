'use client';

// Site footer: newsletter band (POSTs to /api/newsletter/), link columns,
// and social links taken from Site settings in the admin. A network is
// only shown when its URL is set, and links open that site in a new tab.

import Link from 'next/link';
import { useState } from 'react';
import { useMessages } from '@/context/MessageContext';
import { apiFetch, ApiError } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5H16.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5z" />
    </svg>
  );
}

export default function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { pushMessage } = useMessages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/api/newsletter/', { method: 'POST', body: { email }, skipAuth: true });
      pushMessage('Thanks for subscribing to FEXO.', 'success');
      setEmail('');
    } catch (err) {
      const already = err instanceof ApiError && JSON.stringify(err.body ?? '').toLowerCase().includes('already');
      pushMessage(already ? "You're already subscribed." : 'Could not subscribe right now — please try again.', already ? 'info' : 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const socials = [
    { url: siteSettings.instagram_url, label: 'Instagram', icon: <InstagramIcon /> },
    { url: siteSettings.facebook_url, label: 'Facebook', icon: <FacebookIcon /> },
    { url: siteSettings.twitter_url, label: 'X (Twitter)', icon: <XIcon /> },
  ].filter((s) => s.url);

  return (
    <footer id="fx-footer" className="fx-footer-dark">
      <div className="fx-footer-news">
        <span className="fx-eyebrow">FEXO Privilege</span>
        <h2>Join the FEXO World</h2>
        <p>Subscribe for early access to new drops, limited runs and lookbook releases. Considered menswear, straight to your inbox.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Enter your email address"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={submitting}>{submitting ? 'Joining…' : 'Subscribe'}</button>
        </form>
      </div>

      <div className="fx-container">
        <div className="fx-footer-cols">
          <div className="fx-footer-brand">
            <div className="fx-footer-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fexo-logo.jpg" alt="" width={36} height={36} />
              <span>{siteSettings.site_name || 'FEXO'}</span>
            </div>
            <div className="tag">{siteSettings.tagline}</div>
            <p>An editorial house for considered everyday menswear — precise silhouettes, honest fabrics, made in small batches.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link href="/shop">All Products</Link>
            <Link href="/shop?sort=newest">New Arrivals</Link>
            <Link href="/shop?sort=popularity">Best Sellers</Link>
          </div>
          <div>
            <h4>Help</h4>
            <Link href="/faq">FAQ</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/contact">Contact Support</Link>
            <Link href="/accounts/orders">Track Order</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href="/about">About FEXO</Link>
            <Link href="/journal">The Journal</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/returns">Refund Policy</Link>
          </div>
        </div>

        <div className="fx-footer-base">
          <span>&copy; {new Date().getFullYear()} {siteSettings.site_name || 'FEXO'}. All rights reserved.</span>
          <div className="fx-footer-pay" aria-label="Payment options">
            <span>Cash on Delivery</span>
          </div>
          {socials.length > 0 && (
            <div className="fx-footer-social">
              {socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
