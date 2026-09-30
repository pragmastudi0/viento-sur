'use client';

import Image from 'next/image';
import { useCart, type CartItem as CartItemType } from '@/context/CartContext';
import { formatPrice } from '@/lib/currency';

export default function CartItem({ item }: { item: CartItemType }) {
  const { keyOf, increment, decrement, removeItem } = useCart();
  const key = keyOf(item);

  return (
    <li className="flex gap-4 py-5">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-sage-tint">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-normal text-ink">
              {item.name}
            </h3>
            <p className="mt-0.5 text-sm text-ink/55">
              Estructura: {item.variantLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(key)}
            aria-label={`Quitar ${item.name} del carrito`}
            className="-mr-1 shrink-0 rounded-full p-1 text-ink/40 transition-colors hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="inline-flex items-center rounded-full border border-ink/15">
            <button
              type="button"
              onClick={() => decrement(key)}
              aria-label="Disminuir cantidad"
              className="grid h-8 w-8 place-items-center rounded-full text-ink/70 transition-colors hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => increment(key)}
              aria-label="Aumentar cantidad"
              className="grid h-8 w-8 place-items-center rounded-full text-ink/70 transition-colors hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-ink">
              {formatPrice(item.price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-ink/45">{formatPrice(item.price)} c/u</p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
