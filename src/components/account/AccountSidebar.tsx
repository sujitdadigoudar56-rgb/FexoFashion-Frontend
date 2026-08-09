'use client';

// Ports templates/accounts/includes/sidebar.html.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const items = [
  { href: '/accounts/dashboard', label: 'Dashboard', key: 'dashboard' },
  { href: '/accounts/profile', label: 'Profile', key: 'profile' },
  { href: '/accounts/orders', label: 'Orders', key: 'orders' },
  { href: '/accounts/addresses', label: 'Addresses', key: 'addresses' },
];

export default function AccountSidebar({ active }: { active: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <nav>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className={active === item.key ? 'fx-active' : 'fx-muted'}>
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/wishlist" className="fx-muted">
            Wishlist
          </Link>
        </li>
        <li>
          <button
            type="button"
            className="fx-muted"
            style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', padding: 0 }}
            onClick={() => {
              logout();
              router.push('/');
            }}
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
