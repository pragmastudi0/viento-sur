'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/lib/product-types';

export default function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  const hasThumbs = images.length > 1;

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-sage-tint">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />
      </div>

      {hasThumbs && (
        <ul className="mt-4 flex gap-3">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === active}
                className={`relative aspect-square w-20 overflow-hidden rounded-sm bg-sage-tint transition-opacity ${
                  i === active
                    ? 'ring-2 ring-ink ring-offset-2 ring-offset-cream'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
