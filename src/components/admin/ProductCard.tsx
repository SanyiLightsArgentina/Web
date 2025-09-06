import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Image as ImageIcon, Video, FileText, Settings } from 'lucide-react';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const imageCount = product.images?.length || 0;
  const contentCount = product.contents?.length || 0;
  const videoCount = product.videos?.length || 0;
  const hasTechnicalDescription = product.technical_description && product.technical_description.trim() !== '';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.model}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {product.model}
                </h3>
                {product.new && (
                  <Badge variant="secondary" className="text-xs">
                    Nuevo
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <Badge variant="outline">{product.category}</Badge>
                {imageCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="h-4 w-4" />
                    <span>{imageCount} imagen{imageCount !== 1 ? 'es' : ''}</span>
                  </div>
                )}
                {contentCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{contentCount} contenido{contentCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {videoCount > 0 && (
                  <div className="flex items-center space-x-1">
                    <Video className="h-4 w-4" />
                    <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {hasTechnicalDescription && (
                  <div className="flex items-center space-x-1">
                    <Settings className="h-4 w-4" />
                    <span>Especificaciones</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
