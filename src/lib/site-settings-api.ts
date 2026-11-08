import { supabase } from './supabase';
import { prepareSiteSection, type SiteSectionUpdate } from './site-settings';

export async function saveSiteSection(update: SiteSectionUpdate) {
  const { key, value } = prepareSiteSection(update);
  const { error } = await supabase.rpc('save_site_section', {
    p_key: key, p_value: value,
  });
  if (error) throw new Error('No se pudo guardar. Verificá tu sesión y volvé a intentar.');
}
