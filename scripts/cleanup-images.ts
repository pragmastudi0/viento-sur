import { operatorClient } from './env';
import { BUCKET } from '../lib/catalog-validation';
async function main() {
  const client = operatorClient();
  const before = new Date(Date.now() - 86400000).toISOString();
  const allPaths: string[] = [];
  async function walk(prefix: string) {
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await client.storage.from(BUCKET).list(prefix, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
      if (error) throw error;
      for (const item of data) {
        const path = `${prefix}/${item.name}`;
        if (!item.id) await walk(path);
        else if (item.created_at && item.created_at < before) allPaths.push(path);
      }
      if (data.length < 100) break;
    }
  }
  await walk('products');
  for (let i = 0; i < allPaths.length; i += 100) {
    const paths = allPaths.slice(i, i + 100);
    const pruned = await client.rpc('prune_catalog_assets', { p_paths: paths, p_before: before });
    if (pruned.error) throw pruned.error;
    const remaining = await client.from('catalog_assets').select('path').in('path', paths);
    if (remaining.error) throw remaining.error;
    const registered = new Set(remaining.data.map(a => a.path));
    const orphans = paths.filter(p => !registered.has(p));
    if (orphans.length) {
      const result = await client.storage.from(BUCKET).remove(orphans);
      if (result.error) throw result.error;
      console.log(`${orphans.length} fotos huérfanas eliminadas.`);
    }
  }
  console.log('Reconciliación terminada. Las fotos referenciadas se conservaron.');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
