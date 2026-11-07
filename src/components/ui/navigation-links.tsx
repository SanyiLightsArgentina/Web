import type { MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Button } from './button'
import { useCatalog } from '@/hooks/use-catalog'
import { catalogHref } from '@/lib/catalog-location'

const entries = [
  { path: '/', label: 'Inicio' }, { path: '/productos', label: 'Productos' },
  { path: '/about', label: 'Sobre Nosotros' }, { path: '/videos', label: 'Videos' },
  { path: '/soporte', label: 'Soporte' }, { path: '#contacto', label: 'Contacto' },
]

export function NavigationLinks({ layout, onNavigate, onContact }: {
  layout: 'desktop' | 'mobile'; onNavigate?: () => void; onContact: (event: MouseEvent) => void
}) {
  const { pathname } = useLocation()
  const { categories } = useCatalog()
  const mobile = layout === 'mobile'
  const active = (path: string) => path === '/' ? pathname === '/' : pathname.startsWith(path)
  const categoryLinks = [{ key: 'all', label: 'Todos', to: catalogHref() }, ...categories.map(c => ({ key: String(c.id), label: c.name, to: catalogHref(c.name) }))]
  return <div className={mobile ? 'flex flex-col gap-4' : 'hidden xl:flex items-center gap-8'}>
    {entries.map(entry => {
      const selected = active(entry.path)
      const linkClass = mobile
        ? `flex items-center px-3 py-2 text-lg font-medium rounded-md transition-colors ${selected ? 'bg-primary text-white' : 'hover:bg-muted'}`
        : `transition-all duration-300 px-4 py-2 rounded-md ${selected ? 'bg-primary text-white' : 'text-white hover:bg-white/20'}`
      if (entry.path === '#contacto') return <a key={entry.path} href={entry.path} className={linkClass} onClick={event => { onContact(event); onNavigate?.() }}>{entry.label}</a>
      if (entry.path !== '/productos') return <Link key={entry.path} to={entry.path} className={linkClass} onClick={onNavigate}>{entry.label}</Link>
      return <div key={entry.path} className={mobile ? 'flex flex-col gap-2' : 'group relative'}>
        {mobile ? <div className={`px-3 py-2 text-lg font-medium ${selected ? 'text-primary' : 'text-muted-foreground'}`}>{entry.label}</div> : <Button variant="ghost" className={`${linkClass} flex items-center gap-1`}>{entry.label}<ChevronDown data-icon="inline-end" /></Button>}
        <div className={mobile ? 'flex flex-col gap-1' : 'absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200'}>
          {categoryLinks.map(category => <Link key={category.key} to={category.to} onClick={onNavigate} className={mobile ? 'flex items-center px-6 py-2 text-base hover:bg-muted rounded-md transition-colors w-full text-left' : 'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md'}>{category.label}</Link>)}
        </div>
      </div>
    })}
  </div>
}
