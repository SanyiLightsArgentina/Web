import { Button } from "@/components/ui/button";
import { ArrowRight} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useProductsWithCategories } from "@/hooks/use-products-with-categories";
import { getProductByModel } from "@/lib/product-utils";

const getStorageVideoUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(path);
  return data.publicUrl;
};

const professionalVideos = [
  {
    src: getStorageVideoUrl("video1.mp4"),
    title: "SPL-LED-1260S",
    subtitle: "12*60W LED MOVING BAR ZOOM",
    productRoute: "/producto/SPL-LED-1260S",
    type: "local",
    new: false
  },
  {
    src: "https://www.youtube.com/watch?v=vYeNbPc0vc4&t=12s",
    title: "SPL-LED-M1260YZ IP",
    subtitle: "12*60W LED moving bar zoom",
    productRoute: "/producto/SPL-LED-M1260YZ IP",
    type: "youtube",
    new: true
  },
  {
    src: getStorageVideoUrl("video3.mp4"),
    title: "SPL-LED-M700W Profile IP",
    subtitle: "LED Moving Head Lights",
    productRoute: "/producto/SPL-LED-M700W Profile IP",
    type: "local",
    new: true
  }
];

export const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { products, isLoaded } = useProductsWithCategories();

  const oneSecond = 1000;

  const goToImage = (index: number) => {
    if (index === currentImageIndex) return;
    setCurrentImageIndex(index);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === professionalVideos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? professionalVideos.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToNextImage();
    }, oneSecond * 10);

    return () => clearInterval(interval);
  }, [currentImageIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextImage();
    }
    if (isRightSwipe) {
      goToPrevImage();
    }
  };

  const getButtonClasses = (variant: 'primary' | 'secondary') => {
    if (variant === 'primary') {
      return 'bg-white text-black hover:bg-white/90';
    }
    return 'border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/80';
  };

  const handleProductClick = (productRoute: string) => {
    window.scrollTo(0, 0);
    const model = productRoute.replace('/producto/', '');
    const decodedModel = decodeURIComponent(model);
    
    if (isLoaded && products.length > 0) {
      const product = getProductByModel(products, decodedModel);
      if (product) {
        navigate(productRoute);
      } else {
        navigate('/productos');
      }
    } else {
      navigate(productRoute);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYouTubeStartTime = (url: string) => {
    // Extraer tiempo de inicio de la URL (ej: &t=9s, &t=1m30s, &t=90)
    const timeMatch = url.match(/[?&]t=([^&]+)/);
    if (!timeMatch) return 0;
    
    const timeStr = timeMatch[1];
    
    // Si termina en 's' (segundos)
    if (timeStr.endsWith('s')) {
      return parseInt(timeStr.slice(0, -1));
    }
    
    // Si termina en 'm' (minutos)
    if (timeStr.endsWith('m')) {
      return parseInt(timeStr.slice(0, -1)) * 60;
    }
    
    // Si termina en 'h' (horas)
    if (timeStr.endsWith('h')) {
      return parseInt(timeStr.slice(0, -1)) * 3600;
    }
    
    // Si es solo un número (segundos)
    return parseInt(timeStr) || 0;
  };

  const activeVideo = professionalVideos[currentImageIndex];

  const renderVideoContent = (video: typeof professionalVideos[0]) => {
    if (video.type === "youtube") {
      const videoId = getYouTubeVideoId(video.src);
      const startTime = getYouTubeStartTime(video.src);
      if (!videoId) return null;
      return (
        <iframe
          key={video.src}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&start=${startTime}`}
          title={video.title}
          className="w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <video
        key={video.src}
        src={video.src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0"
        ref={carouselRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
                key={currentImageIndex} 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight animate-in slide-in-from-bottom-8 duration-1500 ease-out"
              >
                {activeVideo.title}
              </h1>
              
              <p
                key={`subtitle-${currentImageIndex}`}
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