-- READ ONLY. Run in the real Supabase project's SQL Editor BEFORE the migration.
select category as legacy_category,
  case category when 'lampara-de-pie' then 'Lámparas de pie' when 'velador' then 'Veladores' else btrim(category) end as proposed_name,
  case category when 'lampara-de-pie' then 'lamparas-de-pie' when 'velador' then 'veladores'
    else coalesce(nullif(rtrim(left(btrim(regexp_replace(lower(regexp_replace(normalize(category, NFD), U&'[\0300-\036f]', '', 'g')), '[^a-z0-9]+', '-', 'g'), '-'),100),'-'),''),'categoria') end as proposed_slug_base,
  count(*) as total_products,
  count(*) filter (where deleted_at is null) as current_products,
  count(*) filter (where status = 'publicada' and deleted_at is null) as published_products
from public.viento_sur_products group by category order by category collate "C";
select count(*) as products_to_preserve from public.viento_sur_products;
select column_name, data_type, is_nullable from information_schema.columns
where table_schema = 'public' and table_name = 'viento_sur_products' order by ordinal_position;
select conname, pg_get_constraintdef(oid) as definition from pg_constraint
where conrelid = 'public.viento_sur_products'::regclass order by conname;
select policyname, roles, cmd, qual, with_check from pg_policies
where schemaname = 'public' and tablename = 'viento_sur_products';
select to_regclass('public.viento_sur_categories') as existing_categories,
  to_regclass('public.viento_sur_category_slugs') as existing_slug_registry;
