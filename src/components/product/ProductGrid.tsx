import { cardColors } from '@/lib/product';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products,
  emptyMessage = 'No products to show.',
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  if (!products.length) {
    return <p className="fx-muted">{emptyMessage}</p>;
  }
  return (
    <div className="fx-grid">
      {products.flatMap((product) =>
        cardColors(product).map((c) => <ProductCard key={`${product.id}-${c ?? ''}`} product={product} color={c} />)
      )}
    </div>
  );
}
