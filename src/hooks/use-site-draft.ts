import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { MediaTarget } from '@/lib/media'
import { siteSectionMediaUrls, type SiteSectionUpdate, type SiteSettings } from '@/lib/site-settings'
import { useBackend } from './use-backend'
import { useSaveSiteSection } from './use-site-settings'

const sectionUpdate = (settings: SiteSettings, section: keyof SiteSettings) =>
  // The key indexes the matching field of the same settings tree.
  ({ key: section, value: settings[section] }) as SiteSectionUpdate

/**
 * The editor owns draft lifetime; refetching never overwrites unsaved changes.
 * Files uploaded while editing are published with the section save; replaced
 * and abandoned uploads are retired once nothing references them.
 */
export function useSiteDraft(initial: SiteSettings, section: keyof SiteSettings) {
  const publication = useBackend().media
  const [draft, setDraft] = useState(() => structuredClone(initial))
  const [media] = useState(() => publication.start())
  const published = useRef(siteSectionMediaUrls(sectionUpdate(initial, section)))
  const [uploads, setUploads] = useState(0)
  const save = useSaveSiteSection()
  const submitting = useRef(false)
  const isUploading = uploads > 0
  const busy = isUploading || save.isPending

  useEffect(() => () => { void media.discard() }, [media])

  const upload = async (file: File, target: MediaTarget): Promise<string> => {
    setUploads(count => count + 1)
    try {
      return await media.upload(file, target)
    } finally {
      setUploads(count => count - 1)
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy || submitting.current) return
    submitting.current = true
    try {
      let saved: SiteSectionUpdate | undefined
      await media.publish(published.current, async () => {
        saved = await save.mutateAsync(sectionUpdate(draft, section))
        return siteSectionMediaUrls(saved)
      })
      published.current = siteSectionMediaUrls(saved!)
      setDraft(previous => ({ ...previous, [saved!.key]: saved!.value }))
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
  return { draft, setDraft, busy, isSaving: save.isPending, isUploading, upload, submit, moved }
}
