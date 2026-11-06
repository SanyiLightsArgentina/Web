import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { getAdminUser, type AdminUser } from './admin-user'

export type { AdminUser } from './admin-user'
export { getAdminUser } from './admin-user'

export async function authenticateUser(
  username: string,
  password: string,
  client: SupabaseClient = supabase
): Promise<AdminUser> {
  const normalized = username.trim().toLowerCase()
  if (!/^[a-z0-9_-]+$/.test(normalized)) throw new Error('Credenciales incorrectas')
  // Internal Auth identifier; the admin keeps using their username.
  const { data, error } = await client.auth.signInWithPassword({
    email: `${normalized}@panel.sanyilights.invalid`,
    password,
  })
  if (error) throw new Error('Credenciales incorrectas')
  const admin = getAdminUser(data.user)
  if (!admin) {
    await client.auth.signOut()
    throw new Error('Acceso denegado')
  }
  return admin
}

export async function getSessionAdmin(
  client: SupabaseClient = supabase
): Promise<AdminUser | null> {
  const { data } = await client.auth.getSession()
  return getAdminUser(data.session?.user ?? null)
}

export async function signOutAdmin(client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client.auth.signOut()
  if (error) throw new Error('No se pudo cerrar la sesión')
}

export function observeAdminSession(
  onChange: (user: AdminUser | null) => void,
  client: SupabaseClient = supabase
): () => void {
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    onChange(getAdminUser(session?.user ?? null))
  })
  return () => subscription.unsubscribe()
}
