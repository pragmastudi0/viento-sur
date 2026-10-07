import { describe, expect, it } from 'vitest';
import { parsePrice, productInputSchema, slugify } from '@/lib/catalog-validation';
import { formatPrice } from '@/lib/currency';
import { reconcileCart } from '@/lib/cart-reconciliation';
import { legacyProducts } from '@/data/legacy-products';
import type { Product } from '@/lib/product-types';

describe('Importes argentinos', () => {
  it.each(['85000', '85.000', '$ 85.000'])('interpreta %s sin perder miles', value => expect(parsePrice(value)).toBe(85000));
  it('permite centavos y los conserva al mostrar', () => {
    expect(parsePrice('85.000,50')).toBe(85000.5); expect(formatPrice(85000.5)).toBe('$85.000,50');
  });
  it.each(['', '-5', 'NaN', 'Infinity', '0', '8.50', '1,234', '10e5', '85.000foo', '10000000000'])('rechaza %s', value => expect(parsePrice(value)).toBeNull());
});
describe('Datos del catálogo', () => {
  const valid = { name: 'Lámpara Nórdica', description: '', price: 85000, category: 'velador', status: 'publicada', images: [{ path: 'products/owner/foto.webp', alt: 'Lámpara Nórdica' }], specifications: [] };
  it('acepta el modelo mínimo', () => expect(productInputSchema.safeParse(valid).success).toBe(true));
  it.each([{ name: ' ' }, { price: -1 }, { price: 1.234 }, { price: Infinity }, { images: [] }, { status: 'admin' }, { category: 'otra' }, { description: 'x'.repeat(5001) }, { unexpected: true }, { images: [{ path: '../../secret', alt: 'Foto' }] }])('rechaza datos inválidos %j', patch => expect(productInputSchema.safeParse({ ...valid, ...patch }).success).toBe(false));
  it('genera direcciones amigables', () => expect(slugify('Lámpara Nórdica')).toBe('lampara-nordica'));
  it('conserva las seis lámparas, categorías y terminaciones de migración', () => {
    expect(legacyProducts.map(p => p.id)).toEqual(['lanin', 'lanin-xl', 'traful', 'piedra-mora', 'manly', 'kids']);
    expect(legacyProducts.every(p => p.images.length > 0 && p.variants.length === 3)).toBe(true);
  });
});
describe('Carrito actualizado', () => {
  const p = { ...legacyProducts[0], status: 'publicada', createdAt: '', updatedAt: '', sortOrder: 1 } as Product;
  const item = { productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images[0].src, variantId: 'negro', variantLabel: 'Negro', quantity: 2 };
  it('mantiene un carrito vigente', () => expect(reconcileCart([item], [p]).changed).toBe(false));
  it('retira productos ocultos o eliminados', () => expect(reconcileCart([item], []).items).toEqual([]));
  it('actualiza precios sin perder cantidades', () => expect(reconcileCart([item], [{ ...p, price: 85000 }])).toMatchObject({ changed: true, items: [{ price: 85000, quantity: 2 }] }));
});
