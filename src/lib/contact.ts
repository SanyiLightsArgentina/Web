import { toast } from '@/hooks/use-toast';
import { queryClient } from './query-client';
import { queryKeys, SITE_SETTINGS_STALE_TIME_MS } from './query-keys';
import { supabase } from './supabase';
import { createSupabaseCatalogStore } from './catalog-store';

async function contact(message: string) {
  const popup = window.open('about:blank', '_blank');
  if (popup) popup.opener = null;
  try {
    const read = createSupabaseCatalogStore(supabase);
    const { contact } = await queryClient.fetchQuery({
      queryKey: queryKeys.siteSettings,
      queryFn: () => read.loadSiteSettings(),
      staleTime: SITE_SETTINGS_STALE_TIME_MS,
    });
    const url = `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`;
    if (popup) popup.location.href = url;
    else window.location.assign(url);
  } catch {
    popup?.close();
    toast({ title: 'No se pudo cargar el contacto', description: 'Volvé a intentar.', variant: 'destructive' });
  }
}

export const openWhatsApp = () => {
  const message = "Hola! Me interesa conocer más sobre sus productos de iluminación profesional.\n\nMuchas gracias!";
  void contact(message);
};

export const openWhatsAppForModel = (model: string) => {
  const message = `Hola! Quisiera cotizar el modelo: ${model}\n\nMuchas gracias!`;
  void contact(message);
};

export const openWhatsAppForModels = (models: string[]) => {
  const pretty = models.map((m, i) => `${i + 1}. ${m}`).join("\n");
  const message = `Hola! Quisiera cotizar los siguientes modelos:\n\n${pretty}\n\nMuchas gracias!`;
  void contact(message);
};
