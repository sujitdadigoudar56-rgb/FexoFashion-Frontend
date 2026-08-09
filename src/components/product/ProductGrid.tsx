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
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
