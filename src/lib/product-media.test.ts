import { describe, expect, it, vi } from 'vitest'
import { createProductMediaPublishing, productMedia, ProductMediaUploadError, resolveProductMedia } from './product-media'
import { createMediaPublication } from './media-publication'

describe('product media', () => {
  it('resolves mixed URLs and files in field order without changing the draft', async () => {
    const file = new File(['image'], 'lamp.png', { type: 'image/png' })
    const draft = productMedia()
    draft.images = [{ type: 'url', value: 'existing' }, { type: 'file', value: file }]
    const upload = vi.fn().mockResolvedValue('uploaded')
    expect(await resolveProductMedia(draft, 'Lamp', upload)).toEqual({ images: ['existing', 'uploaded'], contents: [], videos: [] })
    expect(upload).toHaveBeenCalledWith(file, { kind: 'product-image', model: 'Lamp' })
    expect(draft.images[1]).toEqual({ type: 'file', value: file })
  })

  it('rejects a failed upload without losing files so retry is possible', async () => {
    const draft = productMedia()
    const file = new File(['video'], 'lamp.mp4')
    draft.videos = [{ type: 'file', value: file }]
    await expect(resolveProductMedia(draft, 'Lamp', vi.fn().mockRejectedValue(new Error('offline')))).rejects.toThrow('offline')
    expect(draft.videos[0].value).toBe(file)
    await expect(resolveProductMedia(draft, 'Lamp', vi.fn().mockResolvedValue(''))).rejects.toThrow('No se pudo subir')
  })
})

const origin = 'https://project.supabase.co'
const url = (bucket: string, path: string) => `${origin}/storage/v1/object/public/${bucket}/${path}`
const details = { model: 'Lamp', description: 'Light', category_id: 1, new: false }

function publishing() {
  const store = {
    upload: vi.fn(async (bucket: string, path: string) => url(bucket, path)),
    remove: vi.fn(async (_bucket: string, _path: string) => {}),
  }
  const references = vi.fn(async (): Promise<string[]> => [])
  const resize = vi.fn(async () => new Blob(['resized'], { type: 'image/webp' }))
  return { store, references, media: createProductMediaPublishing(createMediaPublication(store, origin, references, resize)) }
}

describe('Product media publishing', () => {
  it('retries a partial image upload, publishes once, and retains the uploaded family', async () => {
    const { store, media } = publishing()
    const draft = productMedia()
    draft.images = [{ type: 'file', value: new File(['image'], 'lamp.png', { type: 'image/png' }) }]
    const upload = store.upload.getMockImplementation()!
    store.upload.mockImplementation(async (bucket, path) => {
      if (path.endsWith('card.webp') && store.upload.mock.calls.length === 2) throw new Error('offline')
      return upload(bucket, path)
    })
    const write = vi.fn(async () => {})
    const edit = media.start()

    await expect(edit.publish(details, draft, write)).rejects.toBeInstanceOf(ProductMediaUploadError)
    expect(write).not.toHaveBeenCalled()
    await edit.publish(details, draft, write)

    expect(store.upload).toHaveBeenCalledTimes(4)
    expect(write).toHaveBeenCalledExactlyOnceWith({
      ...details, images: [expect.stringMatching(/detail\.webp$/)], contents: [], videos: [],
    })
    expect(store.remove).not.toHaveBeenCalled()
  })

  it('releases abandoned uploads after checking whether a rejected write reached the catalog', async () => {
    const { store, media, references } = publishing()
    const draft = productMedia()
    draft.contents = ['kept.pdf', 'unused.pdf'].map(name => ({ type: 'file', value: new File(['pdf'], name) }))
    const edit = media.start()
    await expect(edit.publish(details, draft, async saved => {
      // The request reported failure even though another Product now references this object.
      references.mockResolvedValueOnce([saved.contents![0] + '?shared=1'])
      throw new Error('lost response')
    })).rejects.toThrow('lost response')

    expect(store.remove).not.toHaveBeenCalled()
    await edit.discard()
    expect(references).toHaveBeenCalledOnce()
    expect(store.remove).toHaveBeenCalledExactlyOnceWith('product-content', expect.stringMatching(/unused\.pdf$/))
  })

  it('releases the attempted paths after a partial upload is discarded', async () => {
    const { store, media, references } = publishing()
    const draft = productMedia()
    draft.contents = ['first.pdf', 'second.pdf'].map(name => ({ type: 'file', value: new File(['pdf'], name) }))
    const write = vi.fn()
    store.upload.mockImplementationOnce(async (bucket, path) => url(bucket, path))
    store.upload.mockRejectedValueOnce(new Error('offline'))
    const edit = media.start()

    await expect(edit.publish(details, draft, write)).rejects.toThrow('offline')
    await edit.discard()

    expect(write).not.toHaveBeenCalled()
    expect(references).not.toHaveBeenCalled()
    expect(store.remove.mock.calls.map(([, path]) => path)).toEqual([
      expect.stringMatching(/first\.pdf$/), expect.stringMatching(/second\.pdf$/),
    ])
  })

  it('retains staged objects when the write outcome and published references are unavailable', async () => {
    const { store, media, references } = publishing()
    const draft = productMedia()
    draft.contents = [{ type: 'file', value: new File(['pdf'], 'manual.pdf') }]
    const edit = media.start()
    await expect(edit.publish(details, draft, async () => { throw new Error('offline') })).rejects.toThrow('offline')
    references.mockRejectedValueOnce(new Error('offline'))

    await edit.discard()
    expect(store.remove).not.toHaveBeenCalled()
  })

  it('preserves shared image variants and keeps a committed edit successful when cleanup fails', async () => {
    const { store, media, references } = publishing()
    const original = url('product-images', 'products/Lamp/image.png')
    const previous = {
      ...details,
      id: 1,
      images: [original + '/optimized-v1/detail.webp'],
      contents: [url('product-content', 'products/Lamp/manual.pdf'), url('product-content', 'products/Lamp/remote.pdf').replace(origin, 'https://other.example')],
    }
    const write = vi.fn(async () => {})
    references.mockResolvedValueOnce([original])
    store.remove.mockRejectedValueOnce(new Error('offline'))

    await expect(media.start(previous).publish(details, productMedia(), write)).resolves.toBeUndefined()
    expect(write).toHaveBeenCalledOnce()
    expect(store.remove).toHaveBeenCalledExactlyOnceWith('product-content', 'products/Lamp/manual.pdf')
  })

  it('retires unreferenced Product media after a successful Product deletion', async () => {
    const { store, media } = publishing()
    const previous = { ...details, id: 1, contents: [url('product-content', 'products/Lamp/manual.pdf')] }
    const write = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined)

    await expect(media.remove(previous, write)).rejects.toThrow('offline')
    expect(store.remove).not.toHaveBeenCalled()
    await media.remove(previous, write)
    expect(store.remove).toHaveBeenCalledExactlyOnceWith('product-content', 'products/Lamp/manual.pdf')
  })
})
