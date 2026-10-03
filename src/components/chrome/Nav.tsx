'use client';

import { Heart, LayoutDashboard, LogOut, MapPin, Package, Search, ShoppingBag, User, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';

const LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?sort=newest', label: 'New Arrivals' },
  { href: '/about', label: 'About' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
];

function AccountMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the (tap-opened) menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div className="fx-account-menu" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="fx-account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account"
        onClick={() => setOpen((v) => !v)}
      >
        <UserRound size={19} strokeWidth={1.6} aria-hidden />
        {isAuthenticated && <span className="fx-account-name">{user?.first_name || user?.username}</span>}
      </button>
      <div className={`fx-account-pop${open ? ' fx-open' : ''}`} role="menu">
        <div className="fx-account-pop-inner">
          {isAuthenticated ? (
            <>
              <div className="fx-account-pop-head">
                <strong>Hello, {user?.first_name || user?.username}</strong>
                <span>{user?.email}</span>
              </div>
              <Link href="/accounts/dashboard" role="menuitem"><LayoutDashboard size={16} aria-hidden /> Dashboard</Link>
              <Link href="/accounts/orders" role="menuitem"><Package size={16} aria-hidden /> My Orders</Link>
              <Link href="/wishlist" role="menuitem"><Heart size={16} aria-hidden /> Wishlist</Link>
              <Link href="/accounts/profile" role="menuitem"><User size={16} aria-hidden /> Profile</Link>
              <Link href="/accounts/addresses" role="menuitem"><MapPin size={16} aria-hidden /> Addresses</Link>
              <button
                type="button"
                role="menuitem"
                className="fx-menu-item"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
              >
                <LogOut size={16} aria-hidden /> Logout
              </button>
            </>
          ) : (
            <>
              <div className="fx-account-pop-head">
                <strong>Welcome to FEXO</strong>
                <span>Sign in to track orders and save favourites.</span>
              </div>
              <div className="fx-menu-cta">
                <Link href="/accounts/login" className="solid" role="menuitem">Login</Link>
                <Link href="/accounts/register" role="menuitem">Register</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav id="fx-nav" className={scrolled || !isHome ? 'fx-scrolled' : ''}>
        <Link href="/" className="fx-logo" aria-label="FEXO home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fexo-logo.jpg" alt="" className="fx-logo-mark" width={38} height={38} />
          <span className="fx-logo-word">FEXO</span>
        </Link>
        <ul className="fx-nav-links">
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className={pathname === l.href.split('?')[0] && !l.href.includes('?') ? 'fx-active-link' : ''}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="fx-nav-icons">
          <button aria-label="Search" title="Search" onClick={() => setSearchOpen(true)}>
            <Search size={19} strokeWidth={1.6} aria-hidden />
          </button>
          <AccountMenu />
          <Link href="/wishlist" aria-label="Wishlist" title="Wishlist">
            <Heart size={19} strokeWidth={1.6} aria-hidden />
            {wishlistItems.length > 0 && <span className="fx-badge">{wishlistItems.length}</span>}
          </Link>
          <Link href="/cart" aria-label={`Bag, ${itemCount} item${itemCount === 1 ? '' : 's'}`} title="Bag">
            <ShoppingBag size={19} strokeWidth={1.6} aria-hidden />
            {itemCount > 0 && <span className="fx-badge">{itemCount}</span>}
          </Link>
          <button className="fx-mobile-toggle" aria-label="Menu" title="Menu" onClick={() => setMobileOpen((v) => !v)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </nav>
      {/* Pushes content below the fixed header everywhere except the
          full-bleed homepage hero. */}
      {!isHome && <div className="fx-nav-spacer" aria-hidden />}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
