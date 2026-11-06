import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSiteSettings, saveSiteSection } from '@/lib/site-settings-api';
import { defaultSettings, type SiteSettings } from '@/lib/site-settings';

export const siteSettingsKey = ['site-settings'];
export function useSiteSettings() {
  const query = useQuery({ queryKey: siteSettingsKey, queryFn: fetchSiteSettings, staleTime: 60_000 });
  return { ...query, settings: query.data ?? defaultSettings };
}
export function useSaveSiteSection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: keyof SiteSettings; value: SiteSettings[keyof SiteSettings] }) => saveSiteSection(key, value),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: siteSettingsKey }),
        client.invalidateQueries({ queryKey: ['categories'] }),
      ]);
    },
  });
}
