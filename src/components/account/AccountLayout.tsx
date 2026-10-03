'use client';

// Signed-in account area: breadcrumb + sidebar (avatar, welcome, links)
// beside the page content. Redirects to sign-in when signed out.

import { Heart, LayoutDashboard, LifeBuoy, LogOut, MapPin, Package, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { initials } from '@/lib/format';
import RequireAuth from './RequireAuth';

export type AccountSection = 'dashboard' | 'orders' | 'wishlist' | 'profile' | 'addresses';

const ITEMS: { key: AccountSection; href: string; label: string; icon: typeof User }[] = [
  { key: 'dashboard', href: '/accounts/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', href: '/accounts/orders', label: 'My Orders', icon: Package },
  { key: 'wishlist', href: '/wishlist', label: 'Wishlist', icon: Heart },
  { key: 'profile', href: '/accounts/profile', label: 'Profile', icon: User },
  { key: 'addresses', href: '/accounts/addresses', label: 'Addresses', icon: MapPin },
];

export function Avatar({ className = 'fx-avatar' }: { className?: string }) {
  const { user } = useAuth();
  return (
    <span className={className}>
      {user?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar} alt="" />
      ) : (
        initials(user?.first_name, user?.last_name, user?.username)
      )}
    </span>
  );
}

function Sidebar({ active }: { active: AccountSection }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <aside className="fx-account-side">
      <div className="fx-account-user">
        <Avatar />
        <div>
          <small>Welcome back</small>
          <strong>{user?.first_name || user?.username}</strong>
        </div>
      </div>
      <nav className="fx-account-nav" aria-label="Account">
        {ITEMS.map(({ key, href, label, icon: Icon }) => (
          <Link key={key} href={href} className={active === key ? 'fx-on' : undefined} aria-current={active === key ? 'page' : undefined}>
            <Icon size={16} aria-hidden /> {label}
          </Link>
        ))}
        <Link href="/contact">
          <LifeBuoy size={16} aria-hidden /> Support
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/');
          }}
        >
          <LogOut size={16} aria-hidden /> Logout
        </button>
      </nav>
    </aside>
  );
}

export default function AccountLayout({
  active,
  crumbs,
  children,
}: {
  active: AccountSection;
  /** Breadcrumb after "Home / My account". */
  crumbs?: { label: string; href?: string }[];
  children: React.ReactNode;
}) {
  const trail = [{ label: 'Home', href: '/' }, { label: 'My account', href: '/accounts/dashboard' }, ...(crumbs ?? [])];
  return (
    <RequireAuth>
      <div className="fx-container">
        <nav className="fx-breadcrumbs" aria-label="Breadcrumb" style={{ paddingTop: 22 }}>
          {trail.map((c, i) => (
            <span key={c.label} style={{ display: 'inline-flex', gap: 8 }}>
              {i > 0 && <span>/</span>}
              {c.href && i < trail.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <div className="fx-account">
          <Sidebar active={active} />
          <div style={{ minWidth: 0 }}>{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
