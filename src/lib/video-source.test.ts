import { describe, expect, it } from 'vitest'
import { parseVideoSource } from './video-source'

const id = 'abcdefghijk'
describe('video source', () => {
  it.each(['https://youtu.be/', 'https://www.youtube.com/watch?v=', 'https://m.youtube.com/shorts/', 'https://www.youtube-nocookie.com/embed/', 'https://youtube.com/live/'])( 'recognizes YouTube form %s', prefix => {
    expect(parseVideoSource(`${prefix}${id}`)).toMatchObject({ kind: 'youtube', id, startSeconds: 0, thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg` })
  })
  it.each([['90', 90], ['1m30s', 90], ['1h2m3s', 3723], ['2m', 120], ['9s', 9], ['bad', 0], ['-1', 0]])('parses t=%s as %i seconds', (time, seconds) => {
    const source = parseVideoSource(`https://youtu.be/${id}?t=${time}`)
    expect(source).toMatchObject({ kind: 'youtube', startSeconds: seconds })
    if (source.kind === 'youtube') expect(new URL(source.heroEmbedUrl).searchParams.get('start')).toBe(String(seconds))
  })
  it('preserves embed start parameters and signed direct file URLs', () => {
    expect(parseVideoSource(`https://youtube.com/embed/${id}?start=30`)).toMatchObject({ startSeconds: 30, embedUrl: `https://www.youtube.com/embed/${id}?start=30` })
    expect(parseVideoSource('https://example.com/VIDEO.MP4?token=abc')).toEqual({ kind: 'direct', url: 'https://example.com/VIDEO.MP4?token=abc' })
  })
  it.each(['https://vimeo.com/123', `https://youtube.com.evil.test/watch?v=${id}`, 'javascript:alert(1)', 'bad', 'https://youtube.com/watch?v=short'])('does not embed unsupported or invalid URL %s', url => {
    expect(parseVideoSource(url).kind).toBe('unsupported')
  })
})
