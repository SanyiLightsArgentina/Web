import { describe, expect, it } from 'vitest'
import { defaultSettings, parseSiteSettings } from './site-settings'

describe('parseSiteSettings', () => {
  it('fills missing fields inside a section with defaults', () => {
    const settings = parseSiteSettings([
      { key: 'videos', value: { channelUrl: 'https://youtube.com/@sanyi' } },
      { key: 'contact', value: { phone: '5491100000000' } },
    ])
    expect(settings.videos.channelUrl).toBe('https://youtube.com/@sanyi')
    expect(settings.videos.items).toHaveLength(defaultSettings.videos.items.length)
    expect(settings.contact.phone).toBe('5491100000000')
    expect(settings.contact.email).toBe(defaultSettings.contact.email)
    expect(settings.contact.address).toBe(defaultSettings.contact.address)
  })

  it('falls back per section instead of replacing the whole object', () => {
    const settings = parseSiteSettings([
      { key: 'hero', value: 'not-an-array' },
      { key: 'contact', value: null },
      { key: 'videos', value: 42 },
      { key: 'category_order', value: [3, '4', -1, 1.5, 2] },
      { key: 'unknown', value: { anything: true } },
    ])
    expect(settings.hero).toEqual(defaultSettings.hero)
    expect(settings.contact).toEqual(defaultSettings.contact)
    expect(settings.videos).toEqual(defaultSettings.videos)
    expect(settings.category_order).toEqual([3, 2])
  })

  it('filters invalid items from arrays', () => {
    const settings = parseSiteSettings([
      {
        key: 'clients',
        value: [
          { id: 'a', company: 'Acme', logo: 'https://x/logo.png', link: 'https://acme.test' },
          { id: 'b', company: 3 },
          { id: 'c' },
        ],
      },
      {
        key: 'videos',
        value: { items: [{ id: 'x', title: 'Ok', url: 'https://youtu.be/aaaaaaaaaaa' }, { id: 'y' }] },
      },
    ])
    expect(settings.clients).toEqual([
      { id: 'a', company: 'Acme', logo: 'https://x/logo.png', link: 'https://acme.test' },
    ])
    expect(settings.videos.items).toEqual([
      { id: 'x', title: 'Ok', url: 'https://youtu.be/aaaaaaaaaaa' },
    ])
  })

  it('returns an independent default tree for empty input', () => {
    const empty = parseSiteSettings(null)
    expect(empty).toEqual(defaultSettings)
    expect(empty.videos).not.toBe(defaultSettings.videos)
    expect(empty.hero).not.toBe(defaultSettings.hero)
  })
})
