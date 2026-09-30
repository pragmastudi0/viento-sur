'use client';

import { useCart } from '@/context/CartContext';

export default function CartButton({ tone = 'ink' }: { tone?: 'ink' | 'cream' }) {
  const { count, openCart, mounted } = useCart();
  const showCount = mounted && count > 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={showCount ? `Abrir carrito, ${count} productos` : 'Abrir carrito'}
      className={`relative grid h-10 w-10 place-items-center rounded-full transition-colors ${
        tone === 'cream' ? 'text-cream hover:bg-white/10' : 'text-ink hover:bg-ink/5'
      }`}
    >
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 8h12l-1 11.2A2 2 0 0 1 15 21H9a2 2 0 0 1-2-1.8L6 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 8V6.5a3 3 0 0 1 6 0V8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {showCount && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-semibold leading-none text-cream ring-2 ring-cream">
          {count}
        </span>
      )}
    </button>
  );
}
