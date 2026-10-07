import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { categorySlugify, type CategoryInput } from './category-validation';
import { HttpError } from './admin';
import type { CategoryRow } from './category-types';
export async function createCategory(client: SupabaseClient, input: CategoryInput, id: string): Promise<CategoryRow> {
  const existing = await client.from('viento_sur_categories').select('*').eq('id', id).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    const row = existing.data;
    if (row.name !== input.name || row.description !== input.description || row.is_active !== input.isActive || row.sort_order !== input.sortOrder || (input.slug && row.slug !== input.slug))
      throw new HttpError(409, 'Esta categoría ya se guardó con otros datos. Abrila para editarla.');
    return row;
  }
  const base = input.slug || categorySlugify(input.name);
  for (let n = 1; n <= 100; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const { data, error } = await client.from('viento_sur_categories').insert({ id, name: input.name, slug, description: input.description, is_active: input.isActive, sort_order: input.sortOrder }).select('*').single();
    if (!error) return data;
    if (error.code !== '23505') throw error;
    // A concurrent retry may have saved the same ID while this request was running.
    const retry = await client.from('viento_sur_categories').select('*').eq('id', id).maybeSingle();
    if (retry.error) throw retry.error;
    if (retry.data) return createCategory(client, input, id);
    if (input.slug) throw new HttpError(409, 'Ese slug ya está utilizado o reservado por otra categoría.');
  }
  throw new HttpError(409, 'No pudimos generar un slug disponible. Elegí otro nombre.');
}
export async function updateCategory(client: SupabaseClient, id: string, version: string, patch: Partial<CategoryInput>): Promise<CategoryRow> {
  const fields = { ...(patch.name !== undefined && { name: patch.name }), ...(patch.slug !== undefined && { slug: patch.slug }),
    ...(patch.description !== undefined && { description: patch.description }), ...(patch.isActive !== undefined && { is_active: patch.isActive }), ...(patch.sortOrder !== undefined && { sort_order: patch.sortOrder }) };
  const { data, error } = await client.from('viento_sur_categories').update(fields).eq('id', id).eq('updated_at', version).select('*').maybeSingle();
  if (error?.code === '23505') throw new HttpError(409, 'Ese slug ya está utilizado o reservado por otra categoría.');
  if (error) throw error;
  if (!data) throw new HttpError(409, 'La categoría cambió o fue eliminada. Recargá antes de guardar.');
  return data;
}
export async function deleteCategory(client: SupabaseClient, id: string, version: string) {
  const { data, error } = await client.from('viento_sur_categories').delete().eq('id', id).eq('updated_at', version).select('id').maybeSingle();
  if (error?.code === '23503') {
    const count = await client.from('viento_sur_products').select('id', { count: 'exact', head: true }).eq('category_id', id);
    if (count.error) throw count.error;
    throw new HttpError(409, `Esta categoría tiene ${count.count} ${count.count === 1 ? 'producto asociado' : 'productos asociados'} y no puede eliminarse. Podés desactivarla.`);
  }
  if (error) throw error;
  if (!data) throw new HttpError(409, 'La categoría cambió o fue eliminada. Recargá antes de eliminarla.');
}
