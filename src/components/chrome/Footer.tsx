"use client";

import React, { useState } from 'react';

// Ports #fx-footer from base.html, including the newsletter signup form.
// PHASE 2: POST { email } to /newsletter/ instead of showing a toast.

import Link from 'next/link';
import { useMessages } from '@/context/MessageContext';
import type { SiteSettings } from '@/lib/types';

export default function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  const [email, setEmail] = useState('');
  const { pushMessage } = useMessages();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
              <a href="#" aria-label="Instagram" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M13 8h-2a2 2 0 0 0-2 2v2H7v3h2v7h3v-7h2.5l.5-3H12V10c0-.6.4-1 1-1Z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" title="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 4l16 16M20 4L4 20" />
                </svg>
              </a>
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
