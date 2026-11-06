import { useState } from 'react';
import { Building2 } from 'lucide-react';

export function ClientLogo({ company, src }: { company: string; src: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return src && src !== failedSrc ? <img src={src} alt={`Logo de ${company}`} loading="lazy" className="max-w-full max-h-full object-contain" onError={() => setFailedSrc(src)} /> : <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-muted text-muted-foreground" aria-label={`Logo de ${company} pendiente`}><Building2 className="h-8 w-8" aria-hidden="true" /></div>;
}
