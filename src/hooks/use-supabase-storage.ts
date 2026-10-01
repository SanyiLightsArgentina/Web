import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { resizeProductImage, type ImageSize } from '@/lib/product-images';

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: File, 
    bucket: string, 
    path: string,
    cacheControl = '3600'
  ): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl,
          upsert: false
        });

      if (error) {
        console.error('Error subiendo archivo:', error);
        toast.error(`Error subiendo archivo: ${error.message}`);
        return null;
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;
      toast.success(`Archivo "${file.name}" subido exitosamente`);
      
      return publicUrl;
    } catch (error) {
      console.error('Error inesperado subiendo archivo:', error);
      toast.error('Error inesperado subiendo archivo');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadProductImage = async (file: File, productModel: string): Promise<string | null> => {
    const fileName = `${crypto.randomUUID()}_${file.name}`;
    const path = `products/${productModel}/${fileName}`;
    const sizes: ImageSize[] = ['thumb', 'card', 'detail'];
    const variants = await Promise.all(sizes.map(size => resizeProductImage(file, size)));
    if (!await uploadFile(file, 'product-images', path, '31536000')) {
      throw new Error('No se pudo subir la imagen original');
    }
    let detailUrl = '';
    for (const [index, size] of sizes.entries()) {
      const variant = new File([variants[index]], `${size}.webp`, { type: 'image/webp' });
      const url = await uploadFile(variant, 'product-images', `${path}/optimized-v1/${size}.webp`, '31536000');
      if (!url) throw new Error('No se pudieron subir todas las versiones de la imagen');
      if (size === 'detail') detailUrl = url;
    }
    return detailUrl;
  };

  const uploadProductContent = async (file: File, productModel: string): Promise<string | null> => {
    const fileName = `${Date.now()}_${file.name}`;
    
    let path: string;
    if (file.type.startsWith('image/')) {
      path = `products/${productModel}/content/images/${fileName}`;
    } else {
      path = `products/${productModel}/content/documents/${fileName}`;
    }
    
    return uploadFile(file, 'product-content', path);
  };

  const uploadProductVideo = async (file: File, productModel: string): Promise<string | null> => {
    const fileName = `${Date.now()}_${file.name}`;
    const path = `products/${productModel}/videos/${fileName}`;
    
    return uploadFile(file, 'product-videos', path);
  };

  const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Error eliminando archivo:', error);
        toast.error(`Error eliminando archivo: ${error.message}`);
        return false;
      }

      toast.success('Archivo eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('Error inesperado eliminando archivo:', error);
      toast.error('Error inesperado eliminando archivo');
      return false;
    }
  };

  const getPublicUrl = (bucket: string, path: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    isUploading,
    uploadFile,
    uploadProductImage,
    uploadProductContent,
    uploadProductVideo,
    deleteFile,
    getPublicUrl
  };
};
