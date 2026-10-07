import { z } from 'zod';
import { getPublishedProducts } from '@/lib/catalog';
import { errorResponse, HttpError, readJson } from '@/lib/admin';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const parsed = z.object({ ids: z.array(z.string().max(120)).max(100) }).strict().safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, 'Revisá los productos del carrito.');
    const products = await getPublishedProducts();
    return Response.json({ products: products.filter(p => parsed.data.ids.includes(p.id)) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return errorResponse(e); }
}
