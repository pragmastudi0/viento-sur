import type { Product } from '@/data/products';
import ProductGrid from './ProductGrid';

export default function CollectionView({
  eyebrow,
  title,
  subtitle,
  products,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  products: Product[];
}) {
  return (
    <div className="container-page py-16 sm:py-20">
      <header className="max-w-2xl">
        {eyebrow && <p className="label">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-base leading-relaxed text-ink/65">{subtitle}</p>
        )}
      </header>

      <div className="mt-12">
        {products.length > 0 ? (
          <ProductGrid products={products} priorityCount={3} />
        ) : (
          <p className="text-ink/60">Pronto sumaremos nuevos modelos.</p>
        )}
      </div>
    </div>
  );
}
