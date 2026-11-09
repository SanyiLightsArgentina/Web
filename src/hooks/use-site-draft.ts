import { useRef, useState, type FormEvent } from 'react'
import type { SiteSectionUpdate, SiteSettings } from '@/lib/site-settings'
import { useSaveSiteSection } from './use-site-settings'

/** The editor owns draft lifetime; refetching never overwrites unsaved changes. */
export function useSiteDraft(initial: SiteSettings, section: keyof SiteSettings, uploading: boolean) {
  const [draft, setDraft] = useState(() => structuredClone(initial))
  const save = useSaveSiteSection()
  const submitting = useRef(false)
  const busy = uploading || save.isPending
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy || submitting.current) return
    submitting.current = true
    try {
      // The key indexes the matching field of the same settings tree.
      const update = await save.mutateAsync({ key: section, value: draft[section] } as SiteSectionUpdate)
      setDraft(previous => ({ ...previous, [update.key]: update.value }))
    } catch {
      // The admin write session reports the failure; the draft stays editable.
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
