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
  await page.getByLabel('Categoría *', { exact: true }).selectOption({ label: 'Veladores' });
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

test('administra categorías dinámicas, alias, orden y visibilidad pública', async ({ page, request }, info) => {
  let categoryId: string | undefined;
  let emptyId: string | undefined;
  const suffix = randomUUID().slice(0, 8), name = `Lámparas de Mesa ${suffix}`, edited = `Colección Mesa ${suffix}`;
  const productName = `Mesa dinámica ${suffix}`;
  try {
    await login(page);
    await page.getByRole('link', { name: 'Categorías', exact: true }).click();
    await page.getByRole('link', { name: 'Crear categoría' }).click();
    await page.getByLabel('Nombre *', { exact: true }).fill(name);
    const oldSlug = `lamparas-de-mesa-${suffix}`;
    await expect(page.getByLabel('Slug *', { exact: true })).toHaveValue(oldSlug);
    await page.getByLabel('Descripción', { exact: true }).fill('Lámparas de mesa creadas desde el administrador.');
    await page.getByLabel('Orden *', { exact: true }).fill('0');
    await page.getByRole('button', { name: 'Guardar categoría' }).click();
    await expect(page.getByText('✓ Categoría creada correctamente')).toBeVisible();
    let c = (await root.from('viento_sur_categories').select('*').eq('slug', oldSlug).single()).data;
    categoryId = c.id;
    const visibleCategory = () => page.locator('tr, article').filter({ hasText: edited }).filter({ visible: true });
    await page.goto(`/admin/categorias/${categoryId}/editar`);
    await page.getByLabel('Nombre *', { exact: true }).fill(edited);
    await expect(page.getByLabel('Slug *', { exact: true })).toHaveValue(oldSlug);
    const newSlug = `mesa-${suffix}`;
    await page.getByLabel('Slug *', { exact: true }).fill(newSlug);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Guardar categoría' }).click();
    await expect(page.getByText('✓ Categoría editada correctamente')).toBeVisible();
    await page.screenshot({ path: `test-results/categories-${info.project.name}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const alias = await request.get(`/categorias/${oldSlug}`, { maxRedirects: 0 });
    expect(alias.status()).toBe(308); expect(alias.headers().location).toBe(`/categorias/${newSlug}`);
    await page.goto('/catalogo');
    const filters = page.getByRole('navigation', { name: 'Filtrar por categoría' });
    await expect(filters.getByRole('link').nth(1)).toHaveText(edited);
    await page.goto('/admin/nueva');
    await page.getByLabel('Nombre *', { exact: true }).fill(productName);
    await page.getByLabel('Precio en pesos *', { exact: true }).fill('85.000');
    await page.getByLabel('Categoría *', { exact: true }).selectOption(categoryId!);
    await page.locator('#lamp-image').setInputFiles(await photo());
    await page.getByRole('button', { name: 'Guardar lámpara' }).click();
    await expect(page.getByText('✓ Lámpara agregada correctamente')).toBeVisible();
    const p = (await root.from('viento_sur_products').select('*').eq('name', productName).single()).data;
    await page.goto(`/categorias/${newSlug}`); await expect(page.getByRole('heading', { name: productName, exact: true })).toBeVisible();
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toContain(`/categorias/${newSlug}`);
    await page.goto(`/productos/${p.slug}`);
    const inquiry = await page.getByRole('link', { name: 'Consultar por este modelo' }).getAttribute('href');
    expect(decodeURIComponent(inquiry!)).toContain(productName);
    await page.getByRole('button', { name: 'Agregar al carrito', exact: true }).click();
    await page.getByRole('button', { name: /Abrir carrito/ }).click();
    await page.getByRole('button', { name: 'Continuar pedido', exact: true }).click();
    const order = page.getByRole('dialog', { name: 'Completá tu pedido' });
    await order.getByLabel('Nombre *', { exact: true }).fill('Cliente prueba');
    // Capture the prepared order without navigating to or sending anything through WhatsApp.
    await page.evaluate(() => {
      const probe: { url?: string; closed?: boolean } = {};
      Object.assign(window, { orderProbe: probe });
      window.open = () => ({ opener: null, location: { get href() { return probe.url || ''; }, set href(value: string) { probe.url = value; } }, close() { probe.closed = true; } } as unknown as Window);
    });
    await order.getByRole('button', { name: 'Enviar pedido por WhatsApp', exact: true }).click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { orderProbe: { url?: string } }).orderProbe.url)).toContain('wa.me/');
    const prepared = await page.evaluate(() => (window as unknown as { orderProbe: { url: string } }).orderProbe.url);
    expect(decodeURIComponent(prepared)).toContain(productName); expect(decodeURIComponent(prepared)).toContain('$85.000');
    await page.getByRole('button', { name: 'Cerrar carrito', exact: true }).click();
    await page.goto('/admin/categorias');
    await visibleCategory().getByRole('button', { name: 'Eliminar', exact: true }).click();
    await expect(page.getByRole('main').getByRole('alert')).toContainText('1 producto asociado');
    c = (await root.from('viento_sur_categories').select('*').eq('id', categoryId!).single()).data;
    const headers = { Origin: 'http://127.0.0.1:3005' };
    const blocked = await page.request.delete(`/api/admin/categories/${categoryId}`, { headers, data: { updatedAt: c.updated_at } });
    expect(blocked.status()).toBe(409); expect(await blocked.text()).toContain('no puede eliminarse');
    page.once('dialog', dialog => dialog.accept());
    await visibleCategory().getByRole('button', { name: 'Desactivar', exact: true }).click();
    await expect(page.getByText('✓ Categoría desactivada correctamente')).toBeVisible();
    await page.goto('/catalogo');
    await expect(page.getByRole('heading', { name: productName, exact: true })).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Filtrar por categoría' }).getByRole('link', { name: edited, exact: true })).toHaveCount(0);
    expect((await request.get(`/productos/${p.slug}`)).status()).toBe(404);
    expect((await (await request.post('/api/catalogo/carrito', { data: { ids: [p.id] } })).json()).products).toEqual([]);
    // Existing cart is reconciled by the same verification used before ordering.
    await page.getByRole('button', { name: /Abrir carrito/ }).click(); await page.getByRole('button', { name: 'Continuar pedido', exact: true }).click();
    await page.getByRole('dialog', { name: 'Completá tu pedido' }).getByLabel('Nombre *', { exact: true }).fill('Cliente prueba');
    await page.evaluate(() => { window.open = () => ({ opener: null, close() {} } as unknown as Window); });
    await page.getByRole('button', { name: 'Enviar pedido por WhatsApp', exact: true }).click();
    await expect(page.getByText('Tu carrito está vacío', { exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Cerrar carrito', exact: true }).click();

    const inactive = await request.get(`/categorias/${newSlug}`); expect(inactive.status()).toBe(200);
    const inactiveHtml = await inactive.text(); expect(inactiveHtml).toContain('noindex'); expect(inactiveHtml).toContain('no está disponible');
    expect(await (await request.get('/sitemap.xml')).text()).not.toContain(`/categorias/${newSlug}`);
    await page.goto(`/admin/${p.id}/editar`); await expect(page.getByLabel('Categoría *', { exact: true })).toHaveValue(categoryId!);
    await page.goto('/admin/nueva'); expect(await page.getByLabel('Categoría *', { exact: true }).locator(`option[value="${categoryId}"]`).count()).toBe(0);
    await page.goto('/admin/categorias'); await visibleCategory().getByRole('button', { name: 'Activar', exact: true }).click();
    await expect(page.getByText('✓ Categoría activada correctamente')).toBeVisible();
    await page.goto('/catalogo'); await expect(page.getByRole('heading', { name: productName, exact: true })).toBeVisible();
    // Empty category: cancel deletion, then confirm it.
    await page.goto('/admin/categorias/nueva');
    const emptyName = `Vacía ${suffix}`; await page.getByLabel('Nombre *', { exact: true }).fill(emptyName);
    await page.getByRole('button', { name: 'Guardar categoría' }).click(); await expect(page.getByText('✓ Categoría creada correctamente')).toBeVisible();
    emptyId = (await root.from('viento_sur_categories').select('id').eq('name', emptyName).single()).data!.id;
    const emptyRow = () => page.locator('tr, article').filter({ hasText: emptyName }).filter({ visible: true });
    page.once('dialog', dialog => dialog.dismiss()); await emptyRow().getByRole('button', { name: 'Eliminar', exact: true }).click(); await expect(emptyRow()).toBeVisible();
    page.once('dialog', dialog => dialog.accept()); await emptyRow().getByRole('button', { name: 'Eliminar', exact: true }).click(); await expect(page.getByText('✓ Categoría eliminada correctamente')).toBeVisible(); await expect(emptyRow()).toHaveCount(0);
  } finally {
    const deleted = await root.from('viento_sur_products').delete().eq('name', productName); if (deleted.error) throw deleted.error;
    for (const id of [categoryId, emptyId].filter(Boolean)) { const result = await root.from('viento_sur_categories').delete().eq('id', id!); if (result.error) throw result.error; }
  }
});

test('protege APIs de categorías y conserva datos ante errores', async ({ page, request }) => {
  const headers = { Origin: 'http://127.0.0.1:3005' }, id = randomUUID();
  await page.goto('/admin/categorias'); await expect(page).toHaveURL(/\/admin\/login/);
  expect((await request.get('/api/admin/categories')).status()).toBe(401);
  for (const method of ['post', 'patch', 'delete'] as const) {
    expect((await request[method](method === 'post' ? '/api/admin/categories' : `/api/admin/categories/${id}`, { headers, data: {} })).status()).toBe(401);
  }
  await login(page);
  expect((await page.request.post('/api/admin/categories', { headers: { Origin: 'https://evil.example' }, data: {} })).status()).toBe(403);
  expect((await page.request.post('/api/admin/categories', { headers, data: { id, name: '', slug: '../evil', description: '', isActive: true, sortOrder: -1 } })).status()).toBe(400);
  await page.goto('/admin/categorias/nueva'); await page.getByLabel('Nombre *', { exact: true }).fill('Conexión interrumpida');
  await page.route('**/api/admin/categories', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'No pudimos completar la operación. Intentá nuevamente.' }) }));
  await page.getByRole('button', { name: 'Guardar categoría' }).click(); await expect(page.getByRole('main').getByRole('alert')).toContainText('Intentá nuevamente'); await expect(page.getByLabel('Nombre *', { exact: true })).toHaveValue('Conexión interrumpida');
  await page.unroute('**/api/admin/categories');
  await root.from('viento_sur_catalog_admins').delete().eq('user_id', userId);
  expect((await page.request.post('/api/admin/categories', { headers, data: {} })).status()).toBe(403);
  expect((await page.request.patch(`/api/admin/categories/${id}`, { headers, data: {} })).status()).toBe(403);
  expect((await page.request.delete(`/api/admin/categories/${id}`, { headers, data: {} })).status()).toBe(403);
});
