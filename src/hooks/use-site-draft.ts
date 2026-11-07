import { useRef, useState, type FormEvent } from 'react'
import { prepareSiteSection, type SiteSectionUpdate, type SiteSettings } from '@/lib/site-settings'
import { useSaveSiteSection } from './use-site-settings'
import { toast } from './use-toast'

/** The editor owns draft lifetime; refetching never overwrites unsaved changes. */
export function useSiteDraft(initial: SiteSettings, section: keyof SiteSettings, uploading: boolean) {
  const [draft, setDraft] = useState(() => structuredClone(initial))
  const save = useSaveSiteSection()
  const submitting = useRef(false)
  const busy = uploading || save.isPending
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy || submitting.current) return
    let update: SiteSectionUpdate
    try {
      // The key indexes the matching field of the same settings tree.
      update = prepareSiteSection({ key: section, value: draft[section] } as SiteSectionUpdate)
    } catch (error) {
      toast({ title: 'Revisá los datos', description: (error as Error).message, variant: 'destructive' })
      return
    }
    submitting.current = true
    try {
      await save.mutateAsync(update)
      setDraft(previous => ({ ...previous, [update.key]: update.value }))
      toast(section === 'clients' ? { title: 'Clientes guardados', description: 'La sección del inicio ya muestra los cambios.' } : { title: 'Cambios guardados', description: 'El sitio ya muestra la nueva configuración.' })
    } catch (error) {
      toast({ title: 'Error al guardar', description: error instanceof Error ? error.message : 'Volvé a intentar.', variant: 'destructive' })
    } finally {
      submitting.current = false
    }
  }
  function moved<T>(items: T[], from: number, to: number): T[] {
    if (from < 0 || from >= items.length || to < 0 || to >= items.length) return items
    const result = [...items]
    result.splice(to, 0, result.splice(from, 1)[0])
    return result
  }
  return { draft, setDraft, busy, isSaving: save.isPending, submit, moved }
}
