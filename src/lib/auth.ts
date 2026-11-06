import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AdminUser { id: string; username: string; role: 'admin' }

export function getAdminUser(user: User | null): AdminUser | null {
  if (!user || user.app_metadata?.role !== 'admin') return null;
  return { id: user.id, username: user.app_metadata.username || 'admin', role: 'admin' };
}

export async function authenticateUser(username: string, password: string): Promise<AdminUser> {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(normalized)) throw new Error('Credenciales incorrectas');
  // Internal Auth identifier; the admin keeps using their username.
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${normalized}@panel.sanyilights.invalid`, password,
  });
  if (error) throw new Error('Credenciales incorrectas');
  const admin = getAdminUser(data.user);
  if (!admin) {
    await supabase.auth.signOut();
    throw new Error('Acceso denegado');
  }
  return admin;
}
