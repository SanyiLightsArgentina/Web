import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast as notify } from '@/hooks/use-toast';
import { resizeProductImage, type ImageSize } from '@/lib/product-images';
const toast = {
  success: (description: string) => notify({ title: description }),
  error: (description: string) => notify({ title: 'Error de archivo', description, variant: 'destructive' }),
};

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: File, 
    bucket: string, 
    path: string,
    cacheControl = '3600'
  ): Promise<string> => {
    setIsUploading(true);
    
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl,
          contentType: file.name.toLowerCase().endsWith('.mp4') ? 'video/mp4' : file.type || 'application/octet-stream',
          upsert: false
        });

      if (error) {
        console.error('Error subiendo archivo:', error);
        throw new Error(error.message);
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;
      toast.success(`Archivo "${file.name}" subido exitosamente`);
      
      return publicUrl;
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Error de conexión';
      throw new Error(`No se pudo subir "${file.name}": ${detail}. El producto no se guardó; podés volver a intentar.`);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadProductImage = async (file: File, productModel: string): Promise<string> => {
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

  const uploadProductContent = async (file: File, productModel: string): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    
    let path: string;
    if (file.type.startsWith('image/')) {
      path = `products/${productModel}/content/images/${fileName}`;
    } else {
      path = `products/${productModel}/content/documents/${fileName}`;
    }
    
    return uploadFile(file, 'product-content', path);
  };

  const uploadProductVideo = async (file: File, productModel: string): Promise<string> => {
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|m4v|avi)$/i.test(file.name)) throw new Error('Seleccioná un archivo de video válido.');
    if (file.size === 0) throw new Error('El archivo de video está vacío.');
    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
    const modelPath = productModel.normalize('NFKD').replace(/[^a-zA-Z0-9_-]/g, '_') || 'video';
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const path = `products/${modelPath}/videos/${fileName}`;
    
    const video = extension === 'mp4' && file.type !== 'video/mp4'
      ? new File([file], file.name, { type: 'video/mp4', lastModified: file.lastModified }) : file;
    return uploadFile(video, 'product-videos', path);
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
