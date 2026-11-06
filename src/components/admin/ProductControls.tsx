import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { useSupabaseCategories } from '@/hooks/use-supabase-categories';

interface ProductControlsProps {
  searchTerm: string;
  selectedCategoryId: number | null;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onAddProduct: () => void;
}

export function ProductControls({ searchTerm, selectedCategoryId, onSearchChange, onCategoryChange, onAddProduct }: ProductControlsProps) {
  const { categories } = useSupabaseCategories();
  return <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
    <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
      <div className="relative flex-1 max-w-lg"><Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar productos" placeholder="Buscar productos..." value={searchTerm} onChange={event => onSearchChange(event.target.value)} className="pl-10 h-11 bg-white border border-border rounded-xl" /></div>
      <div className="relative sm:w-56 shrink-0"><select aria-label="Filtrar por categoría" value={selectedCategoryId || ''} onChange={event => onCategoryChange(event.target.value ? Number(event.target.value) : null)} className="appearance-none w-full h-11 pl-3.5 pr-9 border border-border rounded-xl bg-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"><option value="">Todas las categorías</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /></div>
    </div>
    <Button onClick={onAddProduct} className="h-11 rounded-xl whitespace-nowrap px-5"><Plus className="h-4 w-4 mr-2" />Agregar Producto</Button>
  </div>;
}
