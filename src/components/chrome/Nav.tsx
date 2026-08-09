'use client';

// Ports #fx-nav from base.html + the nav scroll show/hide, mobile toggle
// and search-trigger wiring from fexo.js.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();

  useEffect(() => {
    // Close any open overlay on navigation — reacting to an external
    // signal (route change), not deriving state from a prop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden(y > lastY.current && y > 200);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav id="fx-nav" className={[scrolled && 'fx-scrolled', hidden && 'fx-hide'].filter(Boolean).join(' ')}>
        <Link href="/" className="fx-logo">FEXO</Link>
        <ul className="fx-nav-links">
          <li><Link href="/shop">Shop</Link></li>
          <li><Link href="/shop?category=all">Collections</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/journal">Journal</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
        <div className="fx-nav-icons">
          <button id="fx-search-trigger" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
          <Link href={isAuthenticated ? '/accounts/dashboard' : '/accounts/login'} aria-label="Account">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
            </svg>
          </Link>
          <Link href="/wishlist" aria-label="Wishlist">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4c2-.3 3.8.6 5 2.2C11.8 4.6 13.6 3.7 15.6 4c3.6.5 5.2 4 3.6 7.7C16.7 16.4 12 21 12 21z" />
            </svg>
            {wishlistItems.length > 0 && <span className="fx-badge">{wishlistItems.length}</span>}
          </Link>
          <Link href="/cart" aria-label="Bag">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            {itemCount > 0 && <span className="fx-badge">{itemCount}</span>}
          </Link>
          <button className="fx-mobile-toggle" aria-label="Menu" onClick={() => setMobileOpen((v) => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </nav>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
