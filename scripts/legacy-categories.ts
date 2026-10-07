import type { SupabaseClient } from '@supabase/supabase-js';
import { legacyProducts } from '../data/legacy-products';
import { categorySlugify } from '../lib/category-validation';
export const legacyCategories = [...new Set(legacyProducts.map(p => p.category))].map((key, i) => ({
  legacy_key: key, name: key === 'lampara-de-pie' ? 'Lámparas de pie' : key === 'velador' ? 'Veladores' : key,
  slug: key === 'lampara-de-pie' ? 'lamparas-de-pie' : key === 'velador' ? 'veladores' : categorySlugify(key), sort_order: i + 1,
}));
export async function ensureLegacyCategories(client: SupabaseClient) {
  for (const category of legacyCategories) {
    const existing = await client.from('viento_sur_categories').select('id').eq('legacy_key', category.legacy_key).maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) {
      const inserted = await client.from('viento_sur_categories').insert(category);
      if (inserted.error) throw inserted.error;
    }
  }
}
