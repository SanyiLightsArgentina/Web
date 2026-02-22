import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Eye, Clock } from "lucide-react";
import { Footer } from "@/components/sections/Footer";
import { useSEO } from "@/hooks/useSEO";

interface Video {
  id: string;
  title: string;
  url: string;
}

const Videos = () => {
  useSEO({
    title: "Videos",
    description:
      "Videos de demostración de equipos Sanyi: cabezales móviles LED, barras zoom, láser. Ver en acción antes de cotizar.",
  });

  const getVideoIdFromUrl = (url: string): string => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const getVideoThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const videos: Video[] = [
    {
      id: "j2QAAahiwI8",
      title: "GUSTTAVO LIMA BUTECO GYN AFTERMOVIE1",
      url: "https://www.youtube.com/watch?v=j2QAAahiwI8"
    },
    {
      id: "uNGhhmi-BhA",
      title: "Laser derby SPL-LED-020M-A3",
      url: "https://www.youtube.com/watch?v=uNGhhmi-BhA&t=39s"
    },
    {
      id: "PLLYJxoyyR8",
      title: "12*40W LED zoom moving bar",
      url: "https://www.youtube.com/watch?v=PLLYJxoyyR8"
    },
    {
      id: "Y7igAG0c3Jo",
      title: "SPL-LED-1940 IP",
      url: "https://www.youtube.com/watch?v=Y7igAG0c3Jo"
    },
    {
      id: "oTRCoCKXDDU",
      title: "Rubik Economic Rubik",
      url: "https://www.youtube.com/watch?v=oTRCoCKXDDU"
    },
    {
      id: "wB5X6ttS6e0",
      title: "SPL-LED-740",
      url: "https://www.youtube.com/watch?v=wB5X6ttS6e0"
    },
    {
      id: "RTfdyBXasYg",
      title: "200W LED BSW moving head",
      url: "https://www.youtube.com/watch?v=RTfdyBXasYg"
    },
    {
      id: "5j-uRe7y8wE",
      title: "Lade Buteco2023",
      url: "https://www.youtube.com/watch?v=5j-uRe7y8wE"
    },
    {
      id: "MBfeXkHwYIg",
      title: "SPL-RGB-623",
      url: "https://www.youtube.com/watch?v=MBfeXkHwYIg&t=4s"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation isTransparent={false} />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Videos</h1>            
          </div>
     
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative aspect-video bg-muted">
                  <img 
                    src={getVideoThumbnail(video.id)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to a default thumbnail if the image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => window.open('https://www.youtube.com/@yispark', '_blank')}
              size="lg"
              className="group"
            >
              Ver Más Videos
              <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Videos;
