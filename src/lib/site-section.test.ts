import { describe, expect, it } from 'vitest'
import { defaultSettings, prepareSiteSection } from './site-settings'

describe('site section validity', () => {
  it('accepts current defaults and empty optional lists', () => {
    expect(() => prepareSiteSection({ key: 'hero', value: defaultSettings.hero })).not.toThrow()
    expect(() => prepareSiteSection({ key: 'contact', value: defaultSettings.contact })).not.toThrow()
    expect(() => prepareSiteSection({ key: 'videos', value: { channelUrl: 'https://youtube.com', items: [] } })).not.toThrow()
    expect(prepareSiteSection({ key: 'clients', value: [] })).toEqual({ key: 'clients', value: [] })
  })
  it('rejects empty hero, external destinations and unsupported videos', () => {
    expect(() => prepareSiteSection({ key: 'hero', value: [] })).toThrow('slide')
    expect(() => prepareSiteSection({ key: 'hero', value: [{ ...defaultSettings.hero[0], productRoute: '//elsewhere.test' }] })).toThrow('ruta')
    expect(() => prepareSiteSection({ key: 'videos', value: { channelUrl: 'https://youtube.com', items: [{ id: '1', title: 'Demo', url: 'https://vimeo.com/123' }] } })).toThrow('YouTube')
  })
  it('validates contacts, clients and category ordering', () => {
    expect(() => prepareSiteSection({ key: 'contact', value: { ...defaultSettings.contact, phone: '+123' } })).toThrow('WhatsApp')
    expect(() => prepareSiteSection({ key: 'clients', value: [{ id: '1', company: ' ', logo: '', link: '' }] })).toThrow('empresa')
    expect(() => prepareSiteSection({ key: 'category_order', value: [1, 1] })).toThrow('orden')
    expect(() => prepareSiteSection({ key: 'category_order', value: [1, 2] })).not.toThrow()
  })
})
