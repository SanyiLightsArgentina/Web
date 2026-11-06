-- Auth cutover: run after provisioning and verifying the admin Auth account.
begin;
alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
create policy "Public catalog read" on public.products for select to anon, authenticated using (true);
create policy "Admin catalog write" on public.products for all to authenticated using (((select auth.uid()) is not null and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')) with check (((select auth.uid()) is not null and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'));
alter table public.categories enable row level security;
revoke all on public.categories from anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
create policy "Public catalog read" on public.categories for select to anon, authenticated using (true);
create policy "Admin catalog write" on public.categories for all to authenticated using (((select auth.uid()) is not null and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')) with check (((select auth.uid()) is not null and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'));
grant usage, select on sequence public.products_id_seq, public.categories_id_seq to authenticated;
alter table public.users enable row level security;
revoke all on public.users from anon, authenticated;
grant insert, update on public.site_settings to authenticated;
create policy "Admin settings write" on public.site_settings for all to authenticated using (((select auth.uid()) is not null and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')) with check (((select auth.uid()) is not null and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'));
drop policy "Upload Images 16wiy3a_0" on storage.objects;
drop policy "Upload Content zkhl7f_0" on storage.objects;
drop policy "Upload Videos 1czyqk6_0" on storage.objects;
create policy "Admin media write" on storage.objects for all to authenticated
using (bucket_id in ('product-images','product-content','product-videos') and ((select auth.uid()) is not null and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'))
with check (bucket_id in ('product-images','product-content','product-videos') and ((select auth.uid()) is not null and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'));

drop function public.save_site_section(text,text,text,jsonb);
create function public.save_site_section(p_key text, p_value jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'admin' then
    raise exception 'Admin session required' using errcode = '42501';
  end if;
  if p_key is null or p_key not in ('hero', 'videos', 'contact', 'category_order') or p_value is null then
    raise exception 'Invalid setting';
  end if;
  if octet_length(p_value::text) > 262144 then raise exception 'Content too large'; end if;
  if p_key in ('hero', 'category_order') and jsonb_typeof(p_value) <> 'array' then raise exception 'Expected array'; end if;
  if p_key in ('videos', 'contact') and jsonb_typeof(p_value) <> 'object' then raise exception 'Expected object'; end if;
  if p_key = 'hero' then
    if jsonb_array_length(p_value) < 1 or exists (
      select 1 from jsonb_array_elements(p_value) s
      where coalesce(s->>'type', '') not in ('image', 'video')
        or coalesce(s->>'src', '') !~ '^https?://'
        or coalesce(s->>'title', '') = ''
        or coalesce(s->>'productRoute', '') !~ '^/[^/]'
    ) then raise exception 'Invalid hero slides'; end if;
  end if;
  if p_key = 'videos' then
    if jsonb_typeof(p_value->'items') is distinct from 'array' or coalesce(p_value->>'channelUrl', '') !~ '^https?://' then raise exception 'Invalid videos'; end if;
    if exists (select 1 from jsonb_array_elements(p_value->'items') v where coalesce(v->>'title', '') = '' or coalesce(v->>'url', '') !~ '^https?://') then raise exception 'Invalid video'; end if;
  end if;
  if p_key = 'contact' and (
    coalesce(p_value->>'phone', '') !~ '^[0-9]{8,15}$'
    or coalesce(p_value->>'phoneLabel', '') = ''
    or coalesce(p_value->>'email', '') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or coalesce(p_value->>'instagram', '') !~ '^https?://'
    or coalesce(p_value->>'facebook', '') !~ '^https?://'
  ) then raise exception 'Invalid contact'; end if;
  if p_key = 'category_order' and exists (
    select 1 from jsonb_array_elements_text(p_value) v where v !~ '^[0-9]+$'
  ) then raise exception 'Invalid category IDs'; end if;
  insert into public.site_settings (key, value) values (p_key, p_value)
  on conflict (key) do update set value = excluded.value, updated_at = now();
end;
$$;
revoke all on function public.save_site_section(text,jsonb) from public;
grant execute on function public.save_site_section(text,jsonb) to authenticated;

-- Retire the legacy cleartext credential only after the Auth migration succeeded.
update public.users set password_hash = encode(extensions.gen_random_bytes(48), 'hex')
where username = 'admin' and exists (
  select 1 from auth.users where email = 'admin@panel.sanyilights.invalid'
    and email_confirmed_at is not null and raw_app_meta_data->>'role' = 'admin'
);
commit;
