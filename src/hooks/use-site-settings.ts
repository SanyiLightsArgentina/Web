import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { createSupabaseCatalogStore, type CatalogReadStore } from '@/lib/catalog-store';
import { saveSiteSection } from '@/lib/site-settings-api';
import { parseSiteSettings, type SiteSectionUpdate } from '@/lib/site-settings';
import { queryKeys, SITE_SETTINGS_STALE_TIME_MS } from '@/lib/query-keys';
import { useAdminWrite } from '@/hooks/use-admin-write';

export type { SiteSectionUpdate } from '@/lib/site-settings';

export function useSiteSettings(store?: CatalogReadStore) {
  const supabaseStore = useMemo(() => createSupabaseCatalogStore(supabase), []);
  const read = store ?? supabaseStore;
  const query = useQuery({
    queryKey: queryKeys.siteSettings,
    queryFn: () => read.loadSiteSettings(),
    staleTime: SITE_SETTINGS_STALE_TIME_MS,
  });
  return { ...query, settings: query.data ?? parseSiteSettings(null) };
}

const successMessage = (update: SiteSectionUpdate) =>
  update.key === 'clients' ? 'Clientes guardados' : 'Cambios guardados';

/** Site section saves share the admin session with catalog writes. */
export function useSaveSiteSection() {
  const { run, isSaving } = useAdminWrite();
  return {
    mutateAsync: (update: SiteSectionUpdate) =>
      run('site-section', successMessage(update), () => saveSiteSection(update)),
    isPending: isSaving,
  };
}
