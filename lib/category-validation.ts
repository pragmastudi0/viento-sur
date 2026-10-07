import { z } from 'zod';
import { versionSchema } from './catalog-validation';
export const categorySlugSchema = z.string().min(1, 'Ingresá el slug.').max(120, 'Usá hasta 120 caracteres en el slug.')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Usá minúsculas, números y guiones.');
export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, 'Ingresá el nombre.').max(120, 'Usá hasta 120 caracteres.'),
  slug: categorySlugSchema.optional(),
  description: z.string().trim().max(5000, 'Usá hasta 5.000 caracteres.').default(''),
  isActive: z.boolean(),
  sortOrder: z.number().int('El orden debe ser un número entero.').min(0, 'El orden no puede ser negativo.').max(2147483647, 'El orden máximo es 2.147.483.647.'),
}).strict();
export const categoryUpdateSchema = categoryInputSchema.extend({ slug: categorySlugSchema, updatedAt: versionSchema }).strict();
export const categoryActionSchema = z.object({ isActive: z.boolean(), updatedAt: versionSchema }).strict();
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export function categorySlugify(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100).replace(/-$/, '') || 'categoria';
}
export function suggestCategorySlug(name: string, reserved: readonly string[]) {
  const base = categorySlugify(name); let slug = base; let suffix = 1;
  while (reserved.includes(slug)) slug = `${base}-${++suffix}`;
  return slug;
}
