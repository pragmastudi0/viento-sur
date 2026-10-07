import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
loadEnvConfig(process.cwd());
export function operatorClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Configurá Supabase en .env.local antes de continuar.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
