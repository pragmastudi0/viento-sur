import 'server-only';
import { toCategory, type CategoryRow } from './category-types';
export const PRODUCT_SELECT = '*,category_record:viento_sur_categories!viento_sur_products_category_id_fkey(*)';
import { cache } from 'react';
import { publicClient } from './supabase/server';
import { BUCKET } from './catalog-validation';
import { STRUCTURE_VARIANTS, type Product } from './product-types';

export interface ProductRow {
  id: string; slug: string; name: string; description: string; price: number;
  category_id: string; category_record: CategoryRow; status: 'publicada' | 'oculta';
  images: { path: string; alt: string }[]; specifications: string[];
  featured: boolean; sort_order: number; created_at: string; updated_at: string; deleted_at: string | null;
}
export function toProduct(row: ProductRow): Product {
  const client = publicClient();
  return {
    id: row.id, slug: row.slug, name: row.name, description: row.description, price: Number(row.price),
    categoryId: row.category_id, category: toCategory(row.category_record), categoryLabel: row.category_record.name,
    images: row.images.map(i => ({ ...i, src: client.storage.from(BUCKET).getPublicUrl(i.path).data.publicUrl })),
    specifications: row.specifications, variants: STRUCTURE_VARIANTS, featured: row.featured,
    status: row.status, createdAt: row.created_at, updatedAt: row.updated_at, sortOrder: row.sort_order,
  };
}
export const getPublishedProducts = cache(async (categoryId?: string): Promise<Product[]> => {
  let query = publicClient().from('viento_sur_products').select(PRODUCT_SELECT).eq('status', 'publicada').is('deleted_at', null)
    .order('sort_order').order('id');
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data, error } = await query;
  if (error) throw new Error('No se pudo cargar el catálogo.');
  return (data as ProductRow[]).map(toProduct);
});
export const getPublishedProduct = cache(async (slug: string): Promise<Product | null> => {
  const { data, error } = await publicClient().from('viento_sur_products').select(PRODUCT_SELECT).eq('slug', slug)
    .eq('status', 'publicada').is('deleted_at', null).maybeSingle();
  if (error) throw new Error('No se pudo cargar la lámpara.');
  return data ? toProduct(data as ProductRow) : null;
});
