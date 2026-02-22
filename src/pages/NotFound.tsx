import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, Lightbulb, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { getButtonClasses } from "@/lib/colors";
import { useSEO } from "@/hooks/useSEO";

const NotFound = () => {
  const location = useLocation();

  useSEO({
    title: "Página no encontrada",
    description: "La página que buscás no existe. Volvé al inicio o explorá nuestros productos.",
    noIndex: true,
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Efectos de luz de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Número 404 con efectos */}
          <div className="relative mb-8">
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 bg-clip-text mb-4">
              404
            </h1>
            <div className="absolute inset-0 text-8xl md:text-9xl font-black text-white/5 blur-sm">
              404
            </div>
          </div>

          {/* Iconos de iluminación */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <Lightbulb className="h-8 w-8 text-yellow-400 animate-pulse" />
            <Zap className="h-8 w-8 text-blue-400 animate-pulse delay-300" />
            <Lightbulb className="h-8 w-8 text-purple-400 animate-pulse delay-600" />
          </div>

          {/* Título y descripción */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            ¡Ups! Página no encontrada
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Parece que esta página se apagó. No te preocupes, tenemos muchas otras luces encendidas para ti.
          </p>

          {/* Información adicional */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
            <p className="text-gray-400 mb-2">
              <strong>Ruta intentada:</strong> {location.pathname}
            </p>
            <p className="text-sm text-gray-500">
              Si crees que esto es un error, no dudes en contactarnos
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/">
              <Button size="lg" className={`${getButtonClasses('primary')} group`}>
                <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Volver al Inicio
              </Button>
            </Link>
            
            <Link to="/productos">
              <Button size="lg" variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/20 group">
                <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Explorar Productos
              </Button>
            </Link>
          </div>

          {/* Enlaces rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Link to="/productos" className="group">
              <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all duration-300 group-hover:scale-105">
                <h3 className="text-white font-semibold mb-2">Productos</h3>
                <p className="text-gray-400 text-sm">Descubre nuestra línea de iluminación profesional</p>
              </div>
            </Link>
            
            <Link to="/about" className="group">
              <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all duration-300 group-hover:scale-105">
                <h3 className="text-white font-semibold mb-2">Sobre Nosotros</h3>
                <p className="text-gray-400 text-sm">Conoce nuestra experiencia y trayectoria</p>
              </div>
            </Link>
            
            <Link to="/videos" className="group">
              <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all duration-300 group-hover:scale-105">
                <h3 className="text-white font-semibold mb-2">Videos</h3>
                <p className="text-gray-400 text-sm">Mira nuestros proyectos y eventos</p>
              </div>
            </Link>
          </div>

          {/* Mensaje de contacto */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
            <p className="text-gray-300 mb-4">
              ¿Necesitas ayuda para encontrar algo específico?
            </p>
            <Button 
              variant="outline" 
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              onClick={() => window.open('https://wa.me/+5491112345678', '_blank')}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Contactar por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
