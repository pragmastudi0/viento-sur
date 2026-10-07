import { readFileSync } from 'node:fs';
/** Separate, ignored local credentials. Never fall back to a production env. */
export function loadLocalTestEnvironment() {
  const file = readFileSync('.env.test.local', 'utf8');
  for (const line of file.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:56321') throw new Error('Usá únicamente el Supabase local aislado en :56321 para las pruebas.');
}
