import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { publicConfig } from './config';

export async function sessionClient() {
  const { url, key } = publicConfig();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: values => {
        // Middleware refreshes cookies when rendering a Server Component.
        try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* read-only render */ }
      },
    },
  });
}
export function publicClient() {
  const { url, key } = publicConfig();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) } });
}
export function storageClient() {
  const { url } = publicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Falta configurar el almacenamiento.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
