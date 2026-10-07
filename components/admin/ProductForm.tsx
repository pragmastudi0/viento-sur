'use client';
import { clientError } from '@/lib/client-error';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Product } from '@/lib/product-types';
import { parsePrice, productInputSchema, IMAGE_TYPES, MAX_ORIGINAL } from '@/lib/catalog-validation';
import { preparePhoto } from '@/lib/browser-image';

import type { Category } from '@/lib/category-types';

type Photo = { key: string; src: string; path?: string; alt: string; file?: File };
export default function ProductForm({ product, newId, categories }: { product?: Product; newId?: string; categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price).replace('.', ',') : '');
  const [category, setCategory] = useState(product?.categoryId ?? categories.find(c => c.isActive)?.id ?? '');
  const [status, setStatus] = useState<'publicada' | 'oculta'>(product?.status ?? 'publicada');
  const [specifications, setSpecifications] = useState(product?.specifications.join('\n') ?? '');
  const [photos, setPhotos] = useState<Photo[]>(product?.images.map(i => ({ ...i, key: i.path! })) ?? []);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const staged = useRef(new Set<string>());
  const urls = useRef(new Set<string>());
  const [initial] = useState(() => JSON.stringify({ name, description, price, category, status, specifications, keys: photos.map(p => p.key) }));
  const dirty = !saved && JSON.stringify({ name, description, price, category, status, specifications, keys: photos.map(p => p.key) }) !== initial;
  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); } };
    window.addEventListener('beforeunload', listener);
    return () => window.removeEventListener('beforeunload', listener);
  }, [dirty]);
  useEffect(() => {
    const activeUrls = urls.current;
    return () => { activeUrls.forEach(url => URL.revokeObjectURL(url)); };
  }, []);

  function select(file: File | undefined, replace?: number) {
    if (!file) return;
    setError('');
    if (!IMAGE_TYPES.includes(file.type)) { setError('Elegí JPG, PNG o WebP. Si tu foto es HEIC, exportala como JPG.'); return; }
    if (!file.size || file.size > MAX_ORIGINAL) { setError('Elegí una foto de hasta 15 MB.'); return; }
    if (replace === undefined && photos.length >= 10) { setError('Podés cargar hasta 10 fotos.'); return; }
    const src = URL.createObjectURL(file); urls.current.add(src);
    const photo = { key: crypto.randomUUID(), src, file, alt: name || 'Lámpara Viento Sur' };
    setPhotos(old => replace === undefined ? [...old, photo] : old.map((p, i) => i === replace ? photo : p));
  }
  async function cleanStaged() {
    if (!staged.current.size) return;
    try { await fetch('/api/admin/images', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paths: Array.from(staged.current) }) }); } catch { /* Maintenance reconciles interrupted uploads. */ }
  }
  async function cancel() {
    if (dirty && !window.confirm('¿Descartar los cambios sin guardar?')) return;
    setSaved(true); await cleanStaged(); router.push('/admin');
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    const numericPrice = parsePrice(price);
    if (!name.trim() || name.trim().length > 120) { setError('Ingresá un nombre de hasta 120 caracteres.'); return; }
    if (numericPrice === null) { setError('Ingresá un precio válido. Por ejemplo: 85.000 o 85.000,50.'); return; }
    if (!category) { setError('Creá una categoría activa antes de guardar.'); return; }
    if (!photos.length) { setError('Seleccioná una imagen principal.'); return; }
    const specs = specifications.split('\n').map(s => s.trim()).filter(Boolean);
    if (description.length > 5000 || specs.length > 30 || specs.some(s => s.length > 240)) { setError('Acortá la descripción o las especificaciones.'); return; }
    setBusy(true);
    try {
      const uploaded: Photo[] = [];
      for (let index = 0; index < photos.length; index++) {
        let photo = photos[index];
        if (!photo.path && photo.file) {
          setProgress(`Preparando foto ${index + 1} de ${photos.length}…`);
          const file = await preparePhoto(photo.file);
          const form = new FormData(); form.set('file', file);
          setProgress(`Subiendo foto ${index + 1} de ${photos.length}…`);
          const response = await fetch('/api/admin/images', { method: 'POST', body: form });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          staged.current.add(result.path);
          photo = { ...photo, path: result.path, src: result.src };
          setPhotos(old => old.map(p => p.key === photo.key ? photo : p));
        }
        uploaded.push(photo);
      }
      const input = productInputSchema.safeParse({ name, description, price: numericPrice, categoryId: category, status,
        images: uploaded.map(p => ({ path: p.path, alt: p.file ? name.trim() : p.alt })), specifications: specs });
      if (!input.success) throw new Error('Revisá los datos y las fotos antes de guardar.');
      setProgress('Guardando lámpara…');
      const response = await fetch(product ? `/api/admin/products/${product.id}` : '/api/admin/products', {
        method: product ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input.data, ...(product ? { updatedAt: product.updatedAt } : { id: newId }) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSaved(true);
      await cleanStaged(); // Referenced images are protected by the database.
      router.push(`/admin?success=${product ? 'editada' : 'agregada'}`); router.refresh();
    } catch (e) { setError(clientError(e)); }
    finally { setBusy(false); setProgress(''); }
  }
  return <form onSubmit={submit} noValidate className="mt-8 max-w-4xl">
    {!categories.some(c => c.isActive) && !product && <p role="alert" className="mb-6 rounded bg-sage-tint p-4">No hay categorías activas. <a href="/admin/categorias/nueva" className="underline">Crear categoría</a> antes de agregar una lámpara.</p>}
    {product && !product.category.isActive && <p className="mb-6 rounded bg-beige p-4 text-sm">Esta lámpara no es visible porque su categoría está inactiva. Podés conservarla al editar, reasignarla a una activa o reactivar la categoría.</p>}
    <fieldset disabled={!ready || busy} className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <div><label htmlFor="lamp-name" className="field-label">Nombre *</label><input id="lamp-name" className="field" required maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Lámpara Nórdica" /></div>
        <div><label htmlFor="lamp-description" className="field-label">Descripción</label><textarea id="lamp-description" className="field" rows={5} maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div><label htmlFor="lamp-price" className="field-label">Precio en pesos *</label><input id="lamp-price" className="field" inputMode="decimal" required value={price} onChange={e => setPrice(e.target.value)} placeholder="85.000" /><p className="mt-1 text-xs text-ink/55">Por ejemplo: $85.000. Podés usar coma para los centavos.</p></div>
        <div><label htmlFor="lamp-category" className="field-label">Categoría *</label><select id="lamp-category" className="field" value={category} onChange={e => setCategory(e.target.value as typeof category)}>{categories.filter(c => c.isActive || c.id === product?.categoryId).map(c => <option value={c.id} key={c.id} disabled={!c.isActive}>{c.name}{!c.isActive ? ' (inactiva)' : ''}</option>)}</select></div>
        <div><label htmlFor="lamp-status" className="field-label">Estado</label><select id="lamp-status" className="field" value={status} onChange={e => setStatus(e.target.value as typeof status)}><option value="publicada">Publicada</option><option value="oculta">Oculta</option></select><p className="mt-1 text-xs text-ink/55">Las ocultas se guardan y no aparecen en el catálogo.</p></div>
        <details><summary className="cursor-pointer text-sm font-medium">Especificaciones (opcional)</summary><label htmlFor="lamp-specs" className="field-label mt-4">Una característica por línea</label><textarea id="lamp-specs" className="field" rows={5} value={specifications} onChange={e => setSpecifications(e.target.value)} placeholder={'Base de hierro\nAltura 1,7 m'} /></details>
      </div>
      <div>
        <h2 className="text-xl">Fotos de la lámpara</h2><p className="mt-2 text-sm text-ink/65">La primera foto será la principal. Hasta 10 fotos JPG, PNG o WebP, de 15 MB cada una.</p>
        <div className="mt-4 space-y-4">{photos.map((photo, index) => <div key={photo.key} className="rounded-lg border border-ink/15 p-3">
          <Image src={photo.src} alt={`Preview de foto ${index + 1}`} unoptimized width={480} height={360} className="aspect-[4/3] w-full rounded object-cover" />
          <p className="mt-2 text-sm font-medium">{index === 0 ? 'Imagen principal' : `Foto ${index + 1}`}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <label className="cursor-pointer underline underline-offset-4">Reemplazar<input aria-label={`Reemplazar foto ${index + 1}`} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => { select(e.target.files?.[0], index); e.target.value = ''; }} /></label>
            {index > 0 && <button type="button" onClick={() => setPhotos(old => [old[index], ...old.filter((_, i) => i !== index)])} className="underline underline-offset-4">Usar como principal</button>}
            <button type="button" onClick={() => setPhotos(old => old.filter(p => p.key !== photo.key))} className="text-ink/65 underline underline-offset-4">Quitar</button>
          </div>
        </div>)}</div>
        {photos.length < 10 && <div className="mt-4"><label htmlFor="lamp-image" className="field-label">{photos.length ? 'Agregar otra foto' : 'Imagen principal *'}</label><input id="lamp-image" className="field file:mr-3 file:rounded file:border-0 file:bg-sage-tint file:px-3 file:py-2 file:text-ink" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { select(e.target.files?.[0]); e.target.value = ''; }} /></div>}
      </div>
    </fieldset>
    {error && <div role="alert" className="mt-6 rounded-lg border border-red-800/20 bg-red-50 p-4 text-sm text-red-900">{error}</div>}
    {busy && <p role="status" className="mt-6 text-sm">{progress}</p>}
    <div className="mt-8 flex flex-wrap gap-3 border-t border-ink/10 pt-6"><button disabled={!ready || busy || !category} type="submit" className="btn-primary btn-lg">{busy ? 'Guardando…' : 'Guardar lámpara'}</button><button disabled={!ready || busy} type="button" onClick={cancel} className="btn-outline btn-lg">Cancelar</button></div>
  </form>;
}
