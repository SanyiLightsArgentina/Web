-- Setup for admin-editable public content using Supabase Auth.
-- Admin accounts require server-controlled app_metadata.role = admin.
begin;
create table if not exists public.site_settings (
  key text primary key check (key in ('hero', 'videos', 'contact', 'category_order', 'clients')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
create policy "Public site content" on public.site_settings for select to anon, authenticated using (true);

-- Admin writes use Supabase Auth sessions and RLS.
grant insert, update on public.site_settings to authenticated;
create policy "Admin settings write" on public.site_settings for all to authenticated
using ((select auth.uid()) is not null and ((select auth.jwt())->'app_metadata'->>'role') = 'admin')
with check ((select auth.uid()) is not null and ((select auth.jwt())->'app_metadata'->>'role') = 'admin');
create or replace function public.save_site_section(p_key text, p_value jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'admin' then
    raise exception 'Admin session required' using errcode = '42501';
  end if;
  if p_key is null or p_key not in ('hero', 'videos', 'contact', 'category_order', 'clients') or p_value is null then
    raise exception 'Invalid setting';
  end if;
  if octet_length(p_value::text) > 262144 then raise exception 'Content too large'; end if;
  if p_key in ('hero', 'category_order', 'clients') and jsonb_typeof(p_value) <> 'array' then raise exception 'Expected array'; end if;
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
  if p_key = 'clients' then
    if jsonb_array_length(p_value) > 100 then raise exception 'Too many clients'; end if;
    if exists (
      select 1 from jsonb_array_elements(p_value) c
      where jsonb_typeof(c) is distinct from 'object'
        or jsonb_typeof(c->'id') is distinct from 'string' or coalesce(c->>'id', '') = ''
        or jsonb_typeof(c->'company') is distinct from 'string'
        or length(btrim(coalesce(c->>'company', ''))) not between 1 and 160
        or jsonb_typeof(c->'logo') is distinct from 'string'
        or jsonb_typeof(c->'link') is distinct from 'string'
        or (coalesce(c->>'logo', '') <> '' and c->>'logo' !~ '^https?://')
        or (coalesce(c->>'link', '') <> '' and c->>'link' !~ '^https?://')
    ) then raise exception 'Invalid clients'; end if;
    if (select count(distinct c->>'id') from jsonb_array_elements(p_value) c) <> jsonb_array_length(p_value) then
      raise exception 'Duplicate client IDs';
    end if;
  end if;
  insert into public.site_settings (key, value) values (p_key, p_value)
  on conflict (key) do update set value = excluded.value, updated_at = now();
end;
$$;
revoke all on function public.save_site_section(text,jsonb) from public;
grant execute on function public.save_site_section(text,jsonb) to authenticated;
commit;
