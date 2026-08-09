'use client';

// Ports #fx-search-overlay from base.html + the search wiring in fexo.js —
// calls the real GET /api/products/search-suggestions/?q= endpoint.

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { searchProducts, type SearchSuggestion } from '@/lib/data';

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      // Reset on close — reacting to the overlay's open/close signal, not
      // deriving state from a prop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setResults([]);
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => {
      searchProducts(query).then(setResults);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div id="fx-search-overlay" className={`fx-search-overlay${open ? ' fx-open' : ''}`}>
      <button id="fx-search-close" className="fx-search-close" onClick={onClose} aria-label="Close search">
        &times;
      </button>
      <div className="fx-search-inner">
        <input
          ref={inputRef}
          type="text"
          id="fx-search-input"
          placeholder="Search FEXO..."
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div id="fx-search-results">
          {results.map((p) => (
            <Link key={p.slug} href={`/shop/${p.slug}`} className="fx-search-result" onClick={onClose}>
              {p.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
