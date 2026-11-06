import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

interface LoginFormProps {
  onAuthenticate: (username: string, password: string) => Promise<void>;
  loading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onAuthenticate, loading = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Ingresá el nombre de usuario' });
      return;
    }
    if (!password.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Ingresá la contraseña' });
      return;
    }
    try {
      await onAuthenticate(username.trim(), password);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: 'Usuario o contraseña incorrectos. Verificá tus credenciales.',
      });
    }
  };

  return (
    <main className="relative min-h-svh flex flex-col items-center justify-center bg-muted/40 px-4 py-10 sm:py-16 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative w-full max-w-[440px]">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded">
          <ArrowLeft className="h-4 w-4" />Volver al sitio
        </Link>
        <section aria-labelledby="login-title" className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-[0_16px_60px_-24px_hsl(0_0%_15%/0.18)]">
          <div className="flex items-center gap-3 mb-9">
            <img src={logo} alt="Sanyi Lights" className="h-12 w-16 object-contain" />
            <div className="border-l border-border pl-3">
              <p className="text-sm font-semibold tracking-tight">Sanyi Lights</p>
              <p className="text-xs text-muted-foreground mt-0.5">Argentina</p>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-3">Administración</p>
          <h1 id="login-title" className="text-3xl font-bold tracking-tight text-foreground mb-3">Bienvenido de nuevo</h1>
          <p className="text-sm leading-relaxed text-muted-foreground mb-8">Ingresá para gestionar el catálogo y el contenido de tu sitio.</p>
          <form onSubmit={handleSubmit} aria-busy={loading} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Usuario</Label>
              <div className="relative">
                <UserRound aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="username" name="username" type="text" value={username} onChange={event => setUsername(event.target.value)} placeholder="Usuario de administrador" autoComplete="username" autoCapitalize="none" spellCheck={false} disabled={loading} required className="h-12 pl-10 bg-background border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <div className="relative">
                <LockKeyhole aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="Contraseña de administrador" autoComplete="current-password" disabled={loading} required className="h-12 pl-10 pr-12 bg-background border border-border rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary" />
                <button type="button" onClick={() => setShowPassword(visible => !visible)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} disabled={loading} className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold shadow-sm !mt-7">
              {loading ? <><Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />Verificando...</> : <>Iniciar Sesión<ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </section>
        <p className="mt-7 text-center text-xs text-muted-foreground">Sanyi Lights Argentina · Panel de administración</p>
      </div>
    </main>
  );
};
