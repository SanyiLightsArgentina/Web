import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FormEvent } from 'react'
import { defaultSettings } from '@/lib/site-settings'
import { useSiteDraft } from './use-site-draft'

const save = vi.hoisted(() => ({ mutateAsync: vi.fn(), isPending: false }))
vi.mock('./use-site-settings', () => ({ useSaveSiteSection: () => save }))
const event = { preventDefault: () => {} } as FormEvent
beforeEach(() => vi.resetAllMocks())

describe('site draft', () => {
  it('normalizes clients and saves just the chosen section', async () => {
    const { result } = renderHook(() => useSiteDraft(defaultSettings, 'clients', false))
    act(() => result.current.setDraft(d => ({ ...d, clients: [{ id: '1', company: ' Company ', logo: '', link: '' }] })))
    await act(async () => { await result.current.submit(event) })
    expect(save.mutateAsync).toHaveBeenCalledWith({ key: 'clients', value: [{ id: '1', company: 'Company', logo: '', link: '' }] })
    expect(result.current.draft.clients[0].company).toBe('Company')
    expect(defaultSettings.clients).toEqual([])
  })
  it('blocks invalid input and preserves the draft on save failure', async () => {
    const { result } = renderHook(() => useSiteDraft(defaultSettings, 'contact', false))
    act(() => result.current.setDraft(d => ({ ...d, contact: { ...d.contact, phone: 'bad' } })))
    await act(async () => { await result.current.submit(event) })
    expect(save.mutateAsync).not.toHaveBeenCalled()
    act(() => result.current.setDraft(d => ({ ...d, contact: { ...d.contact, phone: '123456789' } })))
    save.mutateAsync.mockRejectedValueOnce(new Error('offline'))
    await act(async () => { await result.current.submit(event) })
    expect(result.current.draft.contact.phone).toBe('123456789')
  })
  it('does not save during upload and reorders without mutating the original', async () => {
    const { result } = renderHook(() => useSiteDraft(defaultSettings, 'hero', true))
    await act(async () => { await result.current.submit(event) })
    expect(save.mutateAsync).not.toHaveBeenCalled()
    const items = ['a', 'b', 'c']
    expect(result.current.moved(items, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(items).toEqual(['a', 'b', 'c'])
    expect(result.current.moved(items, 0, -1)).toEqual(items)
  })
})
