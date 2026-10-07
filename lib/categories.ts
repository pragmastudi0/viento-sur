import 'server-only';
import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { publicClient } from './supabase/server';
import { toCategory, type CategoryRow, type AdminCategory } from './category-types';
export const getActiveCategories = cache(async () => {
  const { data, error } = await publicClient().from('viento_sur_categories').select('*').eq('is_active', true).order('sort_order').order('id');
  if (error) throw new Error('No pudimos cargar las categorías.');
  return (data as CategoryRow[]).map(toCategory);
});
export const getCategoryBySlug = cache(async (slug: string) => {
  const { data, error } = await publicClient().from('viento_sur_category_slugs').select('category:viento_sur_categories(*)').eq('slug', slug).maybeSingle();
  if (error) throw new Error('No pudimos cargar la categoría.');
  return data ? toCategory(data.category as unknown as CategoryRow) : null;
});
export const getLegacyCategory = cache(async (key: string) => {
  const { data, error } = await publicClient().from('viento_sur_categories').select('*').eq('legacy_key', key).maybeSingle();
  if (error) throw new Error('No pudimos cargar la categoría.');
  return data ? toCategory(data as CategoryRow) : null;
});
export async function getAdminCategories(client: SupabaseClient): Promise<AdminCategory[]> {
  const { data, error } = await client.from('viento_sur_categories').select('*').order('sort_order').order('id');
  if (error) throw error;
  const counts = new Map<string, { total: number; published: number }>();
  for (let offset = 0; ; offset += 500) {
    const products = await client.from('viento_sur_products').select('id,category_id,status,deleted_at').order('id').range(offset, offset + 499);
    if (products.error) throw products.error;
    for (const product of products.data) {
      const count = counts.get(product.category_id) || { total: 0, published: 0 };
      count.total++;
      if (product.status === 'publicada' && !product.deleted_at) count.published++;
      counts.set(product.category_id, count);
    }
    if (products.data.length < 500) break;
  }
  return (data as CategoryRow[]).map(row => ({ ...toCategory(row),
    productCount: counts.get(row.id)?.total || 0,
    publishedCount: counts.get(row.id)?.published || 0 }));
}
