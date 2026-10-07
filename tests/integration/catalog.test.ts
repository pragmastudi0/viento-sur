import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { createProduct, updateProduct, cleanupAssets } from '@/lib/catalog-write';
import { productInputSchema } from '@/lib/catalog-validation';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Deliberately refuse to execute mutation tests against a remote project.
if (!/^http:\/\/(127\.0\.0\.1|localhost):56321$/.test(url)) throw new Error('Las pruebas de integración requieren Supabase local aislado en :56321.');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const root = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const anon = createClient(url, anonKey, { auth: { persistSession: false } });
let owner: SupabaseClient; let other: SupabaseClient;
const users: string[] = []; const ids: string[] = []; const paths: string[] = [];
const password = `Test-${randomUUID()}`;
let input: ReturnType<typeof productInputSchema.parse>;
beforeAll(async () => {
  for (const role of ['owner', 'other']) {
    const email = `${role}-${randomUUID()}@example.test`;
    const created = await root.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data.user) throw created.error;
    users.push(created.data.user.id);
    if (role === 'owner') {
      const permission = await root.from('viento_sur_catalog_admins').insert({ user_id: created.data.user.id });
      if (permission.error) throw permission.error;
    }
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const signed = await client.auth.signInWithPassword({ email, password }); if (signed.error) throw signed.error;
    if (role === 'owner') owner = client; else other = client;
  }
  const path = `products/${users[0]}/${randomUUID()}.webp`; paths.push(path);
  const bytes = await sharp({ create: { width: 20, height: 20, channels: 3, background: 'white' } }).webp().toBuffer();
  const upload = await root.storage.from('viento_sur_catalogo').upload(path, bytes, { contentType: 'image/webp' }); if (upload.error) throw upload.error;
  const registry = await root.from('viento_sur_catalog_assets').insert({ path, uploaded_by: users[0] }); if (registry.error) throw registry.error;
  input = productInputSchema.parse({ name: 'Lámpara Nórdica integración', description: 'Lámpara de mesa de diseño nórdico.', price: 85000, category: 'velador', status: 'publicada', images: [{ path, alt: 'Nórdica' }], specifications: [] });
});
afterAll(async () => {
  if (ids.length) await root.from('viento_sur_products').delete().in('id', ids);
  if (paths.length) { await root.from('viento_sur_catalog_assets').delete().in('path', paths); await root.storage.from('viento_sur_catalogo').remove(paths); }
  for (const id of users) await root.auth.admin.deleteUser(id);
});
describe('CRUD y políticas reales', () => {
  it('crea, conserva reintentos y resuelve slugs duplicados', async () => {
    const id = randomUUID(); ids.push(id);
    const created = await createProduct(owner, input, id); expect(Number(created.price)).toBe(85000);
    expect((await createProduct(owner, input, id)).slug).toBe(created.slug);
    await expect(createProduct(owner, { ...input, name: 'Datos diferentes tras perder conexión' }, id)).rejects.toThrow('ya fue guardada');
    const id2 = randomUUID(); ids.push(id2); const second = await createProduct(owner, input, id2);
    expect(second.slug).not.toBe(created.slug);
  });
  it('edita, oculta, publica, rechaza versión vieja y elimina lógicamente', async () => {
    const id = randomUUID(); ids.push(id); let row = await createProduct(owner, input, id);
    const stale = row.updated_at;
    const slug = row.slug;
    row = await updateProduct(owner, id, row.updated_at, { name: 'Nórdica editada', price: 90000 });
    expect(row.images).toEqual(input.images); expect(row.slug).toBe(slug);
    await expect(updateProduct(owner, id, stale, { price: 1 })).rejects.toThrow('cambió');
    row = await updateProduct(owner, id, row.updated_at, { status: 'oculta' });
    expect((await anon.from('viento_sur_products').select('id').eq('id', id)).data).toEqual([]);
    expect((await owner.from('viento_sur_products').select('id').eq('id', id)).data).toHaveLength(1);
    row = await updateProduct(owner, id, row.updated_at, { status: 'publicada' });
    expect((await anon.from('viento_sur_products').select('id').eq('id', id)).data).toHaveLength(1);
    row = await updateProduct(owner, id, row.updated_at, { deleted_at: new Date().toISOString() });
    expect(row.deleted_at).toBeTruthy(); expect((await anon.from('viento_sur_products').select('id').eq('id', id)).data).toEqual([]);
  });
  it('bloquea escritura directa de visitantes y cuentas no autorizadas', async () => {
    for (const client of [anon, other]) {
      const result = await client.from('viento_sur_products').insert({ ...input, slug: `intruder-${randomUUID()}` }); expect(result.error).toBeTruthy();
      const update = await client.from('viento_sur_products').update({ price: 1 }).eq('id', ids[0]).select(); expect(update.error || update.data?.length === 0).toBeTruthy();
      expect((await client.from('viento_sur_catalog_admins').insert({ user_id: users[1] })).error).toBeTruthy();
      expect((await client.rpc('viento_sur_is_catalog_admin')).data).toBe(false);
    }
  });
  it('rechaza campos inválidos e imágenes no verificadas en base de datos', async () => {
    for (const patch of [{ price: -1 }, { price: 1.234 }, { status: 'otra' }, { name: '' }, { images: [] }, { images: [{ path: 'products/evil/file.webp', alt: 'x' }] }]) {
      const invalid = await owner.from('viento_sur_products').insert({ ...input, ...patch, slug: `invalid-${randomUUID()}` }); expect(invalid.error).toBeTruthy();
    }
  });
  it('bloquea upload y eliminación directa incluso con una cuenta autenticada', async () => {
    for (const client of [anon, other, owner]) {
      const uploaded = await client.storage.from('viento_sur_catalogo').upload(`products/${users[0]}/bad.webp`, Buffer.from('fake'), { contentType: 'image/webp' }); expect(uploaded.error).toBeTruthy();
      await client.storage.from('viento_sur_catalogo').remove(paths);
      expect((await root.storage.from('viento_sur_catalogo').download(paths[0])).error).toBeNull();
    }
  });
  it('no elimina fotos compartidas ni de productos borrados lógicamente', async () => {
    await cleanupAssets(paths);
    expect((await root.from('viento_sur_catalog_assets').select('*').eq('path', paths[0])).data).toHaveLength(1);
    expect((await root.storage.from('viento_sur_catalogo').download(paths[0])).error).toBeNull();
  });
});
