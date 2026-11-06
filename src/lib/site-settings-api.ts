import { supabase } from './supabase';
import { defaultSettings, type SiteSettings } from './site-settings';

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('site_settings').select('key, value');
  // Preserve the current public content while the additive schema is rolled out.
  if (error?.code === 'PGRST205') return defaultSettings;
  if (error) throw new Error('No se pudo cargar la configuración del sitio');
  return { ...defaultSettings, ...Object.fromEntries((data ?? []).map(row => [row.key, row.value])) };
}
export async function saveSiteSection<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
  const { error } = await supabase.rpc('save_site_section', {
    p_key: key, p_value: value,
  });
  if (error) throw new Error('No se pudo guardar. Verificá tu sesión y volvé a intentar.');
}
