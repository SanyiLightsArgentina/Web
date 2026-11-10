import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Image as ImageIcon, Video, FileText } from 'lucide-react';
import type { ProductPresentation } from '@/lib/product-presentation';

interface ProductCardProps {
  presentation: ProductPresentation;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ presentation, onEdit, onDelete }: ProductCardProps) {
  const { counts } = presentation;
  return <article className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_140px_100px] xl:grid-cols-[minmax(0,1fr)_140px_160px_100px] items-center gap-3 sm:gap-5 px-4 sm:px-5 py-4 transition-colors hover:bg-muted/20">
    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-muted/30 border border-border/50 p-1.5 flex items-center justify-center shrink-0">{counts.images ? <img src={presentation.thumbImage} alt={presentation.model} loading="lazy" className="w-full h-full object-contain" /> : <ImageIcon className="h-6 w-6 text-muted-foreground/50" />}</div>
      <div className="min-w-0"><div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1"><h3 className="text-sm font-semibold text-foreground break-words">{presentation.model}</h3>{presentation.isNew && <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 text-[10px] px-2 py-0.5 font-medium">Nuevo</Badge>}</div><p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{presentation.description}</p><p className="md:hidden text-[11px] text-muted-foreground mt-1.5">{presentation.categoryLabel}</p></div>
    </div>
    <div className="hidden md:block"><Badge variant="outline" className="font-normal text-muted-foreground text-[11px] border-border bg-muted/20 whitespace-normal">{presentation.categoryLabel}</Badge></div>
    <div className="hidden xl:flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-label={`${counts.images} imágenes, ${counts.contents} archivos y ${counts.videos} videos`}>
      <span title={`${counts.images} imágenes`} className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" />{counts.images}</span><span title={`${counts.contents} archivos`} className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{counts.contents}</span><span title={`${counts.videos} videos`} className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5" />{counts.videos}</span>
    </div>
    <div className="flex items-center justify-end gap-1">
      <Button onClick={onEdit} variant="ghost" size="sm" aria-label={`Editar ${presentation.model}`} title="Editar producto" className="h-10 w-10 sm:w-auto px-2 rounded-lg text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /><span className="hidden sm:inline ml-1.5 text-xs">Editar</span></Button>
      <Button onClick={onDelete} variant="ghost" size="sm" aria-label={`Eliminar ${presentation.model}`} title="Eliminar producto" className="h-10 w-9 p-0 rounded-lg text-muted-foreground/60 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
    </div>
  </article>;
}
