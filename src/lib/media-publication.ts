import {
  createMediaUploadSession, isManagedMediaObject, mediaObjectKey, mediaObjectPaths,
  type MediaObject, type MediaStore, type MediaTarget,
} from './media'

/**
 * Lifetime of uploaded media for any owner (a Product, a Site section).
 * Uploads are staged until a write publishes them; whatever the write stops
 * referencing, and whatever was uploaded but never published, is retired once
 * nothing else in the catalog references it.
 */
export interface MediaPublication {
  start(): MediaPublicationSession
  /** Retire an owner's media after `write` removes the owner. */
  remove(previousUrls: readonly string[], write: () => Promise<unknown>): Promise<void>
}

export interface MediaPublicationSession {
  upload(file: File, target: MediaTarget): Promise<string>
  /**
   * Run `write`, which resolves to the media URLs the owner now references,
   * then retire what `previousUrls` referenced and the write dropped, plus
   * staged uploads it did not use. Cleanup failures never fail the publish.
   */
  publish(previousUrls: readonly string[], write: () => Promise<readonly string[]>): Promise<void>
  /** Release staged uploads; call when the editor is abandoned. */
  discard(): Promise<void>
}

export function createMediaPublication(
  store: MediaStore,
  storageOrigin: string,
  readReferencedUrls: () => Promise<readonly string[]>,
  resize?: Parameters<typeof createMediaUploadSession>[1],
): MediaPublication {
  function managedObjects(urls: readonly string[]) {
    return new Map(urls.flatMap(url => {
      let origin: string
      try { origin = new URL(url).origin } catch { return [] }
      if (origin !== storageOrigin) return []
      return mediaObjectPaths(url)
        .filter(isManagedMediaObject)
        .map(object => [mediaObjectKey(object), object] as const)
    }))
  }

  async function finish(
    before: readonly string[],
    after: readonly string[],
    staged?: Map<string, MediaObject>,
    ambiguousWrite = false,
  ) {
    const retained = new Set(managedObjects(after).keys())
    const retired = Array.from(managedObjects(before)).filter(([key]) => !retained.has(key))
    const references = retired.length || (ambiguousWrite && staged?.size)
      ? await readReferencedUrls().then(urls => managedObjects(urls)).catch(() => null)
      : null
    for (const key of references?.keys() ?? []) retained.add(key)

    // A failed response can follow a successful write. Protect published URLs if
    // we cannot establish what the catalog currently references.
    const removable = new Map(references ? retired : [])
    if (staged && (!ambiguousWrite || references)) {
      for (const [key, object] of staged) removable.set(key, object)
      staged.clear()
    }
    await Promise.allSettled(Array.from(removable)
      .filter(([key]) => !retained.has(key))
      .map(async ([, { bucket, path }]) => store.remove(bucket, path)))
  }

  return {
    start() {
      const staged = new Map<string, MediaObject>()
      const upload = createMediaUploadSession(store, resize, object => staged.set(mediaObjectKey(object), object))
      let ambiguousWrite = false
      return {
        upload,
        async publish(previousUrls, write) {
          let after: readonly string[]
          try {
            after = await write()
          } catch (error) {
            ambiguousWrite = true
            throw error
          }
          await finish(previousUrls, after, staged, ambiguousWrite)
        },
        discard: () => finish([], [], staged, ambiguousWrite),
      }
    },
    async remove(previousUrls, write) {
      await write()
      await finish(previousUrls, [])
    },
  }
}
