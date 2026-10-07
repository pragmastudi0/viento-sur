import 'server-only';
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BUCKET, slugify, type ProductInput } from './catalog-validation';
import { storageClient } from './supabase/server';
import { PRODUCT_SELECT } from './catalog';
import { HttpError } from './admin';

export async function validateAssets(client: SupabaseClient, input: ProductInput) {
  const paths = input.images.map(i => i.path);
  if (new Set(paths).size !== paths.length) throw new HttpError(400, 'No repitas la misma imagen.');
  const { data, error } = await client.from('viento_sur_catalog_assets').select('path').in('path', paths);
  if (error) throw error;
  if (data.length !== paths.length) throw new HttpError(400, 'Una imagen no se terminó de subir. Volvé a seleccionarla.');
}
export async function validateCategory(client: SupabaseClient, categoryId: string, productId?: string) {
  const category = await client.from('viento_sur_categories').select('id,is_active').eq('id', categoryId).maybeSingle();
  if (category.error) throw category.error;
  if (!category.data) throw new HttpError(400, 'La categoría no existe. Elegí otra.');
  if (!category.data.is_active) {
    const current = productId ? await client.from('viento_sur_products').select('category_id').eq('id', productId).maybeSingle() : null;
    if (current?.error) throw current.error;
    if (current?.data?.category_id !== categoryId) throw new HttpError(400, 'Esta categoría está desactivada. Elegí una activa.');
  }
}
function productFields(input: Partial<ProductInput> & { deleted_at?: string }) {
  const { categoryId, ...fields } = input;
  return { ...fields, ...(categoryId !== undefined && { category_id: categoryId }) };
}
export async function normalizeProductCategory(client: SupabaseClient, body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body;
  const data = body as Record<string, unknown>;
  if (!('category' in data) || 'categoryId' in data) return body;
  if (typeof data.category !== 'string') return body;
  const result = await client.from('viento_sur_categories').select('id').eq('legacy_key', data.category).maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) throw new HttpError(400, 'Seleccioná una categoría válida.');
  const { category: _legacy, ...rest } = data;
  void _legacy;
  return { ...rest, categoryId: result.data.id };
}
export async function createProduct(client: SupabaseClient, input: ProductInput, id: string) {
  await validateAssets(client, input);
  // A UUID allocated when the form opens makes retries after lost responses idempotent.
  const existing = await client.from('viento_sur_products').select(PRODUCT_SELECT).eq('id', id).maybeSingle();
  if (existing.error) throw existing.error;
  function resolveRetry(row: typeof existing.data) {
    if (row.deleted_at) throw new HttpError(409, 'Esta lámpara fue eliminada. Abrí un formulario nuevo.');
    const savedInput = {
      name: row.name, description: row.description, price: Number(row.price), categoryId: row.category_id,
      status: row.status, images: row.images.map((i: { path: string; alt: string }) => ({ path: i.path, alt: i.alt })), specifications: row.specifications,
    };
    if (JSON.stringify(savedInput) !== JSON.stringify(input)) throw new HttpError(409, 'Esta lámpara ya fue guardada con otros datos. Abrila desde el listado para editarla.');
    return row;
  }
  if (existing.data) {
    return resolveRetry(existing.data);
  }
  await validateCategory(client, input.categoryId);
  const base = slugify(input.name);
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt ? `${base}-${randomUUID().slice(0, 8)}` : base;
    const { data, error } = await client.from('viento_sur_products').insert({ ...productFields(input), id, slug }).select(PRODUCT_SELECT).single();
    if (!error) return data;
    if (error.code === '23503' || error.code === '23514') throw new HttpError(400, 'La categoría o los datos cambiaron. Recargá y revisá el formulario.');
    if (error.code !== '23505') throw error;
    const retry = await client.from('viento_sur_products').select(PRODUCT_SELECT).eq('id', id).maybeSingle();
    if (retry.data) return resolveRetry(retry.data);
  }
  throw new HttpError(409, 'No pudimos asignar una dirección a esta lámpara. Intentá nuevamente.');
}
export async function updateProduct(client: SupabaseClient, id: string, version: string, patch: Partial<ProductInput> & { deleted_at?: string }) {
  if (patch.categoryId !== undefined) await validateCategory(client, patch.categoryId, id);
  const { data, error } = await client.from('viento_sur_products').update(productFields(patch)).eq('id', id)
    .eq('updated_at', version).is('deleted_at', null).select(PRODUCT_SELECT).maybeSingle();
  if (error?.code === '23503' || error?.code === '23514') throw new HttpError(400, 'La categoría o los datos cambiaron. Recargá y revisá el formulario.');
  if (error) throw error;
  if (!data) throw new HttpError(409, 'La lámpara cambió o fue eliminada. Recargá antes de guardar.');
  return data;
}
export async function cleanupAssets(paths: string[], before = new Date().toISOString()) {
  if (!paths.length) return;
  const client = storageClient();
  const { data, error } = await client.rpc('viento_sur_prune_catalog_assets', { p_paths: paths, p_before: before });
  if (error) throw error;
  if (data.length) {
    const removed = await client.storage.from(BUCKET).remove(data.map((i: { path: string }) => i.path));
    if (removed.error) throw removed.error;
  }
}
