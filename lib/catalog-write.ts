import 'server-only';
import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BUCKET, slugify, type ProductInput } from './catalog-validation';
import { storageClient } from './supabase/server';
import { HttpError } from './admin';

export async function validateAssets(client: SupabaseClient, input: ProductInput) {
  const paths = input.images.map(i => i.path);
  if (new Set(paths).size !== paths.length) throw new HttpError(400, 'No repitas la misma imagen.');
  const { data, error } = await client.from('catalog_assets').select('path').in('path', paths);
  if (error) throw error;
  if (data.length !== paths.length) throw new HttpError(400, 'Una imagen no se terminó de subir. Volvé a seleccionarla.');
}
export async function createProduct(client: SupabaseClient, input: ProductInput, id: string) {
  await validateAssets(client, input);
  // A UUID allocated when the form opens makes retries after lost responses idempotent.
  const existing = await client.from('products').select('*').eq('id', id).maybeSingle();
  if (existing.error) throw existing.error;
  function resolveRetry(row: typeof existing.data) {
    if (row.deleted_at) throw new HttpError(409, 'Esta lámpara fue eliminada. Abrí un formulario nuevo.');
    const savedInput = {
      name: row.name, description: row.description, price: Number(row.price), category: row.category,
      status: row.status, images: row.images.map((i: { path: string; alt: string }) => ({ path: i.path, alt: i.alt })), specifications: row.specifications,
    };
    if (JSON.stringify(savedInput) !== JSON.stringify(input)) throw new HttpError(409, 'Esta lámpara ya fue guardada con otros datos. Abrila desde el listado para editarla.');
    return row;
  }
  if (existing.data) {
    return resolveRetry(existing.data);
  }
  const base = slugify(input.name);
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt ? `${base}-${randomUUID().slice(0, 8)}` : base;
    const { data, error } = await client.from('products').insert({ ...input, id, slug }).select('*').single();
    if (!error) return data;
    if (error.code !== '23505') throw error;
    const retry = await client.from('products').select('*').eq('id', id).maybeSingle();
    if (retry.data) return resolveRetry(retry.data);
  }
  throw new HttpError(409, 'No pudimos asignar una dirección a esta lámpara. Intentá nuevamente.');
}
export async function updateProduct(client: SupabaseClient, id: string, version: string, patch: Partial<ProductInput> & { deleted_at?: string }) {
  const { data, error } = await client.from('products').update(patch).eq('id', id)
    .eq('updated_at', version).is('deleted_at', null).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(409, 'La lámpara cambió o fue eliminada. Recargá antes de guardar.');
  return data;
}
export async function cleanupAssets(paths: string[], before = new Date().toISOString()) {
  if (!paths.length) return;
  const client = storageClient();
  const { data, error } = await client.rpc('prune_catalog_assets', { p_paths: paths, p_before: before });
  if (error) throw error;
  if (data.length) {
    const removed = await client.storage.from(BUCKET).remove(data.map((i: { path: string }) => i.path));
    if (removed.error) throw removed.error;
  }
}
