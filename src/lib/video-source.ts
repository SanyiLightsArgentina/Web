/** File extensions a browser can play directly; anything else needs an embed. */
export const DIRECT_VIDEO_FILE = /\.(mp4|webm|m4v|mov|avi|mkv)$/i

export type VideoSource =
  | { kind: 'youtube'; url: string; id: string; startSeconds: number; embedUrl: string; heroEmbedUrl: string; thumbnailUrl: string }
  | { kind: 'direct' | 'unsupported'; url: string }

function startSeconds(value: string): number {
  if (/^\d+$/.test(value)) return Number(value)
  const time = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  return time ? Number(time[1] ?? 0) * 3600 + Number(time[2] ?? 0) * 60 + Number(time[3] ?? 0) : 0
}

/** Interpret URLs once. Unsupported providers (including Vimeo) never become embeds. */
export function parseVideoSource(value: string): VideoSource {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return { kind: 'unsupported', url: value }
    const host = url.hostname.replace(/^www\./, '')
    const id = host === 'youtu.be' ? url.pathname.slice(1) :
      ['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)
        ? url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1] : null
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      const start = startSeconds(url.searchParams.get('t') ?? url.searchParams.get('start') ?? new URLSearchParams(url.hash.slice(1)).get('t') ?? '')
      const embed = `https://www.youtube.com/embed/${id}`
      return {
        kind: 'youtube', url: value, id, startSeconds: start,
        embedUrl: `${embed}${start ? `?start=${start}` : ''}`,
        heroEmbedUrl: `${embed}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&start=${start}`,
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      }
    }
    return { kind: DIRECT_VIDEO_FILE.test(url.pathname) ? 'direct' : 'unsupported', url: value }
  } catch {
    return { kind: 'unsupported', url: value }
  }
}
