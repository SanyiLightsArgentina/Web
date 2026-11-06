import { useSiteSettings } from '@/hooks/use-site-settings';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
} from "lucide-react";

import logo from "/src/assets/logo.png";

export const Footer = () => {
  const { settings: { contact } } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          
          <div className="space-y-2 md:space-y-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <img 
                src={logo}
                alt="Sanyi Lights Argentina" 
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-6 h-6 md:w-8 md:h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <span class="text-white text-xs font-bold">SL</span>
                      </div>
                    `;
                  }
                }}
              />
              <div>
                <h3 className="text-sm md:text-lg lg:text-xl font-bold">Sanyi Lights</h3>
                <p className="text-xs text-gray-400">Argentina</p>
              </div>
            </div>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              Especialistas en iluminación profesional para eventos, espectáculos y producciones audiovisuales. 
              Más de 23 años de experiencia en el mercado.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white h-8 w-8 md:h-10 md:w-10"
                onClick={() => window.open(contact.facebook, '_blank')}
              >
                <Facebook className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white h-8 w-8 md:h-10 md:w-10"
                onClick={() => window.open(contact.instagram, '_blank')}
              >
                <Instagram className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 md:space-y-4">
            <h4 className="text-sm md:text-base lg:text-lg font-semibold">WhatsApp</h4>
            <div className="flex items-center space-x-2 md:space-x-3">
              <Phone className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
              <div>
                <p className="text-xs md:text-sm font-medium">{contact.phoneLabel}</p>
                <p className="text-xs text-gray-400">Contacto directo</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:space-y-4">
            <h4 className="text-sm md:text-base lg:text-lg font-semibold">Email</h4>
            <div className="flex items-center space-x-2 md:space-x-3">
              <Mail className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
              <div>
                <p className="text-xs md:text-sm font-medium">{contact.email}</p>
                <p className="text-xs text-gray-400">Consultas comerciales</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:space-y-4">
            <h4 className="text-sm md:text-base lg:text-lg font-semibold">Ubicación</h4>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center space-x-2 md:space-x-3">
                <MapPin className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
                <div>
                  <p className="text-xs md:text-sm font-medium">{contact.address}</p>
                  <p className="text-xs text-gray-400">{contact.city}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-red-400" />
                <div>
                  <p className="text-xs md:text-sm font-medium">{contact.hours}</p>
                  <p className="text-xs text-gray-400">Horario comercial</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4 md:my-8 bg-gray-700" />
        
        <div className="text-xs md:text-sm text-gray-400 text-center">
          © {currentYear} Sanyi Lights Argentina. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}; 