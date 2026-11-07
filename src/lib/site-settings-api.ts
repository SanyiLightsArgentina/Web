import { supabase } from './supabase';
import { parseSiteSettings, prepareSiteSection, type SiteSectionUpdate, type SiteSettings, type SiteSettingsRow } from './site-settings';

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('site_settings').select('key, value');
  // Preserve the current public content while the additive schema is rolled out.
  if (error?.code === 'PGRST205') return parseSiteSettings(null);
  if (error) throw new Error('No se pudo cargar la configuración del sitio');
  return parseSiteSettings((data ?? []) as SiteSettingsRow[]);
}
export async function saveSiteSection(update: SiteSectionUpdate) {
  const { key, value } = prepareSiteSection(update);
  const { error } = await supabase.rpc('save_site_section', {
    p_key: key, p_value: value,
  });
  if (error) throw new Error('No se pudo guardar. Verificá tu sesión y volvé a intentar.');
}
