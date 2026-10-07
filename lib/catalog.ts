import 'server-only';
import { cache } from 'react';
import { publicClient } from './supabase/server';
import { BUCKET } from './catalog-validation';
import { CATEGORIES, STRUCTURE_VARIANTS, type Product, type CategorySlug } from './product-types';

export interface ProductRow {
  id: string; slug: string; name: string; description: string; price: number;
  category: CategorySlug; status: 'publicada' | 'oculta';
  images: { path: string; alt: string }[]; specifications: string[];
  featured: boolean; sort_order: number; created_at: string; updated_at: string; deleted_at: string | null;
}
export function toProduct(row: ProductRow): Product {
  const client = publicClient();
  return {
    id: row.id, slug: row.slug, name: row.name, description: row.description, price: Number(row.price),
    category: row.category, categoryLabel: CATEGORIES.find(c => c.slug === row.category)!.label,
    images: row.images.map(i => ({ ...i, src: client.storage.from(BUCKET).getPublicUrl(i.path).data.publicUrl })),
    specifications: row.specifications, variants: STRUCTURE_VARIANTS, featured: row.featured,
    status: row.status, createdAt: row.created_at, updatedAt: row.updated_at, sortOrder: row.sort_order,
  };
}
export const getPublishedProducts = cache(async (category?: CategorySlug): Promise<Product[]> => {
  let query = publicClient().from('products').select('*').eq('status', 'publicada').is('deleted_at', null)
    .order('sort_order').order('id');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw new Error('No se pudo cargar el catálogo.');
  return (data as ProductRow[]).map(toProduct);
});
export const getPublishedProduct = cache(async (slug: string): Promise<Product | null> => {
  const { data, error } = await publicClient().from('products').select('*').eq('slug', slug)
    .eq('status', 'publicada').is('deleted_at', null).maybeSingle();
  if (error) throw new Error('No se pudo cargar la lámpara.');
  return data ? toProduct(data as ProductRow) : null;
});
