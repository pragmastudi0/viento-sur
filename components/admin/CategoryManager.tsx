"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminCategory } from '@/lib/category-types';
import { clientError } from '@/lib/client-error';
export default function CategoryManager({ categories, success }: { categories: AdminCategory[]; success?: string }) {
  const router = useRouter(); const [busy, setBusy] = useState<string | null>(null); const [error, setError] = useState('');
  const [message, setMessage] = useState(success === 'creada' ? '✓ Categoría creada correctamente' : success === 'editada' ? '✓ Categoría editada correctamente' : '');
  async function action(c: AdminCategory, remove = false) {
    setError(''); setMessage('');
    if (remove && c.productCount) { setError(`Esta categoría tiene ${c.productCount} ${c.productCount === 1 ? 'producto asociado' : 'productos asociados'} y no puede eliminarse. Podés desactivarla.`); return; }
    if (remove && !window.confirm(`¿Eliminar la categoría ${c.name}? Esta acción no se puede deshacer.`)) return;
    if (!remove && c.isActive && c.publishedCount && !window.confirm(`¿Desactivar ${c.name}? Se ocultarán ${c.publishedCount} lámparas publicadas hasta reactivar la categoría.`)) return;
    setBusy(c.id);
    try {
      const response = await fetch(`/api/admin/categories/${c.id}`, { method: remove ? 'DELETE' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updatedAt: c.updatedAt, ...(!remove && { isActive: !c.isActive }) }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setMessage(remove ? '✓ Categoría eliminada correctamente' : `✓ Categoría ${c.isActive ? 'desactivada' : 'activada'} correctamente`); router.refresh();
    } catch (e) { setError(clientError(e)); } finally { setBusy(null); }
  }
  const actions = (c: AdminCategory) => <div className="flex flex-wrap gap-4 text-sm"><Link className="underline underline-offset-4" href={`/admin/categorias/${c.id}/editar`}>Editar</Link><button disabled={busy !== null} className="underline underline-offset-4" onClick={() => action(c)}>{busy === c.id ? 'Procesando…' : c.isActive ? 'Desactivar' : 'Activar'}</button><button disabled={busy !== null} className="text-red-800 underline underline-offset-4" onClick={() => action(c, true)}>Eliminar</button></div>;
  return <>
    <div className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-3xl sm:text-4xl">Categorías</h1><p className="mt-3 text-ink/65">Organizá las lámparas y su navegación pública.</p></div><Link href="/admin/categorias/nueva" className="btn-primary btn-lg">Crear categoría</Link></div>
    <p className="my-6 text-sm text-ink/60">Las categorías con lámparas asociadas no se pueden eliminar. Podés desactivarlas.</p>
    {message && <p role="status" className="mb-6 rounded-lg bg-sage-tint p-4 text-sm">{message}</p>}
    {error && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-900">{error} <button onClick={() => router.refresh()} className="underline">Recargar</button></p>}
    {!categories.length ? <p className="py-12 text-xl">Todavía no hay categorías creadas.</p> : <>
      <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead><tr>{['Nombre', 'Slug', 'Productos', 'Estado', 'Orden', 'Actualización', 'Acciones'].map(h => <th key={h} className="border-b border-ink/15 px-3 pb-4">{h}</th>)}</tr></thead><tbody>{categories.map(c => <tr key={c.id} className="border-b border-ink/10"><td className="px-3 py-5 font-medium">{c.name}</td><td className="max-w-[180px] break-words px-3 py-5">{c.slug}</td><td className="px-3 py-5">{c.productCount}</td><td className="px-3 py-5">{c.isActive ? 'Activa' : 'Inactiva'}</td><td className="px-3 py-5">{c.sortOrder}</td><td className="px-3 py-5">{new Date(c.updatedAt).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}</td><td className="px-3 py-5">{actions(c)}</td></tr>)}</tbody></table></div>
      <div className="grid gap-4 md:hidden">{categories.map(c => <article key={c.id} className="rounded-lg border border-ink/15 p-4"><h2 className="break-words text-xl">{c.name}</h2><p className="mt-2 break-words text-sm text-ink/60">{c.slug}</p><p className="mt-2 text-sm">{c.productCount} {c.productCount === 1 ? 'producto' : 'productos'} · {c.isActive ? 'Activa' : 'Inactiva'} · Orden {c.sortOrder}</p><p className="mt-2 text-xs text-ink/55">Actualizada {new Date(c.updatedAt).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}</p><div className="mt-4">{actions(c)}</div></article>)}</div>
    </>}
  </>;
}
