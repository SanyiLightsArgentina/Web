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
-- save_site_section: run scripts/save-site-section.sql after this script (its one definition).


-- Retire the legacy cleartext credential only after the Auth migration succeeded.
update public.users set password_hash = encode(extensions.gen_random_bytes(48), 'hex')
where username = 'admin' and exists (
  select 1 from auth.users where email = 'admin@panel.sanyilights.invalid'
    and email_confirmed_at is not null and raw_app_meta_data->>'role' = 'admin'
);
commit;
