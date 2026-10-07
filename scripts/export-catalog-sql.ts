import { writeFileSync } from 'node:fs';
import { legacyProducts } from '../data/legacy-products';
const quote = (v: string) => `'${v.replace(/'/g, "''")}'`;
const expected = legacyProducts.flatMap(p => p.images.map(i => ({ id: p.id, path: `products/legacy/${i.src.split('/').pop()!.replace(/\.jpg$/, '.webp')}` })));
const values = expected.map(i => `(${quote(i.id)}, ${quote(i.path)})`).join(',\n');
const sql = [
  '-- Ejecutar DESPUÉS de 202610060001_catalog.sql y de subir las nueve fotos WebP.\n-- Ver README: las fotos se pueden preparar con npm run catalog:photos.\n-- Repetible: no sobrescribe lámparas existentes.\nbegin;',
  `do $$ begin\n  if exists (select 1 from (values ${values}) as expected(product_id, path)\n    where not exists (select 1 from public.products where id = expected.product_id)\n    and not exists (select 1 from storage.objects where bucket_id = 'catalogo' and name = expected.path)) then\n    raise exception 'Primero subí las fotos de las lámparas nuevas al bucket catalogo en products/legacy. No se publicó ninguna lámpara.';\n  end if;\nend $$;`,
  `insert into public.catalog_assets (path)\nselect distinct expected.path from (values ${values}) as expected(product_id, path)\nwhere not exists (select 1 from public.products where id = expected.product_id)\non conflict (path) do nothing;`,
  ...legacyProducts.map(p => {
    const images = p.images.map(i => ({ path: `products/legacy/${i.src.split('/').pop()!.replace(/\.jpg$/, '.webp')}`, alt: i.alt }));
    return `insert into public.products (id, slug, name, description, price, category, images, specifications, featured, status)\nselect ${[p.id,p.slug,p.name,p.description].map(quote).join(', ')}, ${p.price}, ${quote(p.category)}, ${quote(JSON.stringify(images))}::jsonb, array[${p.specifications.map(quote).join(', ')}]::text[], ${!!p.featured}, 'publicada'\nwhere not exists (select 1 from public.products where id = ${quote(p.id)})\non conflict (id) do nothing;`;
  }),
  'commit;\n',
];
writeFileSync('supabase/catalog-seed.sql', sql.join('\n\n'));
console.log('SQL de las seis lámparas generado sin credenciales.');
