-- Crear primero la cuenta en Supabase Auth. Reemplazar SOLO el email.
-- No publicar este archivo con el email real si no querés versionarlo.
do $$
declare
  owner_email text := 'REEMPLAZAR_EMAIL_DEL_DUENO';
  owner_id uuid;
begin
  select id into owner_id from auth.users where lower(email) = lower(owner_email);
  if owner_id is null then
    raise exception 'Primero creá la cuenta del dueño en Auth y reemplazá el email de este SQL.';
  end if;
  insert into public.catalog_admins (user_id) values (owner_id)
  on conflict (user_id) do nothing;
end $$;
