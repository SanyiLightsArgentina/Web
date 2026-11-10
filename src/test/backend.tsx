import type { ReactNode } from 'react'
import { BackendProvider } from '@/hooks/use-backend'
import type { Backend } from '@/lib/backend'

/** A Backend whose unprovided parts fail loudly instead of reaching Supabase. */
export function testBackend(parts: Partial<Backend>): Backend {
  const missing = (name: string) => new Proxy({}, {
    get: (_, key) => () => { throw new Error(`test Backend: ${name}.${String(key)} was not provided`) },
  })
  return {
    catalog: missing('catalog'),
    writes: missing('writes'),
    siteSections: missing('siteSections'),
    media: missing('media'),
    ...parts,
  } as Backend
}

export function backendWrapper(parts: Partial<Backend>, Inner?: (props: { children: ReactNode }) => ReactNode) {
  const backend = testBackend(parts)
  return ({ children }: { children: ReactNode }) => (
    <BackendProvider backend={backend}>{Inner ? <Inner>{children}</Inner> : children}</BackendProvider>
  )
}
