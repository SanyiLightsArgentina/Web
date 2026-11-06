import type { User } from '@supabase/supabase-js'

export interface AdminUser {
  id: string
  username: string
  role: 'admin'
}

/** The only place that decides whether a Supabase user is an admin. */
export function getAdminUser(
  user: Pick<User, 'id' | 'app_metadata'> | null
): AdminUser | null {
  if (!user || user.app_metadata?.role !== 'admin') return null
  return { id: user.id, username: user.app_metadata.username || 'admin', role: 'admin' }
}
