import { BarChart3, Building2, Contact, FolderOpen, ImagePlay, Package, Video } from 'lucide-react';

export const adminSections = [
  { value: 'products', label: 'Productos', group: 'Catálogo', icon: Package, description: 'Organizá tus equipos y mantené el catálogo actualizado.' },
  { value: 'categories', label: 'Categorías', group: 'Catálogo', icon: FolderOpen, description: 'Organizá las categorías y elegí el orden en que aparecen en el sitio.' },
  { value: 'hero', label: 'Hero', group: 'Contenido del sitio', icon: ImagePlay, description: 'Elegí las imágenes y los videos que dan la bienvenida a tu sitio.' },
  { value: 'videos', label: 'Videos', group: 'Contenido del sitio', icon: Video, description: 'Mostrá tus equipos en acción y administrá los videos de la web.' },
  { value: 'contact', label: 'Contacto', group: 'Contenido del sitio', icon: Contact, description: 'Mantené al día los datos con los que tus clientes se comunican.' },
  { value: 'clients', label: 'Clientes', group: 'Contenido del sitio', icon: Building2, description: 'Dale un lugar a las empresas que trabajan con Sanyi Lights.' },
  { value: 'overview', label: 'Resumen', group: 'General', icon: BarChart3, description: 'Una mirada al contenido y los equipos de tu catálogo.' },
] as const;
