import { describe, expect, it } from 'vitest'
import { getAdminUser } from './admin-user'

describe('getAdminUser', () => {
  it('rejects anonymous and non-admin users', () => {
    expect(getAdminUser(null)).toBeNull()
    expect(getAdminUser({ id: 'u2', app_metadata: { role: 'editor' } })).toBeNull()
    expect(getAdminUser({ id: 'u3', app_metadata: {} })).toBeNull()
  })

  it('reads the role and username from app_metadata', () => {
    expect(getAdminUser({ id: 'u1', app_metadata: { role: 'admin' } })).toEqual({
      id: 'u1',
      username: 'admin',
      role: 'admin',
    })
    expect(getAdminUser({ id: 'u1', app_metadata: { role: 'admin', username: 'sanyi' } })).toEqual({
      id: 'u1',
      username: 'sanyi',
      role: 'admin',
    })
  })

  it('does not trust user_metadata', () => {
    const user = {
      id: 'u4',
      app_metadata: {},
      user_metadata: { role: 'admin' },
    }
    expect(getAdminUser(user)).toBeNull()
  })
})
