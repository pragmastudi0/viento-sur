import { test, expect, type Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
if (url !== 'http://127.0.0.1:56321') throw new Error('E2E requiere Supabase local aislado; no se ejecuta sobre producción.');
const root = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
let userId: string; let email: string; let password: string;
test.beforeEach(async () => {
  email = `e2e-${randomUUID()}@example.test`; password = `Test-${randomUUID()}`;
  const { data, error } = await root.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error; userId = data.user!.id;
  const authorized = await root.from('viento_sur_catalog_admins').insert({ user_id: userId }); if (authorized.error) throw authorized.error;
});
test.afterEach(async () => {
  if (!userId) return;
  const assets = await root.from('viento_sur_catalog_assets').select('path').eq('uploaded_by', userId);
  for (const asset of assets.data || []) {
    // JSONB containment must use JSON, not the SDK's PostgreSQL array encoding.
    const removed = await root.from('viento_sur_products').delete().contains('images', JSON.stringify([{ path: asset.path }]));
    if (removed.error) throw removed.error;
  }
  const paths = (assets.data || []).map(a => a.path);
  if (paths.length) { await root.from('viento_sur_catalog_assets').delete().in('path', paths); await root.storage.from('viento_sur_catalogo').remove(paths); }
  await root.auth.admin.deleteUser(userId);
});
async function photo(color = '#332D52') {
  return { name: 'foto.jpg', mimeType: 'image/jpeg', buffer: await sharp({ create: { width: 600, height: 800, channels: 3, background: color } }).jpeg().toBuffer() };
}
async function login(page: Page) {
  await page.goto('/admin'); await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel('Email', { exact: true }).fill(email); await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click(); await expect(page.getByRole('heading', { name: 'Tus lámparas' })).toBeVisible();
}
test('flujo completo con persistencia, preview, reemplazo, publicación y eliminación', async ({ page }, info) => {
  await login(page);
  await expect(page.getByText('Lanin', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.screenshot({ path: `test-results/admin-${info.project.name}.png`, fullPage: true });
  await page.getByRole('link', { name: '+ Agregar lámpara' }).click();
  const name = `Lámpara Nórdica ${randomUUID().slice(0, 8)}`;
  await page.getByLabel('Nombre *', { exact: true }).fill(name);
  await page.getByLabel('Descripción', { exact: true }).fill('Lámpara de mesa de diseño nórdico.');
  await page.getByLabel('Precio en pesos *', { exact: true }).fill('85.000');
  await page.getByLabel('Categoría *', { exact: true }).selectOption('velador');
  await page.locator('#lamp-image').setInputFiles(await photo());
  await expect(page.getByAltText('Preview de foto 1')).toBeVisible();
  await page.screenshot({ path: `test-results/form-${info.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Guardar lámpara' }).click();
  await expect(page.getByText('✓ Lámpara agregada correctamente')).toBeVisible();
  let record = (await root.from('viento_sur_products').select('*').eq('name', name).single()).data;
  expect(record.price).toBe(85000);
  const slug = record.slug; const originalPath = record.images[0].path;
  await page.reload(); await expect(page.getByText(name, { exact: true }).filter({ visible: true })).toBeVisible();
  await page.goto('/catalogo'); await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.goto(`/productos/${slug}`); await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByText('$85.000', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Negro/ })).toBeVisible();
  await page.goto(`/admin/${record.id}/editar`);
  await page.getByLabel('Precio en pesos *', { exact: true }).fill('90.000');
  await page.getByRole('button', { name: 'Guardar lámpara' }).click(); await expect(page.getByText('✓ Lámpara editada correctamente')).toBeVisible();
  record = (await root.from('viento_sur_products').select('*').eq('id', record.id).single()).data;
  expect(record.images[0].path).toBe(originalPath); expect(record.slug).toBe(slug);
  await page.goto(`/admin/${record.id}/editar`);
  await page.getByLabel('Reemplazar foto 1').setInputFiles(await photo('#99A89D'));
  await page.getByRole('button', { name: 'Guardar lámpara' }).click(); await expect(page.getByText('✓ Lámpara editada correctamente')).toBeVisible();
  record = (await root.from('viento_sur_products').select('*').eq('id', record.id).single()).data;
  expect(record.images[0].path).not.toBe(originalPath);
  expect((await root.storage.from('viento_sur_catalogo').download(originalPath)).error).toBeTruthy();
  const visibleRow = () => page.locator('tr, article').filter({ hasText: name }).filter({ visible: true });
  await visibleRow().getByRole('button', { name: 'Ocultar', exact: true }).click(); await expect(page.getByText('✓ Lámpara oculta correctamente')).toBeVisible();
  await page.goto('/catalogo'); await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
  const hidden = await page.request.get(`/productos/${slug}`); expect(hidden.status()).toBe(404);
  await page.goto('/admin'); await visibleRow().getByRole('button', { name: 'Publicar', exact: true }).click(); await expect(page.getByText('✓ Lámpara publicada correctamente')).toBeVisible();
  await page.goto('/catalogo'); await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.goto('/admin'); await visibleRow().getByRole('button', { name: 'Eliminar', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click(); await expect(visibleRow()).toBeVisible();
  await visibleRow().getByRole('button', { name: 'Eliminar', exact: true }).click(); await page.getByRole('dialog').getByRole('button', { name: 'Eliminar lámpara' }).click();
  await expect(page.getByText('✓ Lámpara eliminada correctamente')).toBeVisible();
  await expect(visibleRow()).toHaveCount(0); expect((await root.from('viento_sur_products').select('deleted_at').eq('id', record.id).single()).data?.deleted_at).toBeTruthy();
  await page.goto('/catalogo'); await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('rechaza formatos y conserva formulario cuando falla la subida', async ({ page }) => {
  await login(page); await page.goto('/admin/nueva');
  await page.getByLabel('Nombre *', { exact: true }).fill('Foto de prueba');
  await page.getByLabel('Precio en pesos *', { exact: true }).fill('85.000');
  await page.locator('#lamp-image').setInputFiles({ name: 'foto.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Elegí JPG');
  await page.locator('#lamp-image').setInputFiles(await photo());
  await page.route('**/api/admin/images', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'No pudimos subir la foto. Intentá nuevamente.' }) }));
  await page.getByRole('button', { name: 'Guardar lámpara' }).click(); await expect(page.getByRole('main').getByRole('alert')).toContainText('No pudimos subir');
  await expect(page.getByLabel('Nombre *', { exact: true })).toHaveValue('Foto de prueba');
  await expect(page.getByAltText('Preview de foto 1')).toBeVisible();
  expect((await root.from('viento_sur_products').select('id').eq('name', 'Foto de prueba')).data).toEqual([]);
});
test('protege endpoints, sesión, origen y cuentas sin permisos', async ({ page, request }) => {
  await page.goto('/admin'); await expect(page).toHaveURL(/\/admin\/login/);
  const headers = { Origin: 'http://127.0.0.1:3005' };
  for (const path of ['/api/admin/products', '/api/admin/images']) {
    const result = await request.post(path, { headers, data: {} }); expect(result.status()).toBe(401);
  }
  await login(page);
  expect((await page.request.post('/api/admin/products', { headers: { Origin: 'https://evil.example' }, data: {} })).status()).toBe(403);
  expect((await page.request.post('/api/admin/products', { headers, data: { name: 'hack', price: -1 } })).status()).toBe(400);
  const spoofed = await page.request.post('/api/admin/images', { headers, multipart: { file: { name: 'fake.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('script') } } }); expect(spoofed.status()).toBe(400);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click(); await expect(page).toHaveURL(/\/admin\/login/);
  await root.from('viento_sur_catalog_admins').delete().eq('user_id', userId);
  await page.getByLabel('Email', { exact: true }).fill(email); await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click(); await expect(page.getByRole('main').getByRole('alert')).toContainText('no tiene acceso');
});
test('mantiene galerías, categorías y sitemap de las lámparas migradas', async ({ page, request }) => {
  await page.goto('/catalogo');
  for (const name of ['Lanin', 'Lanin XL', 'Traful', 'Piedra Mora', 'Manly', 'Kids']) await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await page.goto('/veladores'); await expect(page.getByRole('heading', { name: 'Manly', exact: true })).toBeVisible(); await expect(page.getByRole('heading', { name: 'Lanin', exact: true })).toHaveCount(0);
  await page.goto('/productos/lanin'); await expect(page.getByRole('button', { name: 'Ver imagen 2' })).toBeVisible(); await page.getByRole('button', { name: 'Ver imagen 2' }).click();
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toContain('/productos/lanin');
  const sitemap = await request.get('/sitemap.xml'); expect(await sitemap.text()).toContain('/productos/lanin'); expect(await sitemap.text()).not.toContain('/admin');
});
test('recupera contraseña con un token de un solo uso', async ({ page }) => {
  const { data, error } = await root.auth.admin.generateLink({ type: 'recovery', email }); if (error) throw error;
  await page.goto(`/admin/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery`);
  await expect(page.getByRole('heading', { name: 'Elegí tu contraseña' })).toBeVisible();
  await page.getByLabel('Contraseña', { exact: true }).fill(`New-${randomUUID()}`);
  await page.getByRole('button', { name: 'Guardar contraseña' }).click(); await expect(page.getByRole('heading', { name: 'Tus lámparas' })).toBeVisible();
});
