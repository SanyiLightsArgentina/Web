import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

/** Which reads each admin write makes stale. Kept next to the keys it names. */
export type WriteKind = 'product' | 'category' | 'category-order' | 'site-section'

const dependents: Record<WriteKind, readonly (readonly string[])[]> = {
  product: [queryKeys.products],
  // Renaming or removing a Category changes the label stored on every Product.
  category: [queryKeys.products, queryKeys.categories],
  // The catalog order is derived from site settings, so products need no refetch.
  'category-order': [queryKeys.siteSettings],
  'site-section': [queryKeys.siteSettings],
}

export async function invalidateAfterWrite(client: QueryClient, kind: WriteKind): Promise<void> {
  await Promise.all(dependents[kind].map(queryKey => client.invalidateQueries({ queryKey })))
}
