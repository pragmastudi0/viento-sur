import Link from 'next/link';
import { categoryHref, type Category } from '@/lib/category-types';
import type { Product } from '@/lib/product-types';
import ProductGrid from './ProductGrid';

export default function CollectionView({
  eyebrow,
  title,
  subtitle,
  products,
  categories = [],
  categoryId,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  categories?: Category[];
  categoryId?: string;
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

      <nav aria-label="Filtrar por categoría" className="mt-8 flex flex-wrap gap-2">
        <Link href="/catalogo" aria-current={!categoryId ? 'page' : undefined} className={`rounded-full border px-4 py-2 text-sm ${!categoryId ? 'bg-ink text-cream' : 'border-ink/20 text-ink'}`}>Todas</Link>
        {categories.map(category => <Link key={category.id} href={categoryHref(category)} aria-current={categoryId === category.id ? 'page' : undefined} className={`max-w-full break-words rounded-full border px-4 py-2 text-sm ${categoryId === category.id ? 'bg-ink text-cream' : 'border-ink/20 text-ink'}`}>{category.name}</Link>)}
      </nav>
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
