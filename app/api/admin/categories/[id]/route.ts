import { checkOrigin, errorResponse, HttpError, readJson, requireAdmin } from '@/lib/admin';
import { categoryUpdateSchema, categoryActionSchema } from '@/lib/category-validation';
import { versionSchema } from '@/lib/catalog-validation';
import { updateCategory, deleteCategory } from '@/lib/category-write';
import { toCategory } from '@/lib/category-types';
import { z } from 'zod';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  try {
    const { client } = await requireAdmin(); const { id } = await params;
    const { data, error } = await client.from('viento_sur_categories').select('*').eq('id', id).maybeSingle();
    if (error) throw error; if (!data) throw new HttpError(404, 'La categoría no existe.');
    return Response.json({ category: toCategory(data) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return errorResponse(e); }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    checkOrigin(request); const { client } = await requireAdmin(); const { id } = await params;
    const body = await readJson(request); const full = categoryUpdateSchema.safeParse(body); const action = categoryActionSchema.safeParse(body);
    if (!full.success && !action.success) throw new HttpError(400, 'Revisá los datos de la categoría.');
    const { updatedAt, ...patch } = full.success ? full.data : action.data!;
    return Response.json({ category: toCategory(await updateCategory(client, id, updatedAt, patch)) });
  } catch (e) { return errorResponse(e); }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    checkOrigin(request); const { client } = await requireAdmin(); const { id } = await params;
    const parsed = z.object({ updatedAt: versionSchema }).strict().safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, 'Recargá la categoría antes de eliminarla.');
    await deleteCategory(client, id, parsed.data.updatedAt); return Response.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
