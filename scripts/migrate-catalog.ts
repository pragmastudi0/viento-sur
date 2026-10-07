import { readFile } from 'node:fs/promises';
import { legacyProducts } from '../data/legacy-products';
import { operatorClient } from './env';
import { optimizeImage } from '../lib/image-processing';
import { BUCKET } from '../lib/catalog-validation';

async function migrate() {
  const client = operatorClient();
  let inserted = 0;
  for (const product of legacyProducts) {
    const existing = await client.from('viento_sur_products').select('id').eq('id', product.id).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) { console.log(`Conservado: ${product.name}`); continue; }
    const images = [];
    for (const image of product.images) {
      const name = image.src.split('/').pop()!.replace(/\.jpg$/, '.webp');
      const path = `products/legacy/${name}`;
      const registered = await client.from('viento_sur_catalog_assets').select('path').eq('path', path).maybeSingle();
      if (registered.error) throw registered.error;
      if (!registered.data) {
        const bytes = await optimizeImage(await readFile(`public${image.src}`), 'image/jpeg');
        const uploaded = await client.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/webp', upsert: true });
        if (uploaded.error) throw uploaded.error;
        const saved = await client.from('viento_sur_catalog_assets').insert({ path });
        if (saved.error) throw saved.error;
      }
      images.push({ path, alt: image.alt });
    }
    const { id, slug, name, description, category, price, specifications, featured } = product;
    const { error } = await client.from('viento_sur_products').insert({ id, slug, name, description, category, price, specifications, featured: !!featured, images, status: 'publicada' });
    if (error) throw error;
    inserted++; console.log(`Migrada: ${name}`);
  }
  console.log(`${inserted} lámparas migradas; el resto se conservó sin cambios.`);
}
migrate().catch(e => { console.error('La migración se interrumpió:', e.message); process.exitCode = 1; });
