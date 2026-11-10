-- Extend the existing Auth-protected settings without changing content or permissions.
begin;
alter table public.site_settings drop constraint site_settings_key_check;
alter table public.site_settings add constraint site_settings_key_check
  check (key in ('hero', 'videos', 'contact', 'category_order', 'clients'));
-- save_site_section: run scripts/save-site-section.sql after this script (its one definition).

commit;
