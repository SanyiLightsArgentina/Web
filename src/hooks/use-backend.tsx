import { createContext, useContext, type ReactNode } from 'react'
import { getSupabaseBackend, type Backend } from '@/lib/backend'

const BackendContext = createContext<Backend | null>(null)

export function BackendProvider({ backend, children }: { backend: Backend; children: ReactNode }) {
  return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>
}

/** The Backend in scope; outside any provider, the production one. */
export function useBackend(): Backend {
  return useContext(BackendContext) ?? getSupabaseBackend()
}
