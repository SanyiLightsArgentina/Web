import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSiteSettings, saveSiteSection } from '@/lib/site-settings-api';
import { parseSiteSettings, type SiteSectionUpdate } from '@/lib/site-settings';
import { queryKeys } from '@/lib/query-keys';

export type { SiteSectionUpdate } from '@/lib/site-settings';

export function useSiteSettings() {
  const query = useQuery({ queryKey: queryKeys.siteSettings, queryFn: fetchSiteSettings, staleTime: 60_000 });
  return { ...query, settings: query.data ?? parseSiteSettings(null) };
}

export function useSaveSiteSection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (update: SiteSectionUpdate) => saveSiteSection(update),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.siteSettings }),
        client.invalidateQueries({ queryKey: queryKeys.categories }),
      ]);
    },
  });
}
