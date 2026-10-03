'use client';

// Ports #fx-footer from base.html, including the newsletter signup form.
// PHASE 2: POST { email } to /newsletter/ instead of showing a toast.

import Link from 'next/link';
import { useState } from 'react';
import { useMessages } from '@/context/MessageContext';
import type { SiteSettings } from '@/lib/types';

export default function Footer({
  siteSettings,
}: {
  siteSettings: SiteSettings;
}) {
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

          {/* FEXO */}
          <div className="fx-footer-col">
            <h4
              className="fx-serif"
              style={{
                fontSize: 22,
                letterSpacing: '.1em',
              }}
            >
              FEXO
            </h4>

            <p>
              {siteSettings.tagline}. An editorial house built for those
              who dress with intent.
            </p>

            {/* Social Icons */}
            <div className="fx-social">
              <a
                href="#"
                aria-label="Instagram"
                title="Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                  />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M15 8h-2a2 2 0 0 0-2 2v10M9 13h6" />
                  <path d="M15 2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Twitter"
                title="Twitter"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M22 4.6c-.8.35-1.6.6-2.5.7.9-.55 1.6-1.4 1.9-2.4-.85.5-1.8.85-2.8 1a4.4 4.4 0 0 0-7.5 4c-3.6-.2-6.9-1.9-9-4.6a4.4 4.4 0 0 0 1.4 5.9c-.7 0-1.4-.2-2-.5v.05a4.4 4.4 0 0 0 3.5 4.3c-.6.15-1.3.2-2 .07a4.4 4.4 0 0 0 4.1 3A8.8 8.8 0 0 1 2 19.5 12.4 12.4 0 0 0 8.7 21.5c8 0 12.4-6.7 12.4-12.4v-.6c.85-.6 1.6-1.4 2.2-2.3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="fx-footer-col">
            <h4>Shop</h4>
            <Link href="/shop">All Products</Link>
            <Link href="/shop?sort=newest">New Arrivals</Link>
            <Link href="/shop?sort=price_low">Best Sellers</Link>
          </div>

          {/* Support */}
          <div className="fx-footer-col">
            <h4>Support</h4>
            <Link href="/faq">FAQ</Link>
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/contact">Contact Us</Link>
          </div>

          {/* Company */}
          <div className="fx-footer-col">
            <h4>Company</h4>
            <Link href="/about">About FEXO</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">
              Terms &amp; Conditions
            </Link>
          </div>

          {/* Newsletter */}
          <div className="fx-footer-col">
            <h4>Stay In The Loop</h4>

            <p>
              Sign up for early access to drops.
            </p>

            <form
              className="fx-newsletter-row"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button type="submit">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="fx-footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} FEXO. All rights reserved.
          </span>

          <span>
            Crafted for those who move beyond fashion.
          </span>
        </div>
      </div>
    </footer>
  );
}