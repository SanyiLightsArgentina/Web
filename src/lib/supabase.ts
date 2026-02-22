import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Verifica tu archivo .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


//Mover a otro archivo
export interface DatabaseUser {
  id: string
  username: string
  password_hash: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export const authenticateUser = async (username: string, password: string) => {
  try {
    
    const { data, error } = await supabase
      .from('users')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Usuario no encontrado');
      }
      throw error;
    }
    
    if (!data) {
      throw new Error('Usuario no encontrado');
    }
    
    if (data.password_hash === password) {
      return data;
    } else {
      console.log('❌ Contraseña incorrecta');
      throw new Error('Contraseña incorrecta');
    }
    
  } catch (error) {
    console.error('🚨 Error en authenticateUser:', error);
    throw error;
  }
};

export const createUser = async (username: string, password: string, role: 'admin' | 'user' = 'user') => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      username,
      password_hash: password,
      role
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, password_hash, role, created_at, updated_at')
    .eq('username', username)
    .single();
  
  if (error) throw error;
  return data;
};
