import { useQuery } from '@tanstack/react-query';
import { useBackend } from '@/hooks/use-backend';
import { parseSiteSettings, type SiteSectionUpdate } from '@/lib/site-settings';
import { queryKeys, SITE_SETTINGS_STALE_TIME_MS } from '@/lib/query-keys';
import { useAdminWrite } from '@/hooks/use-admin-write';

export type { SiteSectionUpdate } from '@/lib/site-settings';

export function useSiteSettings() {
  const read = useBackend().catalog;
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
  const { siteSections } = useBackend();
  return {
    mutateAsync: (update: SiteSectionUpdate) =>
      run(update.key === 'category_order' ? 'category-order' : 'site-section', successMessage(update), () => siteSections.save(update)),
    isPending: isSaving,
  };
}
