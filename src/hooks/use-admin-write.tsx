import { createContext, useContext, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { invalidateAfterWrite, type WriteKind } from '@/lib/query-invalidation'

export interface AdminWriteSession {
  isSaving: boolean
  lastSaved: Date | null
  run<T>(kind: WriteKind, success: string, action: () => Promise<T>): Promise<T>
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Volvé a intentar.'
}

function useAdminWriteSession(): AdminWriteSession {
  const client = useQueryClient()
  const { toast } = useToast()
  // A counter, not a boolean: overlapping writes must not clear the flag early.
  const [pending, setPending] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const run = async <T,>(kind: WriteKind, success: string, action: () => Promise<T>): Promise<T> => {
    setPending(count => count + 1)
    try {
      const result = await action()
      await invalidateAfterWrite(client, kind)
      setLastSaved(new Date())
      toast({ title: success })
      return result
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo guardar',
        description: messageOf(error),
      })
      throw error
    } finally {
      setPending(count => count - 1)
    }
  }

  return { isSaving: pending > 0, lastSaved, run }
}

const AdminWriteContext = createContext<AdminWriteSession | null>(null)

/**
 * One save session for every admin write. It owns busy, the last successful
 * save, user feedback, and which reads a write makes stale.
 */
export function AdminWriteProvider({ children }: { children: ReactNode }) {
  const session = useAdminWriteSession()
  return <AdminWriteContext.Provider value={session}>{children}</AdminWriteContext.Provider>
}

export function useAdminWrite(): AdminWriteSession {
  const session = useContext(AdminWriteContext)
  if (!session) throw new Error('AdminWriteProvider is required')
  return session
}
