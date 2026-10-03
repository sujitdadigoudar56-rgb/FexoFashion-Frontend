'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div id="fx-mobile-menu" className={`fx-mobile-menu${open ? ' fx-open' : ''}`}>
      <button type="button" className="fx-mobile-menu-close" aria-label="Close menu" onClick={onClose}>
        &times;
      </button>
      <Link href="/shop" onClick={onClose}>Shop</Link>
      <Link href="/shop?sort=newest" onClick={onClose}>New Arrivals</Link>
      <Link href="/about" onClick={onClose}>About</Link>
      <Link href="/journal" onClick={onClose}>Journal</Link>
      <Link href="/contact" onClick={onClose}>Contact</Link>
      <hr className="fx-divider" style={{ margin: '4px 0' }} />
      {isAuthenticated ? (
        <>
          <Link href="/accounts/dashboard" onClick={onClose}>My Account</Link>
          <Link href="/accounts/orders" onClick={onClose}>My Orders</Link>
          <Link href="/wishlist" onClick={onClose}>Wishlist</Link>
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: 15, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fx-accent)' }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/accounts/login" onClick={onClose}>Login</Link>
          <Link href="/accounts/register" onClick={onClose}>Register</Link>
        </>
      )}
    </div>
  );
}
