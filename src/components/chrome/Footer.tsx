'use client';

// Ports #fx-footer from base.html, including the newsletter signup form.
// PHASE 2: POST { email } to /newsletter/ instead of showing a toast.

import Link from 'next/link';
import { useState } from 'react';
import { useMessages } from '@/context/MessageContext';
import type { SiteSettings } from '@/lib/types';

export default function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  const [email, setEmail] = useState('');
  const { pushMessage } = useMessages();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushMessage('Thanks for subscribing to FEXO.', 'success');
    setEmail('');
  };

  return (
    <footer id="fx-footer">
      <div className="fx-container">
        <div className="fx-footer-grid">
          <div className="fx-footer-col">
            <h4 className="fx-serif" style={{ fontSize: 22, letterSpacing: '.1em' }}>FEXO</h4>
            <p>{siteSettings.tagline}. An editorial house built for those who dress with intent.</p>
            <div className="fx-social">
              <a href="#">IG</a>
              <a href="#">FB</a>
              <a href="#">TW</a>
            </div>
          </div>
          <div className="fx-footer-col">
            <h4>Shop</h4>
            <Link href="/shop">All Products</Link>
            <Link href="/shop?sort=newest">New Arrivals</Link>
            <Link href="/shop?sort=price_low">Best Sellers</Link>
          </div>
          <div className="fx-footer-col">
            <h4>Support</h4>
            <Link href="/faq">FAQ</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
          <div className="fx-footer-col">
            <h4>Company</h4>
            <Link href="/about">About FEXO</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </div>
          <div className="fx-footer-col">
            <h4>Stay In The Loop</h4>
            <p>Sign up for early access to drops.</p>
            <form className="fx-newsletter-row" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Join</button>
            </form>
          </div>
        </div>
        <div className="fx-footer-bottom">
          <span>&copy; {new Date().getFullYear()} FEXO. All rights reserved.</span>
          <span>Crafted for those who move beyond fashion.</span>
        </div>
      </div>
    </footer>
  );
}
