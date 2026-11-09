import type { SupabaseClient } from '@supabase/supabase-js'
import { expect, it, vi } from 'vitest'
import { createSiteSectionStore } from './site-section-store'
import { defaultSettings, type SiteSectionUpdate } from './site-settings'

function fixture() {
  const rows = new Map<string, unknown>()
  const rpc = vi.fn(async (_name: string, args: { p_key: string; p_value: unknown }) => {
    rows.set(args.p_key, args.p_value)
    return { error: null }
  })
  const client = {
    rpc,
    from: () => ({
      select: async () => ({ data: Array.from(rows, ([key, value]) => ({ key, value })), error: null }),
    }),
  } as unknown as SupabaseClient
  return { store: createSiteSectionStore(client), rpc }
}

it('reads back normalized Site sections, including a deliberately empty Videos list', async () => {
  const { store } = fixture()
  expect((await store.load()).videos).toEqual(defaultSettings.videos)

  const clients = await store.save({
    key: 'clients', value: [{ id: '1', company: ' Luz ', logo: '', link: '' }],
  })
  const hero: SiteSectionUpdate = { key: 'hero', value: [{ ...defaultSettings.hero[0], productRoute: '/productos' }] }
  const videos: SiteSectionUpdate = { key: 'videos', value: { items: [], channelUrl: 'https://youtube.com' } }
  await store.save(hero)
  await store.save(videos)

  expect(clients.value).toEqual([{ id: '1', company: 'Luz', logo: '', link: '' }])
  expect(await store.load()).toMatchObject({ clients: clients.value, hero: hero.value, videos: videos.value })
})

it('rejects the home route before writing and leaves the last Hero edit readable', async () => {
  const { store, rpc } = fixture()
  const slide = { ...defaultSettings.hero[0], productRoute: '/productos' }
  await store.save({ key: 'hero', value: [slide] })

  await expect(store.save({ key: 'hero', value: [{ ...slide, productRoute: '/' }] })).rejects.toThrow('ruta del sitio')
  expect(rpc).toHaveBeenCalledOnce()
  expect((await store.load()).hero).toEqual([slide])
})
