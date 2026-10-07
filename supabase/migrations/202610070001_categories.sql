-- Apply after reviewing categories-preflight.sql on the REAL target database.
-- Run the ENTIRE statement, from DO through the final dollar-quote.
-- One atomic statement; no temporary relations or cross-statement session state.
-- Repeatable; only Viento Sur objects are changed.
do $viento_sur_migration$
declare viento_sur_products_before jsonb;
begin
lock table public.viento_sur_products in access exclusive mode;

-- Refuse unexpected predecessor schemas and name collisions before changing anything.
do $$ begin
  if not exists (select 1 from pg_catalog.pg_trigger where tgrelid = 'public.viento_sur_products'::regclass
    and tgname = 'viento_sur_validate_catalog_product' and tgenabled = 'O')
    or not exists (select 1 from pg_catalog.pg_policy where polrelid = 'public.viento_sur_products'::regclass
      and polname = 'viento_sur_products_public_read' and polcmd = 'r') then
    raise exception 'Unexpected Viento Sur schema: inspect preflight; no migration performed';
  end if;
  if to_regclass('public.viento_sur_categories') is not null then
    if to_regclass('public.viento_sur_category_slugs') is null
      or to_regprocedure('public.viento_sur_register_category_slug()') is null
      or (select count(*) from information_schema.columns where table_schema='public' and table_name='viento_sur_categories'
        and ((column_name in ('id','name','slug','description') and data_type='text' and is_nullable='NO')
        or (column_name='legacy_key' and data_type='text')
        or (column_name='is_active' and data_type='boolean' and is_nullable='NO')
        or (column_name='sort_order' and data_type='integer' and is_nullable='NO')
        or (column_name in ('created_at','updated_at') and data_type='timestamp with time zone' and is_nullable='NO'))) <> 9
      or (select count(*) from pg_catalog.pg_constraint where conrelid='public.viento_sur_categories'::regclass and contype='c') < 5 then
      raise exception 'Unexpected categories schema: review existing objects before migrating';
    end if;
  elsif to_regclass('public.viento_sur_category_slugs') is not null then
    raise exception 'Unexpected slug registry without categories';
  end if;
end $$;

select coalesce(jsonb_agg(to_jsonb(p) - 'category_id' order by p.id), '[]'::jsonb)
  into viento_sur_products_before from public.viento_sur_products p;

create table if not exists public.viento_sur_categories (
  id text primary key default gen_random_uuid()::text check (id ~ '^[a-zA-Z0-9-]{1,120}$'),
  name text not null check (length(btrim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  description text not null default '' check (length(description) <= 5000),
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  legacy_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default clock_timestamp()
);
create table if not exists public.viento_sur_category_slugs (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  category_id text not null references public.viento_sur_categories(id) on delete cascade
);
create index if not exists viento_sur_category_slugs_category on public.viento_sur_category_slugs(category_id);
create index if not exists viento_sur_categories_order on public.viento_sur_categories(sort_order, id);
alter table public.viento_sur_categories enable row level security;
alter table public.viento_sur_category_slugs enable row level security;
revoke all on public.viento_sur_categories, public.viento_sur_category_slugs from anon, authenticated;
-- Metadata is readable for resolving inactive pages and old links; listings filter active.
grant select on public.viento_sur_categories, public.viento_sur_category_slugs to anon, authenticated;
grant insert (id, name, slug, description, is_active, sort_order) on public.viento_sur_categories to authenticated;
grant update (name, slug, description, is_active, sort_order) on public.viento_sur_categories to authenticated;
grant delete on public.viento_sur_categories to authenticated;
grant all on public.viento_sur_categories, public.viento_sur_category_slugs to service_role;
drop policy if exists viento_sur_categories_read on public.viento_sur_categories;
create policy viento_sur_categories_read on public.viento_sur_categories for select to anon, authenticated using (true);
drop policy if exists viento_sur_categories_admin_insert on public.viento_sur_categories;
create policy viento_sur_categories_admin_insert on public.viento_sur_categories for insert to authenticated with check (public.viento_sur_is_catalog_admin());
drop policy if exists viento_sur_categories_admin_update on public.viento_sur_categories;
create policy viento_sur_categories_admin_update on public.viento_sur_categories for update to authenticated using (public.viento_sur_is_catalog_admin()) with check (public.viento_sur_is_catalog_admin());
drop policy if exists viento_sur_categories_admin_delete on public.viento_sur_categories;
create policy viento_sur_categories_admin_delete on public.viento_sur_categories for delete to authenticated using (public.viento_sur_is_catalog_admin());
drop policy if exists viento_sur_category_slugs_read on public.viento_sur_category_slugs;
create policy viento_sur_category_slugs_read on public.viento_sur_category_slugs for select to anon, authenticated using (true);

create or replace function public.viento_sur_validate_category() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id or new.created_at <> old.created_at or new.legacy_key is distinct from old.legacy_key then
      raise exception 'Category identity is immutable' using errcode = '23514';
    end if;
    new.updated_at := clock_timestamp();
  end if;
  return new;
end $$;
revoke all on function public.viento_sur_validate_category() from public;
drop trigger if exists viento_sur_validate_category on public.viento_sur_categories;
create trigger viento_sur_validate_category before update on public.viento_sur_categories
for each row execute function public.viento_sur_validate_category();

create or replace function public.viento_sur_register_category_slug() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.viento_sur_category_slugs(slug, category_id) values(new.slug, new.id) on conflict (slug) do nothing;
  if not exists (select 1 from public.viento_sur_category_slugs where slug = new.slug and category_id = new.id) then
    raise exception 'Category slug is reserved' using errcode = '23505';
  end if;
  return new;
end $$;
revoke all on function public.viento_sur_register_category_slug() from public;
drop trigger if exists viento_sur_register_category_slug on public.viento_sur_categories;
create trigger viento_sur_register_category_slug after insert or update of slug on public.viento_sur_categories
for each row execute function public.viento_sur_register_category_slug();

-- Match the client normalization without installing a shared extension.
create or replace function public.viento_sur_category_slugify(value text) returns text
language sql immutable set search_path = '' as $$
  select coalesce(nullif(rtrim(left(btrim(regexp_replace(lower(regexp_replace(normalize(value, NFD), U&'[\0300-\036f]', '', 'g')), '[^a-z0-9]+', '-', 'g'), '-'), 100), '-'), ''), 'categoria');
$$;
revoke all on function public.viento_sur_category_slugify(text) from public;

do $$
declare item record; base text; chosen text; candidate_name text; n integer; position integer := 0;
begin
  if exists (select 1 from public.viento_sur_products where category is null or length(btrim(category)) = 0 or length(btrim(category)) > 120) then
    raise exception 'Invalid legacy categories: review the preflight before migrating';
  end if;
  for item in select category from public.viento_sur_products group by category
    order by category collate "C" loop
    position := position + 1;
    if exists (select 1 from public.viento_sur_categories where legacy_key = item.category)
      or exists (select 1 from public.viento_sur_categories where id = item.category) then continue; end if;
    candidate_name := case item.category when 'lampara-de-pie' then 'Lámparas de pie' when 'velador' then 'Veladores' else btrim(item.category) end;
    base := case item.category when 'lampara-de-pie' then 'lamparas-de-pie' when 'velador' then 'veladores' else public.viento_sur_category_slugify(item.category) end;
    chosen := base; n := 1;
    while exists (select 1 from public.viento_sur_category_slugs where slug = chosen)
      or exists (select 1 from public.viento_sur_categories where slug = chosen) loop
      n := n + 1; chosen := base || '-' || n::text;
    end loop;
    insert into public.viento_sur_categories(name, slug, legacy_key, sort_order, description)
    values (candidate_name, chosen, item.category, position,
      case item.category when 'lampara-de-pie' then 'Lámparas de pie de diseño Viento Sur: estructuras de hierro y pantallas que difunden una luz blanca cálida, ideales para acompañar sillones y rincones de lectura.'
      when 'velador' then 'Veladores de diseño Viento Sur: lámparas de mesa con base de hierro y luz blanca cálida, perfectas para mesas de luz, escritorios y ambientes íntimos.' else '' end);
  end loop;
end $$;

alter table public.viento_sur_products add column if not exists category_id text;
alter table public.viento_sur_products disable trigger viento_sur_validate_catalog_product;
-- A repeated migration must not overwrite subsequent assignments or timestamps.
update public.viento_sur_products p set category_id = c.id from public.viento_sur_categories c
  where p.category_id is null and (c.legacy_key = p.category or (c.legacy_key is null and c.id = p.category));
alter table public.viento_sur_products enable trigger viento_sur_validate_catalog_product;
if viento_sur_products_before is distinct from
  (select coalesce(jsonb_agg(to_jsonb(p) - 'category_id' order by p.id), '[]'::jsonb)
    from public.viento_sur_products p) then
  raise exception 'Product data changed; migration rolled back';
end if;
do $$ begin
  if exists (select 1 from public.viento_sur_products where category_id is null) then raise exception 'Unmapped products; migration rolled back'; end if;
  if not exists (select 1 from pg_catalog.pg_constraint where conname = 'viento_sur_products_category_id_fkey' and conrelid = 'public.viento_sur_products'::regclass) then
    alter table public.viento_sur_products add constraint viento_sur_products_category_id_fkey
      foreign key (category_id) references public.viento_sur_categories(id) on delete restrict;
  end if;
end $$;
alter table public.viento_sur_products alter column category_id set not null;
create index if not exists viento_sur_products_category_id on public.viento_sur_products(category_id);
alter table public.viento_sur_products drop constraint if exists viento_sur_products_category_check;

create or replace function public.viento_sur_sync_product_category() returns trigger
language plpgsql security definer set search_path = '' as $$
declare target public.viento_sur_categories; assigning boolean; legacy_changed boolean;
begin
  legacy_changed := tg_op = 'UPDATE' and new.category is distinct from old.category;
  if new.category_id is null or (tg_op = 'UPDATE' and legacy_changed and new.category_id is not distinct from old.category_id) then
    select * into target from public.viento_sur_categories where legacy_key = new.category or (legacy_key is null and id = new.category) for share;
  else
    select * into target from public.viento_sur_categories where id = new.category_id for share;
    if legacy_changed and new.category is distinct from coalesce(target.legacy_key, target.id) then
      raise exception 'Conflicting category references' using errcode = '23514';
    end if;
  end if;
  if target.id is null then raise exception 'Category does not exist' using errcode = '23503'; end if;
  assigning := tg_op = 'INSERT' or target.id is distinct from old.category_id;
  if assigning and not target.is_active then raise exception 'Category is inactive' using errcode = '23514'; end if;
  new.category_id := target.id; new.category := coalesce(target.legacy_key, target.id);
  return new;
end $$;
revoke all on function public.viento_sur_sync_product_category() from public;
drop trigger if exists viento_sur_sync_product_category on public.viento_sur_products;
create trigger viento_sur_sync_product_category before insert or update on public.viento_sur_products
for each row execute function public.viento_sur_sync_product_category();

alter policy viento_sur_products_public_read on public.viento_sur_products
using (status = 'publicada' and deleted_at is null and exists
  (select 1 from public.viento_sur_categories c where c.id = category_id and c.is_active));
end
$viento_sur_migration$;
