'use client';
import { clientError } from '@/lib/client-error';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/product-types';
import { formatPrice } from '@/lib/currency';
import ConfirmDelete from './ConfirmDelete';

export default function CatalogManager({ products, success }: { products: Product[]; success?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(success === 'agregada' ? '✓ Lámpara agregada correctamente' : success === 'editada' ? '✓ Lámpara editada correctamente' : '');
  const [deleting, setDeleting] = useState<Product | null>(null);
  async function action(product: Product, remove = false) {
    setBusy(product.id); setError(''); setMessage('');
    try {
      const status = product.status === 'publicada' ? 'oculta' : 'publicada';
      const response = await fetch(`/api/admin/products/${product.id}`, { method: remove ? 'DELETE' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updatedAt: product.updatedAt, ...(!remove && { status }) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDeleting(null);
      setMessage(remove ? '✓ Lámpara eliminada correctamente' : `✓ Lámpara ${status} correctamente`);
      router.refresh();
    } catch (e) { setError(clientError(e)); }
    finally { setBusy(null); }
  }
  const published = products.filter(p => p.status === 'publicada').length;
  const actions = (p: Product) => <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
    <Link className="underline underline-offset-4" href={`/admin/${p.id}/editar`}>Editar</Link>
    <button disabled={busy !== null} onClick={() => action(p)} className="underline underline-offset-4 disabled:opacity-40">{busy === p.id ? 'Procesando…' : p.status === 'publicada' ? 'Ocultar' : 'Publicar'}</button>
    <button disabled={busy !== null} onClick={() => setDeleting(p)} className="text-red-800 underline underline-offset-4">Eliminar</button>
  </div>;
  return <>
    <div className="flex flex-wrap items-end justify-between gap-6"><div><h1 className="text-3xl sm:text-4xl">Tus lámparas</h1><p className="mt-3 text-ink/65">Cada cambio se refleja en el catálogo público al volver a cargarlo.</p></div><Link className="btn-primary btn-lg" href="/admin/nueva">+ Agregar lámpara</Link></div>
    <dl className="my-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-ink/10 py-5">{[['Total', products.length], ['Publicadas', published], ['Ocultas', products.length - published]].map(([label, count]) => <div key={label}><dt className="text-sm text-ink/60">{label}</dt><dd className="mt-1 text-2xl tabular-nums">{count}</dd></div>)}</dl>
    {message && <p role="status" className="mb-6 rounded-lg bg-sage-tint p-4 text-sm">{message}</p>}
    {error && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-900">{error} <button className="underline" onClick={() => router.refresh()}>Recargar</button></p>}
    {!products.length ? <div className="py-12"><h2 className="text-2xl">Todavía no hay lámparas</h2><p className="mt-3 text-ink/65">Agregá la primera para empezar tu catálogo.</p></div> : <>
      <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead><tr className="border-b border-ink/15 text-ink/60">{['Lámpara', 'Precio', 'Estado', 'Actualización', 'Acciones'].map(s => <th key={s} className="px-3 pb-4 font-medium">{s}</th>)}</tr></thead><tbody>{products.map(p => <tr key={p.id} className="border-b border-ink/10"><td className="px-3 py-4"><div className="flex items-center gap-4"><Image src={p.images[0].src} alt={p.name} width={56} height={70} className="h-[70px] w-14 rounded object-cover" /><div><span className="font-medium">{p.name}</span><p className="mt-1 text-xs text-ink/55">{p.categoryLabel}</p></div></div></td><td className="px-3 py-4 whitespace-nowrap">{formatPrice(p.price)}</td><td className="px-3 py-4"><span className={`rounded-full px-3 py-1 ${p.status === 'publicada' ? 'bg-sage-tint' : 'bg-beige'}`}>{p.status === 'publicada' ? 'Publicada' : 'Oculta'}</span></td><td className="px-3 py-4">{new Date(p.updatedAt).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}</td><td className="px-3 py-4">{actions(p)}</td></tr>)}</tbody></table></div>
      <div className="grid gap-4 md:hidden">{products.map(p => <article key={p.id} className="rounded-lg border border-ink/15 bg-white/40 p-4"><div className="flex gap-4"><Image src={p.images[0].src} alt={p.name} width={80} height={100} className="h-[100px] w-20 rounded object-cover" /><div><h2 className="text-xl">{p.name}</h2><p className="mt-1">{formatPrice(p.price)}</p><p className="mt-2 text-sm text-ink/65">{p.status === 'publicada' ? 'Publicada' : 'Oculta'}</p><p className="mt-1 text-xs text-ink/55">Actualizada {new Date(p.updatedAt).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}</p></div></div><div className="mt-4 border-t border-ink/10 pt-4">{actions(p)}</div></article>)}</div>
    </>}
    {deleting && <ConfirmDelete name={deleting.name} busy={busy !== null} cancel={() => setDeleting(null)} confirm={() => action(deleting, true)} />}
  </>;
}
