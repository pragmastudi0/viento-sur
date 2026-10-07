import { describe, expect, it } from 'vitest';
import { categoryInputSchema, categorySlugify, suggestCategorySlug } from '@/lib/category-validation';
import { categoryHref, toCategory } from '@/lib/category-types';
import { navigationLinks } from '@/lib/nav';
const input = { name: 'Lámparas de Mesa', description: '', isActive: true, sortOrder: 2 };
describe('Categorías dinámicas', () => {
  it.each([['Lámparas de Mesa', 'lamparas-de-mesa'], ['  Café & Luz!! ', 'cafe-luz'], ['新しい', 'categoria'], ['---', 'categoria']])('normaliza %s', (name, slug) => expect(categorySlugify(name)).toBe(slug));
  it('limita la longitud y evita colisiones', () => {
    expect(categorySlugify('a'.repeat(200))).toHaveLength(100);
    expect(suggestCategorySlug('Mesa', ['mesa', 'mesa-2'])).toBe('mesa-3');
  });
  it('admite categorías activas e inactivas con nombre normalizado', () => {
    expect(categoryInputSchema.parse({ ...input, name: ' Mesa ', isActive: false }).name).toBe('Mesa');
  });
  it.each([{ name: ' ' }, { slug: '' }, { slug: 'Mésa' }, { slug: '../mesa' }, { sortOrder: -1 }, { sortOrder: 1.5 }, { sortOrder: '1' }, { isActive: 'false' }, { description: 'x'.repeat(5001) }, { extra: true }])('rechaza %j', patch => expect(categoryInputSchema.safeParse({ ...input, ...patch }).success).toBe(false));
  it('mantiene las URLs históricas y admite nuevas categorías sin un enum', () => {
    expect(categoryHref({ legacyKey: 'velador', slug: 'otro-nombre' })).toBe('/veladores');
    expect(categoryHref({ legacyKey: 'lampara-de-pie', slug: 'otro' })).toBe('/lamparas-de-pie');
    expect(categoryHref({ legacyKey: null, slug: 'nueva' })).toBe('/categorias/nueva');
  });
  it('conserva estado y orden del modelo y construye navegación dinámica', () => {
    const category = toCategory({ id: 'new-id', name: 'Nueva colección', slug: 'nueva-coleccion', description: '', is_active: true, sort_order: 3, legacy_key: null, created_at: '', updated_at: '' });
    expect(category).toMatchObject({ isActive: true, sortOrder: 3 });
    expect(navigationLinks([category])).toContainEqual({ href: '/categorias/nueva-coleccion', label: 'Nueva colección' });
  });
});
