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
-- save_site_section: run scripts/save-site-section.sql after this script (its one definition).

commit;
