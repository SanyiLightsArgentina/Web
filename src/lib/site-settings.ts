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

export function youtubeId(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? url.pathname.slice(1) :
      ['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)
        ? url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] : null;
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
export function isWebUrl(value: string): boolean {
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
}

export function isDirectVideoUrl(value: string): boolean {
  if (!isWebUrl(value)) return false;
  try { return /\.(mp4|webm|m4v|mov)$/i.test(new URL(value).pathname); } catch { return false; }
}
