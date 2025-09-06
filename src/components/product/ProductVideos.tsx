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
    <div className="mt-8 sm:mt-12">
      {videos.length > 1 && (
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Videos del Producto
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Conoce más sobre {productModel} a través de nuestros videos</p>
        </div>
      )}
      
      <div className={`grid gap-4 ${
        videos.length === 1 
          ? 'grid-cols-1 max-w-2xl mx-auto' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2'
      }`}>
            {videos.map((video, index) => {
              const videoId = getYouTubeVideoId(video);
              const isYouTube = isYouTubeVideo(video);
              
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                  <div className="p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      {videos.length > 1 ? `Video ${index + 1}` : 'Video del Producto'}
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200 flex-1">
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
                      <p className="text-xs text-gray-600 text-center mt-2">
                        Video {index + 1} de {videos.length}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};
