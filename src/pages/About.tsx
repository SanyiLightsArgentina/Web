import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Truck, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { Footer } from "@/components/sections/Footer";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useCarousel } from '@/hooks/use-carousel';
import mapImage from "@/assets/map.jpeg";
import prof2Small from "@/assets/prof2-800.webp";
import prof2Medium from "@/assets/prof2-1200.webp";
import prof2Large from "@/assets/prof2-2400.webp";
import prof3Small from "@/assets/prof3-800.webp";
import prof3Medium from "@/assets/prof3-1200.webp";
import prof3Large from "@/assets/prof3-2400.webp";
import professionalLightingEventSmall from "@/assets/professional-lighting-event-800.webp";
import professionalLightingEventLarge from "@/assets/professional-lighting-event-1200.webp";
import messiSmall from "@/assets/messi-400.webp";
import messiLarge from "@/assets/messi-800.webp";

const professionalImages = [
  {
    src: prof3Large,
    srcSet: `${prof3Small} 800w, ${prof3Medium} 1200w, ${prof3Large} 2400w`,
    title: "Iluminación Profesional",
    subtitle: "Lideres con +23 años de experiencia en equipos de iluminación escénica"
  },
  {
    src: prof2Large,
    srcSet: `${prof2Small} 800w, ${prof2Medium} 1200w, ${prof2Large} 2400w`,
    title: "Tecnología Avanzada",
    subtitle: "Cabezal movil LED, LED displays y consolas DMX"
  },
  {
    src: professionalLightingEventLarge,
    srcSet: `${professionalLightingEventSmall} 800w, ${professionalLightingEventLarge} 1200w`,
    title: "Solicita Asesoramiento",
    subtitle: "Te ayudamos a elegir la mejor iluminación para tu evento"
  },
  {
    src: messiLarge,
    srcSet: `${messiSmall} 400w, ${messiLarge} 800w`,
    title: "Distribuidor Oficial",
    subtitle: "Representante exclusivo de Sanyi Lights en Argentina"
  },
];

const About = () => {
  const { index: currentImageIndex, goTo: goToImage, touchHandlers } = useCarousel(professionalImages.length, 5_000);
  const [loadedImages, setLoadedImages] = useState<number[]>([0]);
  const preloadedAllRef = useRef(false);

  const loadRemainingImages = () => {
    if (preloadedAllRef.current) return;
    preloadedAllRef.current = true;
    // The first slide is already visible; load the rest now that they no longer
    // compete with it for bandwidth on the initial page load.
    setLoadedImages(professionalImages.map((_, index) => index));
  };

  useSEO({
    title: "Nosotros",
    description:
      "Más de 23 años de experiencia en iluminación escénica. Distribuidor oficial de Sanyi Lights en Argentina. Tecnología LED y consolas DMX.",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setLoadedImages(previous => previous.includes(currentImageIndex) ? previous : [...previous, currentImageIndex]);
  }, [currentImageIndex]);

  
  return (
    <div className="min-h-screen bg-background">
      <Navigation isTransparent={false} />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary text-primary-foreground">
              Sobre Nosotros
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tu Nuevo Socio Confiable de Iluminación
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Más de 23 años de experiencia en iluminación profesional, 
              entregando soluciones de alta calidad a la industria del entretenimiento mundial.
            </p>
          </div>

          {/* Carousel de Imágenes Profesionales */}
          <div className="mb-20">
            <div className="relative h-96 lg:h-[500px] overflow-hidden rounded-lg shadow-2xl">
              <div 
                className="absolute inset-0"
                {...touchHandlers}
              >
                {professionalImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {loadedImages.includes(index) && (
                      <img
                        src={image.src}
                        srcSet={image.srcSet}
                        sizes="(min-width: 1440px) 1400px, 100vw"
                        alt={image.title}
                        className="w-full h-full object-cover"
                        decoding="async"
                        onLoad={index === currentImageIndex ? loadRemainingImages : undefined}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
                  </div>
                ))}
              </div>

              {/* Texto por encima */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center text-white max-w-4xl px-6">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {professionalImages[currentImageIndex].title}
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl opacity-90 leading-relaxed">
                    {professionalImages[currentImageIndex].subtitle}
                  </p>
                </div>
              </div>

              {/* Navigation Buttons - Bottom Right */}
              <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
                {professionalImages.map((_, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    onClick={() => goToImage(index)}
                    className={`w-8 h-8 rounded-full p-0 transition-all duration-700 font-bold text-sm relative overflow-hidden group ${
                      index === currentImageIndex
                        ? 'bg-gradient-to-br from-white via-white to-gray-100 text-black scale-125 shadow-2xl shadow-white/50 border-2 border-white/60 hover:scale-110'
                        : 'bg-gradient-to-br from-black/30 via-black/20 to-transparent text-white/90 hover:scale-110 hover:bg-gradient-to-br hover:from-white/20 hover:via-white/15 hover:to-transparent hover:text-white border border-white/20 hover:border-white/40'
                    }`}
                  >
                    <span className="relative z-10">{index + 1}</span>
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Historia */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Nuestra Historia</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Sanyi Lights Argentina es el representante exclusivo de Sanyi Lights en Argentina, 
                  con más de 23 años de experiencia en equipos de iluminación escénica. 
                  Somos especialistas en iluminación profesional para eventos, espectáculos 
                  y producciones audiovisuales.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Con nuestro equipo local de expertos, ofrecemos soporte técnico, 
                  servicio de garantía y asistencia al cliente, respaldados por la 
                  calidad y confiabilidad de Sanyi Lights.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">23+</div>
                    <div className="text-sm text-muted-foreground">Años de Experiencia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                    <div className="text-sm text-muted-foreground">Proyectos Completados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">50+</div>
                    <div className="text-sm text-muted-foreground">Países Servidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                    <div className="text-sm text-muted-foreground">Soporte Técnico</div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Presencia Global */}
          <div className="mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16">Nuestra Presencia Global</h2>
            
            {/* Mapa */}
            <div className="mb-16 -mx-4 lg:-mx-8">
              <div className="w-full h-96 lg:h-[600px] xl:h-[700px]">
                <img 
                  src={mapImage} 
                  alt="Mapa de Presencia Global de Sanyi Lights" 
                  className="w-full h-full object-contain object-center"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="text-center bg-primary/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">¿Listo para tu próximo proyecto?</h2>
            <p className="text-muted-foreground mb-6">
              Contáctanos para obtener asesoramiento especializado y cotizaciones personalizadas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-primary hover:bg-primary/90" >
                  Ver Productos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
