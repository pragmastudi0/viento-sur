import { operatorClient } from './env';
async function main() {
  const email = process.argv[2];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Uso: npm run admin:invite -- email-del-dueño');
  const client = operatorClient();
  let user;
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (user || data.users.length < 100) break;
  }
  if (!user) {
    const { data, error } = await client.auth.admin.inviteUserByEmail(email, { redirectTo: `${process.env.SITE_URL || 'http://127.0.0.1:3000'}/admin/auth/confirm` });
    if (error) throw error;
    user = data.user;
  }
  if (!user) throw new Error('No se pudo provisionar la cuenta.');
  const { error } = await client.from('catalog_admins').upsert({ user_id: user.id });
  if (error) throw error;
  console.log('Cuenta autorizada. Si es nueva, recibirá un enlace para elegir su contraseña.');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
