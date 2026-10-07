import { z } from 'zod';
import { checkOrigin, errorResponse, HttpError, readJson, requireAdmin } from '@/lib/admin';
import { productInputSchema } from '@/lib/catalog-validation';
import { createProduct } from '@/lib/catalog-write';
import { toProduct } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { client } = await requireAdmin();
    const parsed = productInputSchema.extend({ id: z.string().uuid() }).strict().safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, 'Revisá nombre, precio, categoría e imágenes.');
    const { id, ...input } = parsed.data;
    return Response.json({ product: toProduct(await createProduct(client, input, id)) }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
