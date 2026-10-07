import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { legacyProducts } from '../data/legacy-products';
import { optimizeImage } from '../lib/image-processing';
async function main() {
  const folder = 'catalog-migration/photos/products/legacy';
  await mkdir(folder, { recursive: true });
  for (const product of legacyProducts) for (const image of product.images) {
    const name = image.src.split('/').pop()!.replace(/\.jpg$/, '.webp');
    await writeFile(`${folder}/${name}`, await optimizeImage(await readFile(`public${image.src}`), 'image/jpeg'));
  }
  console.log(`Nueve fotos preparadas en ${folder}. Subir al bucket viento_sur_catalogo conservando la carpeta products/legacy.`);
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
