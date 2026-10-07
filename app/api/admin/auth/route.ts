import { z } from 'zod';
import { checkOrigin, errorResponse, HttpError, readJson, requireAdmin } from '@/lib/admin';
import { sessionClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const schema = z.object({ mode: z.enum(['login', 'reset', 'password']), email: z.string().max(254), password: z.string().max(128) }).strict();
    const parsed = schema.safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, 'Revisá tus datos de acceso.');
    const { mode, email, password } = parsed.data;
    const client = await sessionClient();
    if (mode === 'password') {
      await requireAdmin();
      if (password.length < 12) throw new HttpError(400, 'Usá una contraseña de al menos 12 caracteres.');
      const { error } = await client.auth.updateUser({ password });
      if (error) throw new HttpError(400, 'No pudimos actualizar la contraseña. Pedí un enlace nuevo e intentá nuevamente.');
    } else {
      if (!z.string().email().safeParse(email).success) throw new HttpError(400, 'Ingresá un email válido.');
      if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${process.env.SITE_URL || new URL(request.url).origin}/admin/auth/confirm` });
        if (error) throw new HttpError(429, 'No pudimos enviar el enlace. Esperá un momento e intentá nuevamente.');
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw new HttpError(error.status === 429 ? 429 : 401, 'No pudimos iniciar sesión. Revisá el email y la contraseña o intentá más tarde.');
        const permission = await client.rpc('is_catalog_admin');
        if (permission.error || !permission.data) {
          await client.auth.signOut();
          throw new HttpError(403, 'Esta cuenta no tiene acceso al administrador.');
        }
      }
    }
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return errorResponse(e); }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const client = await sessionClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
