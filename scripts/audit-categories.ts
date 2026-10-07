import { operatorClient } from './env';
import { categorySlugify } from '../lib/category-validation';
async function audit() {
  const client = operatorClient();
  const products: { category: string; category_id?: string; status: string; deleted_at: string | null }[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await client.from('viento_sur_products').select('*').order('id').range(offset, offset + 499);
    if (result.error) throw result.error;
    products.push(...result.data); if (result.data.length < 500) break;
  }
  const existing = await client.from('viento_sur_categories').select('id,name,slug,legacy_key');
  if (existing.error && existing.error.code !== 'PGRST205' && existing.error.code !== '42P01') throw existing.error;
  const registry = existing.error ? null : await client.from('viento_sur_category_slugs').select('slug');
  if (registry?.error) throw registry.error;
  const reserved = new Set((registry?.data || []).map(row => row.slug));
  for (const row of existing.data || []) reserved.add(row.slug);
  const grouped = new Map<string, typeof products>();
  for (const product of products) { const rows = grouped.get(product.category) || []; rows.push(product); grouped.set(product.category, rows); }
  const report = [...grouped.keys()].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b))).map(key => {
    if (!key?.trim() || key.trim().length > 120) throw new Error('Hay categorías inválidas: corregir antes de migrar.');
    const found = existing.data?.find(c => c.legacy_key === key || c.id === key);
    const name = found?.name || (key === 'lampara-de-pie' ? 'Lámparas de pie' : key === 'velador' ? 'Veladores' : key.trim());
    const base = key === 'lampara-de-pie' ? 'lamparas-de-pie' : key === 'velador' ? 'veladores' : categorySlugify(key);
    let slug = found?.slug || base, n = 1;
    if (!found) { while (reserved.has(slug)) slug = `${base}-${++n}`; reserved.add(slug); }
    const rows = grouped.get(key)!;
    return { origen: key, nombre: name, slug, acción: found ? 'conservar' : 'crear', productos: rows.length, publicadas: rows.filter(p => p.status === 'publicada' && !p.deleted_at).length };
  });
  console.log(`Auditoría de SOLO LECTURA: ${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host}`);
  console.table(report);
  console.log(`${products.length} productos a conservar. ${products.filter(p => !p.category_id).length} relaciones a completar. No se ejecutó ninguna escritura.`);
  console.log('Cambios: viento_sur_categories + viento_sur_category_slugs; FK category_id; conservar category; políticas/triggers exclusivos Viento Sur. Revisar también supabase/categories-preflight.sql antes de aplicar.');
}
audit().catch(e => { console.error('No pudimos auditar categorías:', e.message); process.exitCode = 1; });
