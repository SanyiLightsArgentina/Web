import { useQuery } from '@tanstack/react-query';
import { fetchSiteSettings, saveSiteSection } from '@/lib/site-settings-api';
import { parseSiteSettings, type SiteSectionUpdate } from '@/lib/site-settings';
import { queryKeys } from '@/lib/query-keys';
import { useAdminWrite } from '@/hooks/use-admin-write';

export type { SiteSectionUpdate } from '@/lib/site-settings';

export function useSiteSettings() {
  const query = useQuery({ queryKey: queryKeys.siteSettings, queryFn: fetchSiteSettings, staleTime: 60_000 });
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
