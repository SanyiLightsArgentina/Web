/** Published Product documents that can be opened from either public page. */
export function productDownloads(contents?: readonly string[] | null) {
  return (contents ?? []).flatMap(href => {
    let url: URL
    try {
      url = new URL(href)
    } catch {
      return []
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return []

    const path = url.pathname.split('/').pop() ?? ''
    let filename = path
    try {
      filename = decodeURIComponent(path)
    } catch {
      // An unrecognized filename does not make an otherwise valid URL unusable.
    }

    const extension = filename.match(/\.([a-z\d]{1,5})$/i)?.[1]?.toLowerCase()
    const kind = extension === 'pdf' ? 'pdf'
      : extension && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension) ? 'image'
      : 'file'
    return [{ href, kind, format: extension?.toUpperCase() ?? 'ARCHIVO' }] as const
  })
}
