import { legacyCategories } from './legacy-categories';
import { writeFileSync } from 'node:fs';
import { legacyProducts } from '../data/legacy-products';
const quote = (v: string) => `'${v.replace(/'/g, "''")}'`;
const expected = legacyProducts.flatMap(p => p.images.map(i => ({ id: p.id, path: `products/legacy/${i.src.split('/').pop()!.replace(/\.jpg$/, '.webp')}` })));
const values = expected.map(i => `(${quote(i.id)}, ${quote(i.path)})`).join(',\n');
const sql = [
  '-- Ejecutar DESPUÉS de ambas migraciones (catálogo y categorías) y de subir las nueve fotos WebP.\n-- Ver README: las fotos se pueden preparar con npm run catalog:photos.\n-- Repetible: no sobrescribe lámparas existentes.\nbegin;',
  `do $$ begin\n  if exists (select 1 from (values ${values}) as expected(product_id, path)\n    where not exists (select 1 from public.viento_sur_products where id = expected.product_id)\n    and not exists (select 1 from storage.objects where bucket_id = 'viento_sur_catalogo' and name = expected.path)) then\n    raise exception 'Primero subí las fotos de las lámparas nuevas al bucket viento_sur_catalogo en products/legacy. No se publicó ninguna lámpara.';\n  end if;\nend $$;`,
  `insert into public.viento_sur_catalog_assets (path)\nselect distinct expected.path from (values ${values}) as expected(product_id, path)\nwhere not exists (select 1 from public.viento_sur_products where id = expected.product_id)\non conflict (path) do nothing;`,
  ...legacyCategories.map(c => `insert into public.viento_sur_categories (name, slug, legacy_key, sort_order)\nselect ${quote(c.name)}, ${quote(c.slug)}, ${quote(c.legacy_key)}, ${c.sort_order}\nwhere not exists (select 1 from public.viento_sur_categories where legacy_key = ${quote(c.legacy_key)});`),
  ...legacyProducts.map(p => {
    const images = p.images.map(i => ({ path: `products/legacy/${i.src.split('/').pop()!.replace(/\.jpg$/, '.webp')}`, alt: i.alt }));
    return `insert into public.viento_sur_products (id, slug, name, description, price, category, images, specifications, featured, status)\nselect ${[p.id,p.slug,p.name,p.description].map(quote).join(', ')}, ${p.price}, ${quote(p.category)}, ${quote(JSON.stringify(images))}::jsonb, array[${p.specifications.map(quote).join(', ')}]::text[], ${!!p.featured}, 'publicada'\nwhere not exists (select 1 from public.viento_sur_products where id = ${quote(p.id)})\non conflict (id) do nothing;`;
  }),
  'commit;\n',
];
writeFileSync('supabase/catalog-seed.sql', sql.join('\n\n'));
console.log('SQL de las seis lámparas generado sin credenciales.');
