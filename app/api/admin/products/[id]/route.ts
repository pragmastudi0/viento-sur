import { checkOrigin, errorResponse, HttpError, readJson, requireAdmin } from '@/lib/admin';
import { actionSchema, updateInputSchema } from '@/lib/catalog-validation';
import { cleanupAssets, updateProduct, validateAssets } from '@/lib/catalog-write';
import { toProduct } from '@/lib/catalog';

type Context = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';
export async function PATCH(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const { client } = await requireAdmin();
    const { id } = await context.params;
    const body = await readJson(request);
    const full = updateInputSchema.safeParse(body);
    const action = actionSchema.safeParse(body);
    if (!full.success && (!action.success || !action.data.status)) throw new HttpError(400, 'Revisá los datos del formulario.');
    if (full.success) {
      const { updatedAt, ...input } = full.data;
      await validateAssets(client, input);
      const old = await client.from('viento_sur_products').select('images').eq('id', id).single();
      if (old.error) throw new HttpError(404, 'No encontramos esta lámpara.');
      const product = await updateProduct(client, id, updatedAt, input);
      const replaced = old.data.images.map((i: { path: string }) => i.path).filter((p: string) => !input.images.some(i => i.path === p));
      try { await cleanupAssets(replaced); } catch { console.error('Image cleanup pending; run catalog:cleanup.'); }
      return Response.json({ product: toProduct(product) });
    }
    const { updatedAt, status } = action.data!;
    return Response.json({ product: toProduct(await updateProduct(client, id, updatedAt, { status })) });
  } catch (e) { return errorResponse(e); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const { client } = await requireAdmin();
    const { id } = await context.params;
    const body = actionSchema.omit({ status: true }).safeParse(await readJson(request));
    if (!body.success) throw new HttpError(400, 'Recargá la lámpara antes de eliminarla.');
    await updateProduct(client, id, body.data.updatedAt, { deleted_at: new Date().toISOString() });
    return Response.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
