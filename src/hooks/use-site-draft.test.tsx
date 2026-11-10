import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FormEvent } from 'react'
import { createMediaPublication } from '@/lib/media-publication'
import { defaultSettings, type SiteSectionUpdate, type SiteSettings } from '@/lib/site-settings'
import { useSiteDraft } from './use-site-draft'

const save = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false }))
vi.mock('./use-site-settings', () => ({ useSaveSiteSection: () => save }))
vi.mock('./use-media-publication', () => ({ supabaseMediaPublication: () => { throw new Error('inject a publication') } }))
const event = { preventDefault: () => {} } as FormEvent

const origin = 'https://project.supabase.co'
const url = (bucket: string, path: string) => `${origin}/storage/v1/object/public/${bucket}/${path}`

function storage() {
  const store = {
    upload: vi.fn(async (bucket: string, path: string) => url(bucket, path)),
    remove: vi.fn(async (_bucket: string, _path: string) => {}),
  }
  const references = vi.fn(async (): Promise<string[]> => [])
  return { store, references, publication: createMediaPublication(store, origin, references) }
}
const logo = (name: string) => new File(['png'], name, { type: 'image/png' })
const withClients = (logos: string[]): SiteSettings =>
  ({ ...defaultSettings, clients: logos.map((logo, index) => ({ id: String(index), company: 'Co', logo, link: '' })) })

beforeEach(() => {
  vi.resetAllMocks()
  save.mutateAsync.mockImplementation(async (update: SiteSectionUpdate) => update)
})

describe('site draft', () => {
  it('saves just the chosen section and adopts the normalized result', async () => {
    const saved: SiteSectionUpdate = { key: 'clients', value: [{ id: '1', company: 'Company', logo: '', link: '' }] }
    save.mutateAsync.mockResolvedValueOnce(saved)
    const { result } = renderHook(() => useSiteDraft(defaultSettings, 'clients', storage().publication))
    act(() => result.current.setDraft(d => ({ ...d, clients: [{ id: '1', company: ' Company ', logo: '', link: '' }] })))
    await act(async () => { await result.current.submit(event) })
    expect(save.mutateAsync).toHaveBeenCalledWith({ key: 'clients', value: [{ id: '1', company: ' Company ', logo: '', link: '' }] })
    expect(result.current.draft.clients[0].company).toBe('Company')
    expect(defaultSettings.clients).toEqual([])
  })

  it('preserves the draft on save failure', async () => {
    const { result } = renderHook(() => useSiteDraft(defaultSettings, 'contact', storage().publication))
    act(() => result.current.setDraft(d => ({ ...d, contact: { ...d.contact, phone: '123456789' } })))
    save.mutateAsync.mockRejectedValueOnce(new Error('offline'))
    await act(async () => { await result.current.submit(event) })
    expect(result.current.draft.contact.phone).toBe('123456789')
  })

  it('does not save during upload and reorders without mutating the original', async () => {
    const { store, publication } = storage()
    let finishUpload!: () => void
    store.upload.mockImplementationOnce(async (bucket, path) => {
      await new Promise<void>(resolve => { finishUpload = resolve })
      return url(bucket, path)
    })
    const { result } = renderHook(() => useSiteDraft(defaultSettings, 'clients', publication))
    let uploading!: Promise<string>
    act(() => { uploading = result.current.upload(logo('a.png'), { kind: 'client-logo', clientId: '1' }) })
    expect(result.current.isUploading).toBe(true)
    await act(async () => { await result.current.submit(event) })
    expect(save.mutateAsync).not.toHaveBeenCalled()
    await act(async () => { finishUpload(); await uploading })
    expect(result.current.isUploading).toBe(false)

    const items = ['a', 'b', 'c']
    expect(result.current.moved(items, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(items).toEqual(['a', 'b', 'c'])
    expect(result.current.moved(items, 0, -1)).toEqual(items)
  })

  it('retires a replaced client logo and an upload the save did not use', async () => {
    const old = url('product-images', 'clients/0/old.png')
    const { store, publication } = storage()
    const { result } = renderHook(() => useSiteDraft(withClients([old]), 'clients', publication))
    let kept = ''
    await act(async () => {
      await result.current.upload(logo('unused.png'), { kind: 'client-logo', clientId: '0' })
      kept = await result.current.upload(logo('kept.png'), { kind: 'client-logo', clientId: '0' })
    })
    act(() => result.current.setDraft(d => ({ ...d, clients: [{ ...d.clients[0], logo: kept }] })))
    await act(async () => { await result.current.submit(event) })

    expect(store.remove.mock.calls.map(([, path]) => path).sort()).toEqual([
      'clients/0/old.png', expect.stringMatching(/^clients\/0\/.+\.png$/),
    ].sort())
    expect(store.remove).not.toHaveBeenCalledWith('product-images', new URL(kept).pathname.split('/product-images/')[1])
  })

  it('keeps a removed hero video another section still references, and never removes hand-placed media', async () => {
    const shared = url('product-videos', 'site/hero/shared.mp4')
    const manual = url('product-videos', 'manual/intro.mp4')
    const initial: SiteSettings = { ...defaultSettings, hero: [
      { ...defaultSettings.hero[0], src: shared },
      { ...defaultSettings.hero[0], src: manual },
    ] }
    const { store, references, publication } = storage()
    references.mockResolvedValue([shared])
    const { result } = renderHook(() => useSiteDraft(initial, 'hero', publication))
    act(() => result.current.setDraft(d => ({ ...d, hero: [defaultSettings.hero[0]] })))
    await act(async () => { await result.current.submit(event) })
    expect(references).toHaveBeenCalledOnce()
    expect(store.remove).not.toHaveBeenCalled()
  })

  it('releases unsaved uploads when the editor closes', async () => {
    const { store, publication } = storage()
    const { result, unmount } = renderHook(() => useSiteDraft(defaultSettings, 'videos', publication))
    await act(async () => { await result.current.upload(new File(['v'], 'clip.mp4', { type: 'video/mp4' }), { kind: 'site-video', section: 'videos' }) })
    unmount()
    await vi.waitFor(() => expect(store.remove).toHaveBeenCalledExactlyOnceWith('product-videos', expect.stringMatching(/^site\/videos\/.+\.mp4$/)))
    expect(save.mutateAsync).not.toHaveBeenCalled()
  })
})
