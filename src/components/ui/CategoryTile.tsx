// Ports the `.fx-cat-tile` anchor from website/home.html's category grid.

import Link from 'next/link';
import type { Category } from '@/lib/types';

export default function CategoryTile({ category }: { category: Category }) {
  return (
    <Link href={`/shop/category/${category.slug}`} className="fx-cat-tile fx-reveal">
      <img
        src={category.image ?? `https://placehold.co/600x750/121212/8a8a8a?text=${encodeURIComponent(category.name)}`}
        alt={category.name}
      />
      <span className="fx-serif">{category.name}</span>
    </Link>
  );
}
