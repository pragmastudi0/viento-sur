'use client';

import { useState } from 'react';
import type { Product } from '@/lib/product-types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/currency';
import { waLink, productInquiryMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';

export default function ProductDetails({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);

  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0].src,
      variantId: variant.id,
      variantLabel: variant.label,
      quantity,
    });
    showToast('Producto agregado', {
      actionLabel: 'Ver carrito',
      onAction: openCart,
    });
  }

  return (
    <div>
      <p className="label">{product.categoryLabel}</p>
      <h1 className="mt-2 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
        {product.name}
      </h1>
      <p className="mt-3 text-xl text-ink/80">{formatPrice(product.price)}</p>

      <p className="mt-6 text-base leading-relaxed text-ink/70">
        {product.description}
      </p>

      <ul className="mt-6 space-y-2">
        {product.specifications.map((spec) => (
          <li
            key={spec}
            className="flex items-baseline gap-2.5 text-sm text-ink/70"
          >
            <span
              aria-hidden="true"
              className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sage-deep"
            />
            {spec}
          </li>
        ))}
      </ul>

      {/* Selector de estructura */}
      <div className="mt-8">
        <p className="field-label">
          Color de estructura:{' '}
          <span className="font-normal text-ink/60">{variant.label}</span>
        </p>
        <div className="flex flex-wrap gap-2.5">
          {product.variants.map((v) => {
            const selected = v.id === variantId;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantId(v.id)}
                aria-pressed={selected}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm transition-colors ${
                  selected
                    ? 'border-ink bg-ink text-cream'
                    : 'border-ink/20 text-ink/75 hover:border-ink/50'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-5 w-5 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: v.swatch }}
                />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cantidad + agregar */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-ink/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Disminuir cantidad"
            className="grid h-11 w-11 place-items-center rounded-full text-lg text-ink transition-colors hover:bg-ink/5 disabled:opacity-40"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="w-8 text-center text-sm tabular-nums"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Aumentar cantidad"
            className="grid h-11 w-11 place-items-center rounded-full text-lg text-ink transition-colors hover:bg-ink/5"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="btn-primary btn-lg flex-1 min-w-[180px]"
        >
          Agregar al carrito
        </button>
      </div>

      <a
        href={waLink(productInquiryMessage(product.name))}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 px-5 py-3 text-sm text-ink/80 transition-colors hover:border-ink hover:text-ink"
      >
        <WhatsAppIcon />
        Consultar por este modelo
      </a>
    </div>
  );
}
