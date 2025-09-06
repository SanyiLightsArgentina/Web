import { Product } from "@/data/products";

interface ProductVideosProps {
  videos: string[];
  productModel: string;
}

export const ProductVideos = ({ videos, productModel }: ProductVideosProps) => {
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isYouTubeVideo = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-3 h-8 bg-purple-500 rounded-full"></span>
            Videos del Producto
          </h2>
          <p className="text-gray-600 mt-2">Conoce más sobre {productModel} a través de nuestros videos</p>
        </div>
        
        <div className="p-6">
          <div className={`grid gap-6 ${
            videos.length === 1 
              ? 'grid-cols-1 max-w-2xl mx-auto' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {videos.map((video, index) => {
              const videoId = getYouTubeVideoId(video);
              const isYouTube = isYouTubeVideo(video);
              
              return (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-4 bg-purple-400 rounded-full"></span>
                    {videos.length > 1 ? `Video ${index + 1}` : 'Video del Producto'}
                  </h3>
                  <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    {isYouTube ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Video ${index + 1} de ${productModel}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={video}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      >
                        Tu navegador no soporta el elemento de video.
                      </video>
                    )}
                  </div>
                  {videos.length > 1 && (
                    <p className="text-sm text-gray-600 text-center">
                      Video {index + 1} de {videos.length}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
