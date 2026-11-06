import { useEffect, useState } from 'react'
import {
  authenticateUser,
  getSessionAdmin,
  observeAdminSession,
  signOutAdmin,
  type AdminUser,
} from '@/lib/auth'

export type AdminSessionStatus = 'loading' | 'signed-out' | 'signed-in'

export interface AdminSession {
  status: AdminSessionStatus
  user: AdminUser | null
  isLoggingIn: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

/**
 * Owns session restore, the auth subscription, sign-in and sign-out. The
 * admin page only reads `status` and renders one of two screens.
 */
export function useAdminSession(): AdminSession {
  const [status, setStatus] = useState<AdminSessionStatus>('loading')
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    let active = true
    getSessionAdmin()
      .then(admin => {
        if (!active) return
        setUser(admin)
        setStatus(admin ? 'signed-in' : 'signed-out')
      })
      .catch(() => {
        if (active) setStatus('signed-out')
      })

    const unsubscribe = observeAdminSession(admin => {
      setUser(admin)
      setStatus(admin ? 'signed-in' : 'signed-out')
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoggingIn(true)
    try {
      const admin = await authenticateUser(username, password)
      setUser(admin)
      setStatus('signed-in')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const logout = async () => {
    await signOutAdmin()
    setUser(null)
    setStatus('signed-out')
  }

  return { status, user, isLoggingIn, login, logout }
}
