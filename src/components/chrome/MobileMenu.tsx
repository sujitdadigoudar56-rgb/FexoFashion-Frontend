'use client';

// Ports #fx-mobile-menu from base.html.

import Link from 'next/link';

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div id="fx-mobile-menu" className={`fx-mobile-menu${open ? ' fx-open' : ''}`}>
      <Link href="/shop" onClick={onClose}>Shop</Link>
      <Link href="/about" onClick={onClose}>About</Link>
      <Link href="/journal" onClick={onClose}>Journal</Link>
      <Link href="/contact" onClick={onClose}>Contact</Link>
    </div>
  );
}
