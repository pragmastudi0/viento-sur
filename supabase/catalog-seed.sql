-- Ejecutar DESPUÉS de 202610060001_catalog.sql y de subir las nueve fotos WebP.
-- Ver README: las fotos se pueden preparar con npm run catalog:photos.
-- Repetible: no sobrescribe lámparas existentes.
begin;

do $$ begin
  if exists (select 1 from (values ('lanin', 'products/legacy/lanin-1.webp'),
('lanin', 'products/legacy/lanin-2.webp'),
('lanin-xl', 'products/legacy/lanin-xl-1.webp'),
('traful', 'products/legacy/traful-1.webp'),
('traful', 'products/legacy/traful-2.webp'),
('piedra-mora', 'products/legacy/piedra-mora-1.webp'),
('piedra-mora', 'products/legacy/piedra-mora-2.webp'),
('manly', 'products/legacy/manly-1.webp'),
('kids', 'products/legacy/kids-1.webp')) as expected(product_id, path)
    where not exists (select 1 from public.products where id = expected.product_id)
    and not exists (select 1 from storage.objects where bucket_id = 'catalogo' and name = expected.path)) then
    raise exception 'Primero subí las fotos de las lámparas nuevas al bucket catalogo en products/legacy. No se publicó ninguna lámpara.';
  end if;
end $$;

insert into public.catalog_assets (path)
select distinct expected.path from (values ('lanin', 'products/legacy/lanin-1.webp'),
('lanin', 'products/legacy/lanin-2.webp'),
('lanin-xl', 'products/legacy/lanin-xl-1.webp'),
('traful', 'products/legacy/traful-1.webp'),
('traful', 'products/legacy/traful-2.webp'),
('piedra-mora', 'products/legacy/piedra-mora-1.webp'),
('piedra-mora', 'products/legacy/piedra-mora-2.webp'),
('manly', 'products/legacy/manly-1.webp'),
('kids', 'products/legacy/kids-1.webp')) as expected(product_id, path)
where not exists (select 1 from public.products where id = expected.product_id)
on conflict (path) do nothing;

insert into public.products (id, slug, name, description, price, category, images, specifications, featured, status)
select 'lanin', 'lanin', 'Lanin', 'Una lámpara de pie de brazo curvo que se inclina sobre el ambiente. Su base de hierro redonda y su pantalla impresa en PLA difunden una luz blanca cálida, ideal para acompañar un sillón o un rincón de lectura.', 78000, 'lampara-de-pie', '[{"path":"products/legacy/lanin-1.webp","alt":"Lámpara de pie Lanin de brazo curvo junto a un sillón de madera"},{"path":"products/legacy/lanin-2.webp","alt":"Detalle de la pantalla cónica de la lámpara Lanin con luz cálida"}]'::jsonb, array['Base de hierro redonda', 'Pantalla plástica PLA', 'Luz blanca cálida', 'Altura 1,7 m']::text[], true, 'publicada'
where not exists (select 1 from public.products where id = 'lanin')
on conflict (id) do nothing;

insert into public.products (id, slug, name, description, price, category, images, specifications, featured, status)
select 'lanin-xl', 'lanin-xl', 'Lanin XL', 'La versión de mayor presencia de nuestra Lanin. Su pantalla más amplia envuelve la luz y la reparte con suavidad sobre el espacio.', 105000, 'lampara-de-pie', '[{"path":"products/legacy/lanin-xl-1.webp","alt":"Lámpara de pie Lanin XL con pantalla amplia sobre un sillón"}]'::jsonb, array['Pantalla de 27 cm de ancho', 'Pantalla de 27 cm de alto']::text[], true, 'publicada'
where not exists (select 1 from public.products where id = 'lanin-xl')
on conflict (id) do nothing;

insert into public.products (id, slug, name, description, price, category, images, specifications, featured, status)
select 'traful', 'traful', 'Traful', 'Línea estilizada y pantalla acanalada que filtra la luz en un resplandor cálido. Su base de hierro rectangular le da estabilidad y un perfil sereno.', 72000, 'lampara-de-pie', '[{"path":"products/legacy/traful-1.webp","alt":"Lámpara de pie Traful de línea estilizada junto a una silla y una planta"},{"path":"products/legacy/traful-2.webp","alt":"Detalle de la pantalla acanalada de la lámpara Traful"}]'::jsonb, array['Base de hierro rectangular', 'Pantalla plástica PLA', 'Luz blanca cálida', 'Altura 1,8 m']::text[], true, 'publicada'
where not exists (select 1 from public.products where id = 'traful')
on conflict (id) do nothing;

insert into public.products (id, slug, name, description, price, category, images, specifications, featured, status)
select 'piedra-mora', 'piedra-mora', 'Piedra Mora', 'Una silueta esbelta que se abre en la pantalla como una flor. La textura del PLA deja pasar una luz suave y envolvente.', 72000, 'lampara-de-pie', '[{"path":"products/legacy/piedra-mora-1.webp","alt":"Lámpara de pie Piedra Mora en un rincón junto a una planta"},{"path":"products/legacy/piedra-mora-2.webp","alt":"Detalle de la pantalla de la lámpara Piedra Mora con luz cálida"}]'::jsonb, array['Base de hierro redonda', 'Pantalla plástica PLA', 'Luz blanca cálida', 'Altura 1,75 m']::text[], false, 'publicada'
where not exists (select 1 from public.products where id = 'piedra-mora')
on conflict (id) do nothing;

insert into public.products (id, slug, name, description, price, category, images, specifications, featured, status)
select 'manly', 'manly', 'Manly', 'Un velador de mesa con pantalla texturada que dibuja ondas de luz sobre la pared. Compacto y cálido para una mesa de luz o un escritorio.', 35000, 'velador', '[{"path":"products/legacy/manly-1.webp","alt":"Velador Manly con pantalla texturada encendido sobre una mesa"}]'::jsonb, array['Base de hierro redonda', 'Pantalla plástica PLA', 'Luz blanca cálida', 'Altura 22 cm']::text[], true, 'publicada'
where not exists (select 1 from public.products where id = 'manly')
on conflict (id) do nothing;

insert into public.products (id, slug, name, description, price, category, images, specifications, featured, status)
select 'kids', 'kids', 'Kids', 'Un velador pensado para las infancias, con estrellas y lunas caladas que proyectan una luz tenue y tranquila a la hora de dormir.', 35000, 'velador', '[{"path":"products/legacy/kids-1.webp","alt":"Velador Kids con estrellas y lunas caladas encendido sobre una mesa"}]'::jsonb, array['Base de hierro redonda', 'Pantalla plástica PLA', 'Luz blanca cálida', 'Altura 17 cm']::text[], false, 'publicada'
where not exists (select 1 from public.products where id = 'kids')
on conflict (id) do nothing;

commit;
