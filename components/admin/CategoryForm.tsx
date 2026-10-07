"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/lib/category-types';
import { categoryInputSchema, categorySlugify } from '@/lib/category-validation';
import { clientError } from '@/lib/client-error';
export default function CategoryForm({ category, newId, nextOrder = 1 }: { category?: Category; newId?: string; nextOrder?: number }) {
  const router = useRouter(); const [name, setName] = useState(category?.name || ''); const [slug, setSlug] = useState(category?.slug || '');
  const [manualSlug, setManualSlug] = useState(!!category); const [description, setDescription] = useState(category?.description || '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true); const [order, setOrder] = useState(String(category?.sortOrder ?? nextOrder));
  const [busy, setBusy] = useState(false); const [ready, setReady] = useState(false); const [error, setError] = useState('');
  useEffect(() => setReady(true), []);
  const [initial] = useState(() => JSON.stringify({ name, slug, description, isActive, order }));
  const [saved, setSaved] = useState(false);
  const dirty = !saved && JSON.stringify({ name, slug, description, isActive, order }) !== initial;
  useEffect(() => { const listener = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener('beforeunload', listener); return () => window.removeEventListener('beforeunload', listener); }, [dirty]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (!/^\d+$/.test(order) || !slug.trim()) { setError('Ingresá un slug y un orden entero no negativo.'); return; }
    const input = categoryInputSchema.safeParse({ name, slug, description, isActive, sortOrder: Number(order) });
    if (!input.success) { setError(input.error.issues[0]?.message || 'Revisá los datos.'); return; }
    if (category && slug !== category.slug && !window.confirm('¿Cambiar el slug? Los enlaces anteriores se conservarán y redirigirán a la dirección vigente.')) return;
    if (category?.isActive && !isActive && !window.confirm('¿Desactivar esta categoría? Sus productos publicados dejarán de aparecer públicamente hasta reactivarla.')) return;
    setBusy(true);
    try {
      const response = await fetch(category ? `/api/admin/categories/${category.id}` : '/api/admin/categories', {
        method: category ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input.data, ...(!category && !manualSlug && { slug: undefined }), ...(category ? { updatedAt: category.updatedAt } : { id: newId }) }),
      });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setSaved(true); router.push(`/admin/categorias?success=${category ? 'editada' : 'creada'}`); router.refresh();
    } catch (e) { setError(clientError(e)); } finally { setBusy(false); }
  }
  function cancel() { if (dirty && !window.confirm('¿Descartar los cambios sin guardar?')) return; setSaved(true); router.push('/admin/categorias'); }
  return <form onSubmit={submit} noValidate className="mt-8 max-w-xl">
    <fieldset disabled={!ready || busy} className="space-y-5">
      <div><label htmlFor="category-name" className="field-label">Nombre *</label><input id="category-name" className="field" value={name} maxLength={120} required onChange={e => { setName(e.target.value); if (!manualSlug) setSlug(e.target.value.trim() ? categorySlugify(e.target.value) : ''); }} /></div>
      <div><label htmlFor="category-slug" className="field-label">Slug *</label><input id="category-slug" className="field" value={slug} maxLength={120} required onChange={e => { setManualSlug(true); setSlug(e.target.value); }} /><p className="mt-2 text-xs text-ink/60">Minúsculas, números y guiones. {category ? 'Cambiar el nombre no cambia la dirección.' : 'Si dejás el slug sugerido y ya existe, agregaremos un número para evitar duplicados.'}</p></div>
      <div><label htmlFor="category-description" className="field-label">Descripción</label><textarea id="category-description" className="field" rows={5} maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} /></div>
      <div><label htmlFor="category-order" className="field-label">Orden *</label><input id="category-order" className="field" type="number" min={0} max={2147483647} step={1} value={order} onChange={e => setOrder(e.target.value)} /><p className="mt-2 text-xs text-ink/60">Los números menores aparecen primero.</p></div>
      <div><label htmlFor="category-active" className="field-label">Estado</label><select id="category-active" className="field" value={isActive ? 'activa' : 'inactiva'} onChange={e => setIsActive(e.target.value === 'activa')}><option value="activa">Activa</option><option value="inactiva">Inactiva</option></select><p className="mt-2 text-sm text-ink/65">Una categoría inactiva oculta sus productos publicados sin modificar el estado individual de cada lámpara.</p></div>
    </fieldset>
    {error && <p role="alert" className="mt-6 rounded bg-red-50 p-4 text-sm text-red-900">{error}</p>}
    {busy && <p role="status" className="mt-4 text-sm">Guardando categoría…</p>}
    <div className="mt-8 flex flex-wrap gap-3"><button disabled={!ready || busy} className="btn-primary btn-lg">{busy ? 'Guardando…' : 'Guardar categoría'}</button><button type="button" disabled={!ready || busy} className="btn-outline btn-lg" onClick={cancel}>Cancelar</button></div>
  </form>;
}
