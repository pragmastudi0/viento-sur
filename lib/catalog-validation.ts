import { z } from 'zod';

export const BUCKET = 'viento_sur_catalogo';
export const MAX_UPLOAD = 3 * 1024 * 1024;
export const MAX_ORIGINAL = 15 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const imageSchema = z.object({
  path: z.string().regex(/^products\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\.webp$/),
  alt: z.string().trim().min(1).max(240),
}).strict();
export const productInputSchema = z.object({
  name: z.string().trim().min(1, 'Ingresá el nombre.').max(120),
  description: z.string().trim().max(5000),
  price: z.number().finite().positive().max(9999999999.99)
    .refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.0001, 'Usá hasta dos decimales.'),
  categoryId: z.string().regex(/^[a-zA-Z0-9-]{1,120}$/, 'Seleccioná una categoría válida.'),
  status: z.enum(['publicada', 'oculta']),
  images: z.array(imageSchema).min(1, 'Seleccioná una imagen principal.').max(10),
  specifications: z.array(z.string().trim().min(1).max(240)).max(30),
}).strict();
export const versionSchema = z.string().datetime({ offset: true });
export const updateInputSchema = productInputSchema.extend({ updatedAt: versionSchema }).strict();
export const actionSchema = z.object({ status: z.enum(['publicada', 'oculta']).optional(), updatedAt: versionSchema }).strict();
export type ProductInput = z.infer<typeof productInputSchema>;

/** Argentine grouping and decimal comma; never silently strip invalid characters. */
export function parsePrice(text: string): number | null {
  const value = text.trim().replace(/^\$\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value)) return null;
  const number = Number(value.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(number) && number > 0 && number <= 9999999999.99 ? number : null;
}
export function slugify(name: string): string {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'lampara';
}
