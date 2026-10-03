// Numbered pagination for the shop grid: Previous · 1 2 3 … 9 · Next.

import Link from 'next/link';
import { type ShopState, toQuery } from './shopParams';

function pageList(page: number, numPages: number): (number | 'gap')[] {
  const pages = new Set([1, numPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= numPages).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export default function ShopPagination({
  state,
  numPages,
  basePath,
}: {
  state: ShopState;
  numPages: number;
  basePath: string;
}) {
  if (numPages <= 1) return null;
  const href = (page: number) => `${basePath}${toQuery({ ...state, page })}`;
  const { page } = state;

  return (
    <nav className="fx-pagination" aria-label="Pagination">
      {page > 1 ? <Link href={href(page - 1)}>Previous</Link> : <span className="fx-disabled">Previous</span>}
      {pageList(page, numPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="fx-gap">…</span>
        ) : p === page ? (
          <span key={p} className="fx-current" aria-current="page">{p}</span>
        ) : (
          <Link key={p} href={href(p)}>{p}</Link>
        )
      )}
      {page < numPages ? <Link href={href(page + 1)}>Next</Link> : <span className="fx-disabled">Next</span>}
    </nav>
  );
}
