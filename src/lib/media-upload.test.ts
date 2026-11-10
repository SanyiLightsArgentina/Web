import { describe, expect, it, vi } from 'vitest'
import { createMediaUploadSession } from './media'
import { productMedia, resolveProductMedia } from './product-media'

const resize = vi.fn(async () => new Blob(['webp'], { type: 'image/webp' }))
const target = { kind: 'product-image', model: 'Lamp' } as const
const image = () => new File(['image'], 'lamp.png', { type: 'image/png' })

describe('media upload session', () => {
  it('stores only the optimized variants and retries only failed ones', async () => {
    let fail = true
    const store = { remove: vi.fn(), upload: vi.fn(async (_bucket: string, path: string) => {
      if (path.endsWith('/card.webp') && fail) { fail = false; throw new Error('offline') }
      return `https://example.com/${path}`
    }) }
    const upload = createMediaUploadSession(store, resize)
    const file = image()
    await expect(upload(file, target)).rejects.toThrow('offline')
    const url = await upload(file, target)
    const paths = store.upload.mock.calls.map(([, path]) => path)
    expect(paths).toHaveLength(4)
    expect(paths.every(path => /^products\/Lamp\/.+_lamp\.png\/optimized-v1\/(thumb|card|detail)\.webp$/.test(path))).toBe(true)
    expect(paths.filter(path => path.endsWith('/thumb.webp'))).toHaveLength(1)
    // The variants upload together: detail completes even though card failed,
    // and the retry uploads only the card.
    expect(paths[2]).toMatch(/\/detail\.webp$/)
    expect(paths[3]).toBe(paths[1])
    expect(url).toBe(`https://example.com/${paths[2]}`)
    expect(await upload(file, target)).toBe(url)
    expect(store.upload).toHaveBeenCalledTimes(4)
    expect(store.remove).not.toHaveBeenCalled()
  })

  it('reports a failed variant only after its sibling uploads settle', async () => {
    let finishDetail!: () => void
    const store = { remove: vi.fn(), upload: vi.fn(async (_bucket: string, path: string) => {
      if (path.endsWith('/card.webp')) throw new Error('offline')
      if (path.endsWith('/detail.webp')) await new Promise<void>(resolve => { finishDetail = resolve })
      return `https://example.com/${path}`
    }) }
    let settled = false
    const result = createMediaUploadSession(store, resize)(image(), target).finally(() => { settled = true })
    await vi.waitFor(() => expect(store.upload).toHaveBeenCalledTimes(3))
    await Promise.resolve()
    expect(settled).toBe(false)
    finishDetail()
    await expect(result).rejects.toThrow('offline')
  })

  it('retains completed files across partial resolution and failed Product saving', async () => {
    let fail = true
    const store = { remove: vi.fn(), upload: vi.fn(async (_bucket: string, path: string, file: File) => {
      if (file.name === 'b.pdf' && fail) { fail = false; throw new Error('offline') }
      return `https://example.com/${path}`
    }) }
    const upload = createMediaUploadSession(store, resize)
    const draft = productMedia()
    draft.contents = ['a.pdf', 'b.pdf'].map(name => ({ type: 'file', value: new File(['pdf'], name) }))
    await expect(resolveProductMedia(draft, 'Lamp', upload)).rejects.toThrow('offline')
    const save = vi.fn().mockRejectedValueOnce(new Error('write failed')).mockResolvedValueOnce(undefined)
    const resolved = await resolveProductMedia(draft, 'Lamp', upload)
    await expect(save(resolved)).rejects.toThrow('write failed')
    await save(await resolveProductMedia(draft, 'Lamp', upload))
    expect(store.upload.mock.calls.map(([, , file]) => file.name)).toEqual(['a.pdf', 'b.pdf', 'b.pdf'])
    expect(save.mock.calls[1][0]).toEqual(resolved)
    expect(draft.contents.every(item => item.type === 'file')).toBe(true)
  })

  it('isolates different targets and editor sessions and deduplicates concurrent uploads', async () => {
    const store = { remove: vi.fn(), upload: vi.fn(async (_bucket: string, path: string) => `https://example.com/${path}`) }
    const file = new File(['pdf'], 'manual.pdf')
    const upload = createMediaUploadSession(store, resize)
    const content = { kind: 'product-content', model: 'Lamp' } as const
    const [first, second] = await Promise.all([upload(file, content), upload(file, content)])
    expect(first).toBe(second)
    expect(store.upload).toHaveBeenCalledTimes(1)
    expect(await upload(file, { ...content, model: 'Other' })).not.toBe(first)
    expect(await createMediaUploadSession(store, resize)(file, content)).not.toBe(first)
    expect(store.upload).toHaveBeenCalledTimes(3)
  })

  it('rejects validation and empty upload results without caching failure', async () => {
    const store = { remove: vi.fn(), upload: vi.fn().mockResolvedValueOnce('').mockResolvedValueOnce('uploaded') }
    const upload = createMediaUploadSession(store, resize)
    await expect(upload(new File([], 'empty.png'), target)).rejects.toThrow('vacío')
    expect(store.upload).not.toHaveBeenCalled()
    const file = new File(['pdf'], 'manual.pdf')
    const content = { kind: 'product-content', model: 'Lamp' } as const
    await expect(upload(file, content)).rejects.toThrow('No se pudo subir')
    expect(await upload(file, content)).toBe('uploaded')
  })
})
