import { z } from 'zod';
import { checkOrigin, errorResponse, HttpError, readJson, requireAdmin } from '@/lib/admin';
import { categoryInputSchema } from '@/lib/category-validation';
import { createCategory } from '@/lib/category-write';
import { getAdminCategories } from '@/lib/categories';
import { toCategory } from '@/lib/category-types';
export async function GET() {
  try { const { client } = await requireAdmin(); return Response.json({ categories: await getAdminCategories(client) }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch (e) { return errorResponse(e); }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request); const { client } = await requireAdmin();
    const parsed = categoryInputSchema.extend({ id: z.string().uuid() }).safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, 'Revisá nombre, slug, descripción y orden.');
    const { id, ...input } = parsed.data;
    return Response.json({ category: toCategory(await createCategory(client, input, id)) }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
