import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSiteSettings, saveSiteSection } from '@/lib/site-settings-api';
import { parseSiteSettings, type SiteSettings } from '@/lib/site-settings';
import { queryKeys } from '@/lib/query-keys';

export const siteSettingsKey = queryKeys.siteSettings;

export type SiteSectionUpdate = {
  [K in keyof SiteSettings]: { key: K; value: SiteSettings[K] }
}[keyof SiteSettings];

export function useSiteSettings() {
  const query = useQuery({ queryKey: siteSettingsKey, queryFn: fetchSiteSettings, staleTime: 60_000 });
  return { ...query, settings: query.data ?? parseSiteSettings(null) };
}

export function useSaveSiteSection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (update: SiteSectionUpdate) => saveSiteSection(update.key, update.value as never),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: siteSettingsKey }),
        client.invalidateQueries({ queryKey: queryKeys.categories }),
      ]);
    },
  });
}
