import type { SupabaseClient } from '@supabase/supabase-js'
import {
  parseSiteSettings, prepareSiteSection, SITE_SECTION_LIMITS,
  type SiteSectionUpdate, type SiteSettingsRow,
} from './site-settings'

const SESSION_PROBLEM = 'No se pudo guardar. Verificá tu sesión y volvé a intentar.'

/**
 * What the admin should read when save_site_section rejects a save. Its
 * exception texts are matched here; anything unrecognised (network, auth)
 * keeps the session message.
 */
export function siteSectionSaveError(error: { message?: string; code?: string }): string {
  if (error.code === '42501') return SESSION_PROBLEM
  const message = error.message ?? ''
  if (message === 'Too many clients') return `Podés cargar hasta ${SITE_SECTION_LIMITS.maxClients} empresas.`
  if (message === 'Duplicate client IDs') return 'Hay empresas repetidas. Recargá la página y volvé a intentar.'
  if (message === 'Content too large') return 'La sección tiene demasiado contenido. Quitá elementos y volvé a intentar.'
  if (/^(Invalid|Expected) /.test(message)) return 'El servidor rechazó algunos datos de la sección. Revisá los campos y volvé a intentar.'
  return SESSION_PROBLEM
}

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
      if (error) throw new Error(siteSectionSaveError(error))
      return prepared
    },
  }
}
