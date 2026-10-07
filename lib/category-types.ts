export interface Category {
  id: string; name: string; slug: string; description: string; isActive: boolean;
  sortOrder: number; createdAt: string; updatedAt: string; legacyKey: string | null;
}
export interface CategoryRow {
  id: string; name: string; slug: string; description: string; is_active: boolean;
  sort_order: number; created_at: string; updated_at: string; legacy_key: string | null;
}
export interface AdminCategory extends Category { productCount: number; publishedCount: number }
/** Historical routes only; category lists and labels always come from the database. */
export function categoryHref(category: Pick<Category, 'legacyKey' | 'slug'>) {
  if (category.legacyKey === 'lampara-de-pie') return '/lamparas-de-pie';
  if (category.legacyKey === 'velador') return '/veladores';
  return `/categorias/${category.slug}`;
}
export function toCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug, description: row.description,
    isActive: row.is_active, sortOrder: row.sort_order, createdAt: row.created_at,
    updatedAt: row.updated_at, legacyKey: row.legacy_key };
}
