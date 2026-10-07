import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createCategory, updateCategory, deleteCategory } from '@/lib/category-write';
import { createProduct, updateProduct, normalizeProductCategory } from '@/lib/catalog-write';
import { productInputSchema } from '@/lib/catalog-validation';
import { getAdminCategories } from '@/lib/categories';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
if (url !== 'http://127.0.0.1:56321') throw new Error('Categorías: integración solo contra Supabase local aislado.');
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const root = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const anon = createClient(url, key, { auth: { persistSession: false } });
let owner: SupabaseClient; let other: SupabaseClient; let imagePath: string;
const users: string[] = [], categories: string[] = [], products: string[] = [];
const base = { name: `Categoría ${randomUUID()}`, description: 'Diseño artesanal.', isActive: true, sortOrder: 8 };
async function category(patch = {}) { const id = randomUUID(); categories.push(id); return createCategory(owner, { ...base, ...patch }, id); }
beforeAll(async () => {
  for (const role of ['owner', 'other']) {
    const email = `${role}-${randomUUID()}@example.test`, password = `Test-${randomUUID()}`;
    const created = await root.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) throw created.error;
    const id = created.data.user!.id; users.push(id);
    if (role === 'owner') { const permission = await root.from('viento_sur_catalog_admins').insert({ user_id: id }); if (permission.error) throw permission.error; }
    const client = createClient(url, key, { auth: { persistSession: false } });
    const login = await client.auth.signInWithPassword({ email, password }); if (login.error) throw login.error;
    if (role === 'owner') owner = client; else other = client;
  }
  const asset = await root.from('viento_sur_catalog_assets').select('path').limit(1).single(); if (asset.error) throw asset.error;
  imagePath = asset.data.path;
});
afterAll(async () => {
  if (products.length) { const result = await root.from('viento_sur_products').delete().in('id', products); if (result.error) throw result.error; }
  if (categories.length) { const result = await root.from('viento_sur_categories').delete().in('id', categories); if (result.error) throw result.error; }
  for (const id of users) await root.auth.admin.deleteUser(id);
});
describe('Categorías, relación y RLS reales', () => {
  it('crea, reintenta sin duplicar y resuelve slug automático duplicado', async () => {
    const first = await category();
    expect((await createCategory(owner, base, first.id)).id).toBe(first.id);
    await expect(createCategory(owner, { ...base, name: 'Distinta' }, first.id)).rejects.toThrow('otros datos');
    const second = await category(); expect(second.slug).not.toBe(first.slug);
    await expect(category({ slug: first.slug })).rejects.toThrow('slug ya');
  });
  it('mantiene alias, rechaza robo de slug y detecta edición/eliminación simultánea', async () => {
    let row = await category(); const firstSlug = row.slug, stale = row.updated_at;
    row = await updateCategory(owner, row.id, row.updated_at, { name: 'Nombre nuevo', sortOrder: 1 }); expect(row.slug).toBe(firstSlug);
    await expect(updateCategory(owner, row.id, stale, { name: 'Viejo' })).rejects.toThrow('cambió');
    await expect(deleteCategory(owner, row.id, stale)).rejects.toThrow('cambió');
    row = await updateCategory(owner, row.id, row.updated_at, { slug: `alias-${randomUUID()}` });
    const alias = await anon.from('viento_sur_category_slugs').select('category_id').eq('slug', firstSlug).single(); expect(alias.data?.category_id).toBe(row.id);
    await expect(category({ slug: firstSlug })).rejects.toThrow('reservado');
    await deleteCategory(owner, row.id, row.updated_at);
    expect((await anon.from('viento_sur_category_slugs').select('slug').eq('category_id', row.id)).data).toEqual([]);
  });
  it('desactivar oculta productos sin cambiar estados; bloquea asignación y eliminación incluso con soft delete', async () => {
    let c = await category(); const id = randomUUID(); products.push(id);
    const input = productInputSchema.parse({ name: `Lámpara ${id}`, description: '', price: 85000, categoryId: c.id, status: 'publicada', images: [{ path: imagePath, alt: 'Prueba' }], specifications: [] });
    let p = await createProduct(owner, input, id);
    expect(p.category_id).toBe(c.id); expect((await anon.from('viento_sur_products').select('id').eq('id', id)).data).toHaveLength(1);
    await expect(deleteCategory(owner, c.id, c.updated_at)).rejects.toThrow('1 producto');
    c = await updateCategory(owner, c.id, c.updated_at, { isActive: false });
    expect((await anon.from('viento_sur_products').select('id').eq('id', id)).data).toEqual([]);
    expect((await owner.from('viento_sur_products').select('status').eq('id', id).single()).data?.status).toBe('publicada');
    const newId = randomUUID(); products.push(newId);
    await expect(createProduct(owner, input, newId)).rejects.toThrow('desactivada');
    const { categoryId, ...rest } = input;
    expect((await owner.from('viento_sur_products').insert({ ...rest, id: newId, slug: `new-${newId}`, category_id: categoryId })).error?.code).toBe('23514');
    p = await updateProduct(owner, id, p.updated_at, { categoryId: c.id, price: 90000 }); expect(Number(p.price)).toBe(90000);
    c = await updateCategory(owner, c.id, c.updated_at, { isActive: true });
    expect((await anon.from('viento_sur_products').select('id').eq('id', id)).data).toHaveLength(1);
    p = await updateProduct(owner, id, p.updated_at, { deleted_at: new Date().toISOString() });
    await expect(deleteCategory(owner, c.id, c.updated_at)).rejects.toThrow('1 producto');
    const counted = (await getAdminCategories(owner)).find(row => row.id === c.id); expect(counted).toMatchObject({ productCount: 1, publishedCount: 0 });
  });
  it('rechaza categorías inexistentes y no permite reasignar a una categoría inactiva', async () => {
    const active = await category(), inactive = await category({ isActive: false }); const id = randomUUID(); products.push(id);
    const input = productInputSchema.parse({ name: `Relación ${id}`, description: '', price: 85000, categoryId: active.id, status: 'publicada', images: [{ path: imagePath, alt: 'Prueba' }], specifications: [] });
    const p = await createProduct(owner, input, id);
    await expect(updateProduct(owner, id, p.updated_at, { categoryId: inactive.id })).rejects.toThrow('desactivada');
    await expect(updateProduct(owner, id, p.updated_at, { categoryId: randomUUID() })).rejects.toThrow('no existe');
    expect((await owner.from('viento_sur_products').update({ category_id: inactive.id }).eq('id', id)).error?.code).toBe('23514');
    expect((await owner.from('viento_sur_products').update({ category_id: randomUUID() }).eq('id', id)).error?.code).toBe('23503');
  });
  it('compatibiliza formularios antiguos sin volver al enum', async () => {
    const body = await normalizeProductCategory(owner, { name: 'Viejo', category: 'velador' });
    const c = await root.from('viento_sur_categories').select('id').eq('legacy_key', 'velador').single(); expect(body).toEqual({ name: 'Viejo', categoryId: c.data?.id });
    await expect(normalizeProductCategory(owner, { category: 'no-existe' })).rejects.toThrow('válida');
  });
  it('impide escritura anónima, cuentas sin permiso y manipulación del registro de slugs', async () => {
    const c = await category();
    for (const client of [anon, other]) {
      expect((await client.from('viento_sur_categories').insert({ name: 'Intruso', slug: `intruso-${randomUUID()}` })).error).toBeTruthy();
      const edited = await client.from('viento_sur_categories').update({ name: 'Intruso' }).eq('id', c.id).select(); expect(edited.error || edited.data?.length === 0).toBeTruthy();
      const deleted = await client.from('viento_sur_categories').delete().eq('id', c.id).select(); expect(deleted.error || deleted.data?.length === 0).toBeTruthy();
    }
    expect((await owner.from('viento_sur_categories').update({ legacy_key: 'robo' }).eq('id', c.id)).error).toBeTruthy();
    expect((await owner.from('viento_sur_category_slugs').insert({ slug: 'robo', category_id: c.id })).error).toBeTruthy();
    for (const patch of [{ name: '' }, { slug: '../robo' }, { sort_order: -1 }, { description: 'x'.repeat(5001) }]) {
      expect((await owner.from('viento_sur_categories').update(patch).eq('id', c.id)).error).toBeTruthy();
    }
    expect((await root.from('viento_sur_categories').select('name').eq('id', c.id).single()).data?.name).toBe(base.name);
  });
  it('respeta el orden numérico antes del criterio estable secundario', async () => {
    const later = await category({ sortOrder: 99 }), first = await category({ sortOrder: 0 });
    const list = (await anon.from('viento_sur_categories').select('id').eq('is_active', true).order('sort_order').order('id')).data!;
    expect(list.findIndex(c => c.id === first.id)).toBeLessThan(list.findIndex(c => c.id === later.id));
  });
});
