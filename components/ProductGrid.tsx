import type { Product } from '@/lib/product-types';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: Product[];
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductCard product={product} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
