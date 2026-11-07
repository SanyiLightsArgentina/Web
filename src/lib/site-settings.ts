export interface HeroSlide {
  type: 'image' | 'video';
  src: string;
  title: string;
  subtitle: string;
  productRoute: string;
  new: boolean;
}
export interface SiteVideo { id: string; title: string; url: string }
export interface ContactSettings {
  phone: string; phoneLabel: string; email: string; address: string;
  city: string; hours: string; instagram: string; facebook: string;
}
export interface SiteClient { id: string; company: string; logo: string; link: string }
export interface SiteSettings {
  clients: SiteClient[];
  hero: HeroSlide[];
  videos: { items: SiteVideo[]; channelUrl: string };
  contact: ContactSettings;
  category_order: number[];
}
export const defaultSettings: SiteSettings = {
  hero: [
  {
    type: "video",
    src: "https://youtu.be/V8Z_ymp_-kg",
    title: "SPL-LED-1260S",
    subtitle: "12*60W LED MOVING BAR ZOOM",
    productRoute: "/producto/SPL-LED-1260S",
    new: false
  },
  {
    type: "video",
    src: "https://www.youtube.com/watch?v=vYeNbPc0vc4&t=12s",
    title: "SPL-LED-M1260YZ IP",
    subtitle: "12*60W LED moving bar zoom",
    productRoute: "/producto/SPL-LED-M1260YZ IP",
    new: true
  },
  {
    type: "video",
    src: "https://youtu.be/bDumjs4uDW8",
    title: "SPL-LED-M700W Profile IP",
    subtitle: "LED Moving Head Lights",
    productRoute: "/producto/SPL-LED-M700W Profile IP",
    new: true
  }
],
  videos: { items: [
    {
      id: "j2QAAahiwI8",
      title: "GUSTTAVO LIMA BUTECO GYN AFTERMOVIE1",
      url: "https://www.youtube.com/watch?v=j2QAAahiwI8"
    },
    {
      id: "uNGhhmi-BhA",
      title: "Laser derby SPL-LED-020M-A3",
      url: "https://www.youtube.com/watch?v=uNGhhmi-BhA&t=39s"
    },
    {
      id: "PLLYJxoyyR8",
      title: "12*40W LED zoom moving bar",
      url: "https://www.youtube.com/watch?v=PLLYJxoyyR8"
    },
    {
      id: "Y7igAG0c3Jo",
      title: "SPL-LED-1940 IP",
      url: "https://www.youtube.com/watch?v=Y7igAG0c3Jo"
    },
    {
      id: "oTRCoCKXDDU",
      title: "Rubik Economic Rubik",
      url: "https://www.youtube.com/watch?v=oTRCoCKXDDU"
    },
    {
      id: "wB5X6ttS6e0",
      title: "SPL-LED-740",
      url: "https://www.youtube.com/watch?v=wB5X6ttS6e0"
    },
    {
      id: "RTfdyBXasYg",
      title: "200W LED BSW moving head",
      url: "https://www.youtube.com/watch?v=RTfdyBXasYg"
    },
    {
      id: "5j-uRe7y8wE",
      title: "Lade Buteco2023",
      url: "https://www.youtube.com/watch?v=5j-uRe7y8wE"
    },
    {
      id: "MBfeXkHwYIg",
      title: "SPL-RGB-623",
      url: "https://www.youtube.com/watch?v=MBfeXkHwYIg&t=4s"
    }
  ], channelUrl: 'https://www.youtube.com/@yispark' },
  contact: {
    phone: '5491171388885', phoneLabel: '(+54 9) 11 7138-8885',
    email: 'ventas@sanyilights.com', address: 'Chile 1380, C.A.B.A',
    city: 'Ciudad Autónoma', hours: 'Lun-Vie 9:00-18:00',
    instagram: 'https://www.instagram.com/sanyilightsar/',
    facebook: 'https://www.facebook.com/sanyilightsusa',
  },
  category_order: [],
  clients: [],
};

export interface SiteSettingsRow {
  key: string
  value: unknown
}

type JsonRecord = Record<string, unknown>

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback

const asBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback

const clone = <T,>(value: T): T => structuredClone(value)

function parseHero(value: unknown): HeroSlide[] {
  if (!Array.isArray(value)) return clone(defaultSettings.hero)
  const slides = value.flatMap((item): HeroSlide[] => {
    if (!isRecord(item)) return []
    const type = item.type === 'image' || item.type === 'video' ? item.type : null
    if (
      !type ||
      typeof item.src !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.subtitle !== 'string' ||
      typeof item.productRoute !== 'string'
    ) return []
    return [{
      type,
      src: item.src,
      title: item.title,
      subtitle: item.subtitle,
      productRoute: item.productRoute,
      new: asBoolean(item.new, false),
    }]
  })
  return slides.length > 0 ? slides : clone(defaultSettings.hero)
}

function parseVideos(value: unknown): SiteSettings['videos'] {
  if (!isRecord(value)) return clone(defaultSettings.videos)
  const items = Array.isArray(value.items)
    ? value.items.flatMap((item): SiteVideo[] => {
        if (!isRecord(item) || typeof item.id !== 'string' || typeof item.title !== 'string' || typeof item.url !== 'string') return []
        return [{ id: item.id, title: item.title, url: item.url }]
      })
    : clone(defaultSettings.videos.items)

  return {
    items: items.length > 0 ? items : clone(defaultSettings.videos.items),
    channelUrl: asString(value.channelUrl, defaultSettings.videos.channelUrl),
  }
}

function parseContact(value: unknown): ContactSettings {
  if (!isRecord(value)) return clone(defaultSettings.contact)
  return {
    phone: asString(value.phone, defaultSettings.contact.phone),
    phoneLabel: asString(value.phoneLabel, defaultSettings.contact.phoneLabel),
    email: asString(value.email, defaultSettings.contact.email),
    address: asString(value.address, defaultSettings.contact.address),
    city: asString(value.city, defaultSettings.contact.city),
    hours: asString(value.hours, defaultSettings.contact.hours),
    instagram: asString(value.instagram, defaultSettings.contact.instagram),
    facebook: asString(value.facebook, defaultSettings.contact.facebook),
  }
}

function parseCategoryOrder(value: unknown): number[] {
  if (!Array.isArray(value)) return clone(defaultSettings.category_order)
  return value.filter((id): id is number => Number.isInteger(id) && id >= 0)
}

function parseClients(value: unknown): SiteClient[] {
  if (!Array.isArray(value)) return clone(defaultSettings.clients)
  return value.flatMap((item): SiteClient[] => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.company !== 'string') return []
    return [{
      id: item.id,
      company: item.company,
      logo: asString(item.logo, ''),
      link: asString(item.link, ''),
    }]
  })
}

/**
 * Turns the stored rows into a complete SiteSettings value. Every section is
 * parsed on its own, so a partial or invalid row falls back to that section's
 * defaults instead of replacing the whole object.
 */
export function parseSiteSettings(rows: readonly SiteSettingsRow[] | null | undefined): SiteSettings {
  const settings = clone(defaultSettings)
  for (const row of rows ?? []) {
    if (!isRecord(row) || typeof row.key !== 'string') continue
    switch (row.key) {
      case 'hero':
        settings.hero = parseHero(row.value)
        break
      case 'videos':
        settings.videos = parseVideos(row.value)
        break
      case 'contact':
        settings.contact = parseContact(row.value)
        break
      case 'category_order':
        settings.category_order = parseCategoryOrder(row.value)
        break
      case 'clients':
        settings.clients = parseClients(row.value)
        break
      default:
        break
    }
  }
  return settings
}

export function isWebUrl(value: string): boolean {
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
}
