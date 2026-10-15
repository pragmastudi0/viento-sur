'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/currency';
import { orderMessage, waLink } from '@/lib/whatsapp';
import { reconcileCart } from '@/lib/cart-reconciliation';
import CartItem from './CartItem';
import { WhatsAppIcon } from './icons';

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, mounted, replaceItems } = useCart();
  const [sending, setSending] = useState(false);
  const [orderError, setOrderError] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  // Enviar el pedido directo a WhatsApp, sin formulario de datos.
  // Igual se verifica el catálogo antes para no mandar precios/stock desactualizados.
  const handleOrder = async () => {
    if (!items.length || sending) return;
    setSending(true);
    setOrderError('');
    // Abrir la pestaña de forma síncrona para conservar el gesto del usuario en móvil.
    const whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    try {
      const response = await fetch('/api/catalogo/carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: items.map((i) => i.productId) }),
      });
      if (!response.ok) throw new Error();
      const { products } = await response.json();
      const reconciled = reconcileCart(items, products);
      if (reconciled.changed) {
        replaceItems(reconciled.items);
        setOrderError('Actualizamos el carrito: cambiaron datos o hay lámparas que ya no están disponibles. Revisá el pedido antes de enviarlo.');
        whatsappWindow?.close();
        return;
      }
      if (!items.length) {
        setOrderError('Agregá una lámpara para enviar el pedido.');
        whatsappWindow?.close();
        return;
      }
      const message = orderMessage(
        items.map((i) => ({ name: i.name, variantLabel: i.variantLabel, quantity: i.quantity, price: i.price })),
      );
      if (whatsappWindow) whatsappWindow.location.href = waLink(message);
      else window.location.assign(waLink(message));
      closeCart();
    } catch {
      whatsappWindow?.close();
      setOrderError('No pudimos verificar el catálogo. Revisá tu conexión e intentá nuevamente.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [isOpen, closeCart]);

  // No renderizar nada en el servidor para evitar desajustes de hidratación.
  const hasItems = mounted && items.length > 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-[55] ${isOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div
          onClick={closeCart}
          className={`absolute inset-0 bg-ink-deep/40 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras"
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ease-soft ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
            <h2 className="font-display text-xl font-normal text-ink">
              Tu carrito{mounted && count > 0 ? ` (${count})` : ''}
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={closeCart}
              aria-label="Cerrar carrito"
              className="grid h-9 w-9 place-items-center rounded-full text-ink/50 transition-colors hover:text-ink"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {hasItems ? (
            <>
              <div className="flex-1 overflow-y-auto px-6">
                <ul className="divide-y divide-ink/10">
                  {items.map((item) => (
                    <CartItem key={`${item.productId}-${item.variantId}`} item={item} />
                  ))}
                </ul>
              </div>

              <div className="border-t border-ink/10 px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-ink/70">Subtotal</span>
                  <span className="font-display text-xl font-normal text-ink">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-ink/50">
                  Coordinamos envío y formas de pago por WhatsApp.
                </p>
                {orderError && (
                  <p role="alert" className="mt-3 text-sm text-ink">{orderError}</p>
                )}
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={sending}
                  className="btn-whatsapp btn-lg mt-4 w-full"
                >
                  <WhatsAppIcon />
                  {sending ? 'Verificando catálogo…' : 'Enviar pedido por WhatsApp'}
                </button>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-3 w-full text-center text-sm text-ink/55 transition-colors hover:text-ink"
                >
                  Seguir viendo productos
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-sage-tint text-ink/50">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 8h12l-1 11.2A2 2 0 0 1 15 21H9a2 2 0 0 1-2-1.8L6 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <p className="mt-5 font-display text-lg text-ink">Tu carrito está vacío</p>
              <p className="mt-1.5 text-sm text-ink/55">
                Descubrí nuestra colección de lámparas y veladores.
              </p>
              <Link href="/catalogo" onClick={closeCart} className="btn-primary btn-md mt-6">
                Ver colección
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
