import type { SupabaseClient } from '@supabase/supabase-js'
import { parseSiteSettings, prepareSiteSection, type SiteSectionUpdate, type SiteSettingsRow } from './site-settings'

export function createSiteSectionStore(client: SupabaseClient) {
  return {
    async load() {
      const { data, error } = await client.from('site_settings').select('key, value')
      // Keep public defaults available during the additive schema rollout.
      if (error?.code === 'PGRST205') return parseSiteSettings(null)
      if (error) throw new Error('No se pudo cargar la configuración del sitio')
      return parseSiteSettings((data ?? []) as SiteSettingsRow[])
    },
    async save(update: SiteSectionUpdate) {
      const prepared = prepareSiteSection(update)
      const { error } = await client.rpc('save_site_section', {
        p_key: prepared.key, p_value: prepared.value,
      })
      if (error) throw new Error('No se pudo guardar. Verificá tu sesión y volvé a intentar.')
      return prepared
    },
  }
}
