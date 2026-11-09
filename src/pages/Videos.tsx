import { useSiteSettings } from '@/hooks/use-site-settings';
import { parseVideoSource } from '@/lib/video-source';
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play } from "lucide-react";
import { Footer } from "@/components/sections/Footer";
import { useSEO } from "@/hooks/useSEO";

const Videos = () => {
  useSEO({
    title: "Videos",
    description:
      "Videos de demostración de equipos Sanyi: cabezales móviles LED, barras zoom, láser. Ver en acción antes de cotizar.",
  });

  const { settings } = useSiteSettings();
  const videos = settings.videos.items;


  return (
    <div className="min-h-screen bg-background">
      <Navigation isTransparent={false} />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Videos</h1>            
          </div>
     
          {videos.length === 0 && <p className="text-muted-foreground">Todavía no hay videos publicados.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const source = parseVideoSource(video.url);
              return (
              <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative aspect-video bg-muted">
                  {source.kind === 'youtube' ? <>
                    <img
                      src={source.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Button size="icon" className="bg-red-600 hover:bg-red-700" aria-label={`Reproducir ${video.title}`} onClick={() => window.open(video.url, '_blank', 'noopener,noreferrer')}><Play className="h-6 w-6" /></Button>
                    </div>
                  </> : <video key={video.url} src={video.url} aria-label={video.title} controls playsInline preload="metadata" className="w-full h-full object-contain" />}

                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              </div>
            )})}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => window.open(settings.videos.channelUrl, '_blank', 'noopener,noreferrer')}
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
