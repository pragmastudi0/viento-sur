import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
// Real SQL runs exclusively in this project's local container, always rolled back.
if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:56321') throw new Error('Migración: solo entorno local aislado.');
function sql(input: string) {
  const result = spawnSync('docker', ['exec', '-i', 'supabase_db_viento-sur', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-qAt'], { input, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'No se pudo ejecutar SQL local.');
  return result.stdout;
}
const source = readFileSync('supabase/migrations/202610070001_categories.sql', 'utf8');
const migration = source.replace(/^begin;$/m, '').replace(/^commit;$/m, '');
describe('Migración SQL conservadora', () => {
  it('es repetible y conserva todos los campos de productos', () => {
    const before = sql("select md5(coalesce(jsonb_agg(to_jsonb(p) order by id)::text,'')) from public.viento_sur_products p;");
    sql(`begin; ${migration} drop table pg_temp.viento_sur_categories_before; ${migration} rollback;`);
    expect(sql("select md5(coalesce(jsonb_agg(to_jsonb(p) order by id)::text,'')) from public.viento_sur_products p;")).toBe(before);
  });
  it('migra esquema anterior, categorías no conocidas, colisiones y soft deletes sin perder campos', () => {
    const result = sql(`begin;
      drop trigger viento_sur_sync_product_category on public.viento_sur_products;
      drop table public.viento_sur_category_slugs;
      drop table public.viento_sur_categories cascade;
      alter table public.viento_sur_products drop column category_id;
      create policy viento_sur_products_public_read on public.viento_sur_products for select to anon, authenticated using (status = 'publicada' and deleted_at is null);
      insert into public.viento_sur_products(id,slug,name,description,price,category,status,images,specifications,featured,created_at,updated_at,deleted_at)
        select 'migration-extra-a','migration-extra-a','Extra A',description,price,'Café Luz','oculta',images,specifications,false,created_at,updated_at,now() from public.viento_sur_products where id='lanin';
      insert into public.viento_sur_products(id,slug,name,description,price,category,status,images,specifications,featured,created_at,updated_at)
        select 'migration-extra-b','migration-extra-b','Extra B',description,price,'Cafe Luz','publicada',images,specifications,false,created_at,updated_at from public.viento_sur_products where id='lanin';
      create temporary table viento_sur_test_unrelated(id text primary key, payload text);
      insert into viento_sur_test_unrelated values ('other-app','untouched');
      ${migration}
      select count(*) from public.viento_sur_products where category_id is not null;
      select string_agg(slug,',' order by slug) from public.viento_sur_categories where legacy_key in ('Cafe Luz','Café Luz');
      select payload from viento_sur_test_unrelated;
      rollback;`);
    expect(result).toContain('8\n'); expect(result).toContain('cafe-luz,cafe-luz-2'); expect(result).toContain('untouched');
  });
});
