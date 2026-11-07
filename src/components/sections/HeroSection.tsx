import { useSiteSettings } from '@/hooks/use-site-settings';
import { type HeroSlide } from '@/lib/site-settings';
import { parseVideoSource } from '@/lib/video-source';
import { Button } from "@/components/ui/button";
import { ArrowRight} from "lucide-react";
import { useCarousel } from '@/hooks/use-carousel';
import { useNavigate } from "react-router-dom";
import { useCatalog } from "@/hooks/use-catalog";
import { findProductByModel } from "@/lib/catalog";


export const HeroSection = () => {
  const { settings } = useSiteSettings();
  const professionalVideos = settings.hero;
  const { index: activeIndex, goTo: goToImage, touchHandlers } = useCarousel(professionalVideos.length, 10_000);
  const navigate = useNavigate();
  const { products, isLoaded } = useCatalog();

  const handleProductClick = (productRoute: string) => {
    window.scrollTo(0, 0);
    const model = productRoute.replace('/producto/', '');
    const decodedModel = decodeURIComponent(model);
    
    if (isLoaded && products.length > 0) {
      const product = findProductByModel(products, decodedModel);
      if (product) {
        navigate(productRoute);
      } else {
        navigate('/productos');
      }
    } else {
      navigate(productRoute);
    }
  };

  const activeVideo = professionalVideos[activeIndex];

  const renderVideoContent = (video: HeroSlide) => {
    if (video.type === 'image') return <img src={video.src} alt={video.title} className="w-full h-full object-cover" />;
    const source = parseVideoSource(video.src);
    if (source.kind !== 'youtube') return <video key={video.src} src={video.src} autoPlay muted loop playsInline className="w-full h-full object-cover" />;
    return (
      <iframe
        key={video.src}
        src={source.heroEmbedUrl}
        title={video.title}
        className="w-full h-full object-cover"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0"
        {...touchHandlers}
      >
        <div className="absolute inset-0">
          {renderVideoContent(activeVideo)}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
        {professionalVideos.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            onClick={() => goToImage(index)}
            className={`w-8 h-8 rounded-full p-0 transition-all duration-700 font-bold text-sm relative overflow-hidden group ${
              index === activeIndex
                ? 'bg-gradient-to-br from-white via-white to-gray-100 text-black scale-125 shadow-2xl shadow-white/50 border-2 border-white/60 hover:scale-110'
                : 'bg-gradient-to-br from-black/30 via-black/20 to-transparent text-white/90 hover:scale-110 hover:bg-gradient-to-br hover:from-white/20 hover:via-white/15 hover:to-transparent hover:text-white border border-white/20 hover:border-white/40'
            }`}
          >
            <span className="relative z-10">{index + 1}</span>
            {index === activeIndex && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </Button>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 h-screen flex items-center">
        <div className="w-full">
          <div className="max-w-4xl text-white mb-8 sm:mb-12 mx-auto text-center">
            <div className="animate-fade-in">
              {activeVideo.new && (
                <div className="mb-6">
                  <span className="inline-block bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white font-bold text-base sm:text-lg px-6 py-3 rounded-full shadow-2xl border-2 border-white/20 animate-pulse">
                    NUEVO
                  </span>
                </div>
              )}
              
              <h1 
                key={activeIndex} 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight animate-in slide-in-from-bottom-8 duration-1500 ease-out"
              >
                {activeVideo.title}
              </h1>
              
              <p
                key={`subtitle-${activeIndex}`}
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed animate-in slide-in-from-bottom-8 duration-1500 ease-out delay-300"
              >
                {activeVideo.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Button 
                  size="lg" 
                  onClick={() => handleProductClick(activeVideo.productRoute)}
                  className="bg-white text-black hover:bg-red-600 hover:text-white shadow-elegant group w-auto text-base sm:text-lg lg:text-xl px-6 sm:px-8 py-6 sm:py-8 font-bold tracking-wide hover:scale-105 transition-all duration-300"
                >
                  DESCUBRILO
                  <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
