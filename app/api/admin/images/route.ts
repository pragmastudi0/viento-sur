import { randomUUID } from 'node:crypto';
import { checkOrigin, errorResponse, HttpError, requireAdmin } from '@/lib/admin';
import { BUCKET, MAX_UPLOAD } from '@/lib/catalog-validation';
import { optimizeImage } from '@/lib/image-processing';
import { storageClient } from '@/lib/supabase/server';
import { cleanupAssets } from '@/lib/catalog-write';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await requireAdmin();
    if (Number(request.headers.get('content-length') || 0) > MAX_UPLOAD + 20000) throw new HttpError(413, 'La imagen es demasiado grande.');
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > MAX_UPLOAD || !file.size) throw new HttpError(400, 'Elegí una imagen JPG, PNG o WebP de hasta 3 MB para subir.');
    let bytes: Buffer;
    try { bytes = await optimizeImage(Buffer.from(await file.arrayBuffer()), file.type); }
    catch { throw new HttpError(400, 'La imagen no es válida. Elegí otra foto JPG, PNG o WebP.'); }
    const client = storageClient();
    const path = `products/${user.id}/${randomUUID()}.webp`;
    const { error } = await client.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/webp', upsert: false });
    if (error) throw new HttpError(503, 'No pudimos subir la foto. Intentá nuevamente.');
    const registered = await client.from('viento_sur_catalog_assets').insert({ path, uploaded_by: user.id });
    if (registered.error) {
      await client.storage.from(BUCKET).remove([path]);
      throw new HttpError(503, 'No pudimos guardar la foto. Intentá nuevamente.');
    }
    return Response.json({ path, src: client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl });
  } catch (e) { return errorResponse(e); }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const { user } = await requireAdmin();
    const body = await request.json();
    if (!Array.isArray(body.paths) || body.paths.length > 10 || body.paths.some((p: unknown) => typeof p !== 'string' || !p.startsWith(`products/${user.id}/`))) throw new HttpError(400, 'Solicitud de imágenes inválida.');
    await cleanupAssets(body.paths);
    return Response.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
