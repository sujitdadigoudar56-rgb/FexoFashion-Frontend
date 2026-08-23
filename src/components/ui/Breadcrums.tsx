import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontSize: 12, letterSpacing: '.04em', marginBottom: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Link href="/" className="fx-muted">Home</Link>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', gap: 8 }}>
          <span className="fx-muted">/</span>
          {item.href ? (
            <Link href={item.href} className="fx-muted">{item.label}</Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}