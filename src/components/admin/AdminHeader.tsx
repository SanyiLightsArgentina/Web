import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ChevronRight, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
  section: string;
}

export function AdminHeader({ onLogout, section }: AdminHeaderProps) {
  return <header className="h-20 border-b border-border/70 bg-white/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-sm min-w-0"><span className="hidden sm:inline text-muted-foreground">Administración</span><ChevronRight className="hidden sm:block h-3.5 w-3.5 text-muted-foreground/60" /><span className="font-medium truncate">{section}</span></div>
    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
      <Button asChild variant="outline" size="sm" className="rounded-lg bg-white border-border"><Link to="/" target="_blank" rel="noopener noreferrer">Ver sitio<ArrowUpRight className="ml-1.5 h-3.5 w-3.5" /></Link></Button>
      <span className="h-5 w-px bg-border mx-1 hidden sm:block" aria-hidden="true" />
      <Button onClick={onLogout} variant="ghost" size="sm" className="rounded-lg text-muted-foreground" aria-label="Cerrar Sesión"><LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Cerrar Sesión</span></Button>
    </div>
  </header>;
}
