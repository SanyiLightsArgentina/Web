import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { adminSections } from './admin-sections';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import logo from '@/assets/logo.png';



export function AdminNavigation() {
  return <aside className="min-w-0 border-b bg-white lg:border-b-0 lg:border-r lg:sticky lg:top-0 lg:h-svh lg:flex lg:flex-col">
    <Link to="/" className="flex items-center gap-3 px-5 h-20 border-b border-border/60 shrink-0">
      <img src={logo} alt="Sanyi Lights" className="w-14 h-11 object-contain" />
      <div><span className="block text-sm font-bold tracking-tight">Sanyi Lights</span><span className="block text-xs text-muted-foreground mt-0.5">Administración</span></div>
    </Link>
    <nav aria-label="Administración" className="p-3 lg:p-4 min-w-0">
      <TabsList aria-label="Secciones del panel" className="flex w-full h-auto justify-start items-stretch gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-none bg-transparent p-0 lg:flex-col lg:overflow-visible">
        {adminSections.map((section, index) => <Fragment key={section.value}>
          {(index === 0 || section.group !== adminSections[index - 1].group) && <span className={`hidden lg:block px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground ${index ? 'pt-6' : 'pt-3'}`}>{section.group}</span>}
          <TabsTrigger value={section.value} className="justify-start gap-2.5 shrink-0 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60 data-[state=active]:bg-primary/[0.07] data-[state=active]:text-primary data-[state=active]:shadow-none">
            <section.icon className="h-[18px] w-[18px]" aria-hidden="true" />{section.label}
          </TabsTrigger>
        </Fragment>)}
      </TabsList>
    </nav>
    <p className="hidden lg:block mt-auto p-7 text-[11px] text-muted-foreground">Sanyi Lights Argentina</p>
  </aside>;
}
