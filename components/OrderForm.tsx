'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/currency';
import { orderMessage, waLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons';
import { reconcileCart } from '@/lib/cart-reconciliation';

interface FormState {
  name: string;
  address: string;
  province: string;
  phone: string;
  comments: string;
}

const EMPTY: FormState = {
  name: '',
  address: '',
  province: '',
  phone: '',
  comments: '',
};

export default function OrderForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, subtotal, replaceItems } = useCart();
  const [checking, setChecking] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<{ name?: boolean }>({});
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    // Enfocar el primer campo al abrir.
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const update = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = {
      name: !form.name.trim(),
    };
    setErrors(nextErrors);
    if (nextErrors.name) return;

    setChecking(true); setCatalogError('');
    // Open synchronously to preserve the browser's user gesture on mobile.
    const whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;
    try {
      const response = await fetch('/api/catalogo/carrito', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: items.map(i => i.productId) }) });
      if (!response.ok) throw new Error();
      const { products } = await response.json();
      const reconciled = reconcileCart(items, products);
      if (reconciled.changed) {
        replaceItems(reconciled.items);
        setCatalogError('Actualizamos el carrito: cambiaron datos o hay lámparas que ya no están disponibles. Revisá el pedido antes de enviarlo.');
        whatsappWindow?.close();
        return;
      }
      if (!items.length) { setCatalogError('Agregá una lámpara para enviar el pedido.'); whatsappWindow?.close(); return; }

    const message = orderMessage(
      items.map((i) => ({
        name: i.name,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        price: i.price,
      })),
      {
        name: form.name.trim(),
        address: form.address,
        province: form.province,
        phone: form.phone,
        comments: form.comments,
      },
    );

    // Abrir WhatsApp. El carrito NO se vacía automáticamente.
    if (whatsappWindow) whatsappWindow.location.href = waLink(message);
    else window.location.assign(waLink(message));
    onClose();
    } catch {
      whatsappWindow?.close();
      setCatalogError('No pudimos verificar el catálogo. Revisá tu conexión e intentá nuevamente.');
    } finally { setChecking(false); }
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink-deep/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-form-title"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-cream shadow-2xl animate-fade-up sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h2 id="order-form-title" className="font-display text-xl font-normal text-ink">
            Completá tu pedido
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full text-ink/50 transition-colors hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form id="order-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="of-name" className="field-label">
                Nombre <span className="text-ink/40">*</span>
              </label>
              <input
                id="of-name"
                ref={firstFieldRef}
                type="text"
                value={form.name}
                onChange={update('name')}
                autoComplete="name"
                aria-required="true"
                aria-invalid={errors.name || undefined}
                className="field"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-ink/70">Ingresá tu nombre.</p>
              )}
            </div>

            <div>
              <label htmlFor="of-address" className="field-label">
                Dirección <span className="text-ink/40">(opcional)</span>
              </label>
              <input
                id="of-address"
                type="text"
                value={form.address}
                onChange={update('address')}
                autoComplete="street-address"
                className="field"
              />
            </div>

            <div>
              <label htmlFor="of-province" className="field-label">
                Provincia <span className="text-ink/40">(opcional)</span>
              </label>
              <input
                id="of-province"
                type="text"
                value={form.province}
                onChange={update('province')}
                autoComplete="address-level1"
                className="field"
              />
            </div>

            <div>
              <label htmlFor="of-phone" className="field-label">
                Teléfono <span className="text-ink/40">(opcional)</span>
              </label>
              <input
                id="of-phone"
                type="tel"
                value={form.phone}
                onChange={update('phone')}
                autoComplete="tel"
                inputMode="tel"
                className="field"
              />
            </div>

            <div>
              <label htmlFor="of-comments" className="field-label">
                Comentarios <span className="text-ink/40">(opcional)</span>
              </label>
              <textarea
                id="of-comments"
                value={form.comments}
                onChange={update('comments')}
                rows={3}
                className="field resize-none"
              />
            </div>
          </form>

          <div className="mt-6 rounded-xl bg-sage-tint p-4">
            <p className="label text-ink/55">Resumen del pedido</p>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((i) => (
                <li key={`${i.productId}-${i.variantId}`} className="flex justify-between gap-3">
                  <span className="text-ink/75">
                    {i.quantity} × {i.name}{' '}
                    <span className="text-ink/45">({i.variantLabel})</span>
                  </span>
                  <span className="shrink-0 text-ink/75">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-ink/10 pt-3">
              <span className="font-medium text-ink">Total</span>
              <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-ink/10 px-6 py-4">
          {catalogError && <p role="alert" className="mb-3 text-sm text-ink">{catalogError}</p>}
          <button disabled={checking} type="submit" form="order-form" className="btn-whatsapp btn-lg w-full">
            <WhatsAppIcon />
            {checking ? 'Verificando catálogo…' : 'Enviar pedido por WhatsApp'}
          </button>
          <p className="mt-2.5 text-center text-xs text-ink/50">
            Te llevamos a WhatsApp con el pedido listo para enviar.
          </p>
        </div>
      </div>
    </div>
  );
}
