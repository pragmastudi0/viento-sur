import 'server-only';
import { redirect } from 'next/navigation';
import { sessionClient } from './supabase/server';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function requireAdmin() {
  const client = await sessionClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new HttpError(401, 'Tu sesión terminó. Volvé a iniciar sesión.');
  const { data, error: permissionError } = await client.rpc('is_catalog_admin');
  if (permissionError) throw new HttpError(503, 'No pudimos verificar tu acceso. Intentá nuevamente.');
  if (!data) throw new HttpError(403, 'Esta cuenta no tiene acceso al administrador.');
  return { client, user };
}
export async function requireAdminPage() {
  try { return await requireAdmin(); }
  catch (e) {
    if (e instanceof HttpError && (e.status === 401 || e.status === 403)) redirect('/admin/login');
    throw e;
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(process.env.SITE_URL || request.url).origin;
  if (!origin || origin !== expected) throw new HttpError(403, 'Solicitud no permitida.');
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  console.error('catalog operation failed', error instanceof Error ? error.message : error);
  return Response.json({ error: 'No pudimos completar la operación. Intentá nuevamente.' }, { status: 503 });
}
export async function readJson(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > 32000) throw new HttpError(413, 'Los datos son demasiado extensos.');
  const text = await request.text();
  if (text.length > 32000) throw new HttpError(413, 'Los datos son demasiado extensos.');
  try { return JSON.parse(text); } catch { throw new HttpError(400, 'Revisá los datos del formulario.'); }
}
