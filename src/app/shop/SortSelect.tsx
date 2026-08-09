'use client';

// Ports the `onchange="this.form.submit()"` sort <select> from
// templates/products/shop.html.

import { useRouter } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name' },
];

export default function SortSelect({
  currentSort,
  baseParams,
}: {
  currentSort: string;
  baseParams: Record<string, string>;
}) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(baseParams);
    params.set('sort', e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <label className="fx-muted" style={{ fontSize: 12 }}>Sort</label>
      <select className="fx-select" style={{ width: 'auto', marginBottom: 0 }} value={currentSort} onChange={handleChange}>
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
