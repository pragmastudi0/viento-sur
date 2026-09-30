import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';
import { formatPrice } from '@/lib/currency';

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const cover = product.images[0];

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block focus:outline-none"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-sage-tint">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4">
        <p className="label">{product.categoryLabel}</p>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-normal text-ink">
            {product.name}
          </h3>
          <span className="shrink-0 text-sm text-ink/70">
            {formatPrice(product.price)}
          </span>
        </div>
        <span className="mt-2.5 inline-block text-sm text-ink/60 underline-offset-4 transition-colors group-hover:text-ink group-hover:underline group-focus-visible:text-ink group-focus-visible:underline">
          Ver producto
        </span>
      </div>
    </Link>
  );
}
