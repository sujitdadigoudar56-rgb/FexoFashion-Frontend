// Ports the pagination controls from templates/products/shop.html.

import Link from 'next/link';

export default function ShopPagination({
  page,
  numPages,
  baseParams,
}: {
  page: number;
  numPages: number;
  baseParams: Record<string, string>;
}) {
  const urlFor = (p: number) => {
    const params = new URLSearchParams(baseParams);
    params.set('page', String(p));
    return `/shop?${params.toString()}`;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 60 }}>
      {page > 1 && <Link href={urlFor(page - 1)} className="fx-btn">Previous</Link>}
      <span className="fx-muted" style={{ alignSelf: 'center' }}>Page {page} of {numPages}</span>
      {page < numPages && <Link href={urlFor(page + 1)} className="fx-btn">Next</Link>}
    </div>
  );
}
