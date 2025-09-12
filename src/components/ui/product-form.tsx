import React, { useState, useRef } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Badge } from './badge'
import { Product } from '@/data/products'
import { Category } from '@/hooks/use-products-with-categories'
import { X, Plus, Eye, Play, FileText, Image, Video } from 'lucide-react'
import { toast } from 'sonner'
import { ResponsiveDeleteModal } from "./responsive-delete-modal";
import { useSupabaseStorage } from '@/hooks/use-supabase-storage'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  onSubmit: (product: Omit<Product, 'created_at' | 'updated_at'> & { id?: number }) => Promise<void>
  onCancel: () => void
  loading?: boolean
  isAddingProduct?: boolean
}

interface FileItem {
  type: 'url' | 'file'
  value: string | File
  name?: string
  preview?: string
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  loading = false,
  isAddingProduct = false
}) => {
  const { uploadProductImage, uploadProductContent, uploadProductVideo, isUploading } = useSupabaseStorage()
  
  const [formData, setFormData] = useState({
    model: product?.model || '',
    description: product?.description || '',
    technical_description: product?.technical_description || '',
    category_id: product?.category_id || (categories.length > 0 ? categories[0].id : 0),
    images: product?.images || [],
    contents: product?.contents || [],
    videos: product?.videos || [],
    new: product?.new || false
  })

  const [fileData, setFileData] = useState({
    images: [] as FileItem[],
    contents: [] as FileItem[],
    videos: [] as FileItem[]
  })

  const [newImageUrl, setNewImageUrl] = useState('')
  const [newContentUrl, setNewContentUrl] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedContentImage, setSelectedContentImage] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'images' | 'contents' | 'videos'
    index: number
    url: string
  } | null>(null)

  React.useEffect(() => {
    setFormData({
      model: product?.model || '',
      description: product?.description || '',
      technical_description: product?.technical_description || '',
      category_id: product?.category_id || (categories.length > 0 ? categories[0].id : 0),
      images: product?.images || [],
      contents: product?.contents || [],
      videos: product?.videos || [],
      new: product?.new || false
    })
    
    // Convertir URLs existentes a FileItems
    setFileData({
      images: (product?.images || []).map(url => ({ type: 'url', value: url })),
      contents: (product?.contents || []).map(url => ({ type: 'url', value: url })),
      videos: (product?.videos || []).map(url => ({ type: 'url', value: url }))
    })
    
    setNewImageUrl('')
    setNewContentUrl('')
    setNewVideoUrl('')
  }, [product, categories])

  // Inicializar category_id cuando las categorías se cargan
  React.useEffect(() => {
    if (categories.length > 0 && !product && formData.category_id === 0) {
      setFormData(prev => ({ ...prev, category_id: categories[0].id }))
    }
  }, [categories, product, formData.category_id])


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, field: 'images' | 'contents' | 'videos') => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    
    files.forEach(file => {
      if (field === 'images' && file.type.startsWith('image/')) {
        addFile(file, field)
      } else if (field === 'videos' && file.type.startsWith('video/')) {
        addFile(file, field)
      } else if (field === 'contents') {
        addFile(file, field)
      }
    })
  }

  const handleFileSelect = (field: 'images' | 'contents' | 'videos') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    
    if (field === 'images') {
      input.accept = 'image/*'
    } else if (field === 'videos') {
      input.accept = 'video/*'
    } else {
      input.accept = '*/*'
    }
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      files.forEach(file => {
        addFile(file, field)
      })
    }
    
    input.click()
  }

  const addFile = (file: File, field: 'images' | 'contents' | 'videos') => {
    const preview = URL.createObjectURL(file)
    const fileItem: FileItem = {
      type: 'file',
      value: file,
      name: file.name,
      preview
    }
    
    setFileData(prev => ({
      ...prev,
      [field]: [...prev[field], fileItem]
    }))
    
    // Para archivos, no actualizamos formData ya que se procesarán en handleSubmit
    // Pero mantenemos la sincronización para URLs existentes
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] || []
    }))
    
    toast.success(`Archivo "${file.name}" agregado`)
  }

  const addUrl = (url: string, field: 'images' | 'contents' | 'videos') => {
    if (url.trim()) {
      const urlItem: FileItem = {
        type: 'url',
        value: url.trim()
      }
      
      setFileData(prev => ({
        ...prev,
        [field]: [...prev[field], urlItem]
      }))
      
      // También actualizar formData para mantener sincronización
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), url.trim()]
      }))
      
      if (field === 'images') setNewImageUrl('')
      if (field === 'contents') setNewContentUrl('')
      if (field === 'videos') setNewVideoUrl('')
      
      toast.success('URL agregada')
    }
  }

  const removeFile = (index: number, field: 'images' | 'contents' | 'videos') => {
    setFileData(prev => {
      const newFileData = {
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }
      
      // También actualizar formData para mantener sincronización
      const newUrls = newFileData[field]
        .filter(item => item.type === 'url')
        .map(item => item.value as string)
      
      setFormData(prev => ({
        ...prev,
        [field]: newUrls
      }))
      
      return newFileData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.model.trim()) {
      toast.error('El modelo del producto es obligatorio')
      return
    }

    if (!formData.category_id || formData.category_id === 0) {
      toast.error('Debe seleccionar una categoría')
      return
    }

    try {
      // Procesar archivos y URLs
      const finalProductData = {
        ...formData,
        id: product?.id,
        images: [] as string[],
        contents: [] as string[],
        videos: [] as string[]
      }

      // Procesar imágenes
      for (const item of fileData.images) {
        if (item.type === 'url') {
          finalProductData.images.push(item.value as string)
        } else if (item.type === 'file') {
          const file = item.value as File
          const url = await uploadProductImage(file, formData.model)
          if (url) {
            finalProductData.images.push(url)
          }
        }
      }

      // Procesar contenidos
      for (const item of fileData.contents) {
        if (item.type === 'url') {
          finalProductData.contents.push(item.value as string)
        } else if (item.type === 'file') {
          const file = item.value as File
          const url = await uploadProductContent(file, formData.model)
          if (url) {
            finalProductData.contents.push(url)
          }
        }
      }

      // Procesar videos
      for (const item of fileData.videos) {
        if (item.type === 'url') {
          finalProductData.videos.push(item.value as string)
        } else if (item.type === 'file') {
          const file = item.value as File
          const url = await uploadProductVideo(file, formData.model)
          if (url) {
            finalProductData.videos.push(url)
          }
        }
      }

      await onSubmit(finalProductData)
      toast.success(product ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente')
      
    } catch (error) {
      console.error('Error al guardar el producto:', error)
      toast.error('Error al guardar el producto')
    }
  }

  const removeUrl = (index: number, field: 'images' | 'contents' | 'videos') => {
    setFileData(prev => {
      const newFileData = {
        ...prev,
        [field]: prev[field]?.filter((_, i) => i !== index) || []
      }
      
      // También actualizar formData para mantener sincronización
      const newUrls = newFileData[field]
        .filter(item => item.type === 'url')
        .map(item => item.value as string)
      
      setFormData(prev => ({
        ...prev,
        [field]: newUrls
      }))
      
      return newFileData
    })
  }

  const confirmDelete = (type: 'images' | 'contents' | 'videos', index: number, url: string) => {
    setDeleteConfirmation({ type, index, url })
  }

  const handleDelete = () => {
    if (deleteConfirmation) {
      removeUrl(deleteConfirmation.index, deleteConfirmation.type)
      setDeleteConfirmation(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmation(null)
  }

  const isVideoUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || 
           url.match(/\.(mp4|mov|avi|webm|mkv)$/i)
  }

  const isImageUrl = (url: string) => {
    return url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) || url.includes('blob:')
  }

  return (
    <div className="bg-white rounded-lg border p-6 max-w-4xl mx-auto product-form-container">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model">Modelo *</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              required
              placeholder="SPL-LED-700"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            {categories.length === 0 ? (
              <div className="p-3 border border-red-200 rounded-md bg-red-50">
                <span className="text-sm text-red-600">No hay categorías disponibles. Por favor, crea algunas categorías primero.</span>
              </div>
            ) : (
              <Select
                value={formData.category_id > 0 ? formData.category_id.toString() : ""}
                onValueChange={(value) => {
                  console.log('Cambiando categoría a:', value, 'ID:', parseInt(value));
                  setFormData(prev => ({ ...prev, category_id: parseInt(value) }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            placeholder="Descripción del producto..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technical_description">Descripción Técnica</Label>
          <Textarea
            id="technical_description"
            value={formData.technical_description}
            onChange={(e) => setFormData(prev => ({ ...prev, technical_description: e.target.value }))}
            placeholder="Especificaciones técnicas detalladas"
            rows={8}
            className="text-sm"
          />
        </div>

        {/* Sección de Imágenes */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Image className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Imágenes</h4>
          </div>
          
          <div className="space-y-4">
            {/* Área de drag and drop */}
            <div 
              className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-blue-50 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'images')}
              onClick={() => handleFileSelect('images')}
            >
              <Image className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-600 font-medium">Arrastra y suelta imágenes aquí</p>
              <p className="text-xs text-blue-500">o haz click para seleccionar archivos</p>
            </div>

            <div className="space-y-2">
              <Label>Agregar URL de imagen</Label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1"
                />
                <Button type="button" onClick={() => addUrl(newImageUrl, 'images')} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {fileData.images.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Imágenes agregadas:</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {fileData.images.map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-32 bg-gray-100 rounded-lg border overflow-hidden">
                        {item.type === 'url' ? (
                          <img 
                            src={item.value as string} 
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(item.value as string)}
                          />
                        ) : (
                          <img 
                            src={item.preview || ''} 
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(item.preview || '')}
                          />
                        )}
                      </div>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedImage(item.value as string)}
                          className="h-6 w-6 p-0 text-white hover:bg-white hover:text-black"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete('images', index, item.value as string)}
                          className="h-6 w-6 p-0 text-white hover:bg-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Contenidos */}
        <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-green-600" />
            <h4 className="text-lg font-semibold text-gray-900">Contenidos</h4>
          </div>
          
          <div className="space-y-4">
            {/* Área de drag and drop */}
            <div 
              className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors bg-green-50 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'contents')}
              onClick={() => handleFileSelect('contents')}
            >
              <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-600 font-medium">Arrastra y suelta archivos aquí</p>
              <p className="text-xs text-green-500">PDFs, documentos, imágenes o haz click para seleccionar</p>
            </div>

            <div className="space-y-2">
              <Label>Agregar URL de contenido</Label>
              <div className="flex gap-2">
                <Input
                  value={newContentUrl}
                  onChange={(e) => setNewContentUrl(e.target.value)}
                  placeholder="https://ejemplo.com/documento.pdf"
                  className="flex-1"
                />
                <Button type="button" onClick={() => addUrl(newContentUrl, 'contents')} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {fileData.contents.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Contenidos agregados:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fileData.contents.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="flex-shrink-0">
                        {item.type === 'url' ? (
                          isImageUrl(item.value as string) ? (
                            <img 
                              src={item.value as string} 
                              alt={`Contenido ${index + 1}`}
                              className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedContentImage(item.value as string)}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
                              <FileText className="h-6 w-6 text-green-600" />
                            </div>
                          )
                        ) : (
                          <img 
                            src={item.preview || ''} 
                            alt={`Contenido ${index + 1}`}
                            className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedContentImage(item.preview || '')}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.type === 'url' 
                            ? (item.value as string).includes('http') 
                              ? (item.value as string).split('/').pop() || (item.value as string) 
                              : (item.value as string)
                            : item.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{item.type === 'url' ? (item.value as string) : item.name}</p>
                      </div>
                      <div className="flex gap-1">
                        {item.type === 'url' && isImageUrl(item.value as string) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedContentImage(item.value as string)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Ver imagen completa"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete('contents', index, item.value as string)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar contenido"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Videos */}
        <div className="border border-gray-200 rounded-lg p-6 bg-purple-50">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-purple-600" />
            <h4 className="text-lg font-semibold text-gray-900">Videos</h4>
          </div>
          
          <div className="space-y-4">
            {/* Área de drag and drop */}
            <div 
              className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors bg-purple-50 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'videos')}
              onClick={() => handleFileSelect('videos')}
            >
              <Video className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-purple-600 font-medium">Arrastra y suelta videos aquí</p>
              <p className="text-xs text-purple-500">MP4, MOV, AVI o haz click para seleccionar</p>
            </div>

            <div className="space-y-2">
              <Label>Agregar URL de video</Label>
              <div className="flex gap-2">
                <Input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... o https://ejemplo.com/video.mp4"
                  className="flex-1"
                />
                <Button type="button" onClick={() => addUrl(newVideoUrl, 'videos')} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {fileData.videos.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Videos agregados:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fileData.videos.map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-40 bg-gray-100 rounded-lg border overflow-hidden">
                        {item.type === 'url' ? (
                          isVideoUrl(item.value as string) ? (
                            (item.value as string).includes('youtube.com') || (item.value as string).includes('youtu.be') ? (
                              <div className="w-full h-full bg-red-100 flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="h-12 w-12 text-red-600 mx-auto mb-2" />
                                  <p className="text-sm text-red-600 font-medium">YouTube Video</p>
                                  <p className="text-xs text-red-500 truncate">{item.value as string}</p>
                                </div>
                              </div>
                            ) : (item.value as string).includes('vimeo.com') ? (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                                  <p className="text-sm text-blue-600 font-medium">Vimeo Video</p>
                                  <p className="text-xs text-blue-500 truncate">{item.value as string}</p>
                                </div>
                              </div>
                            ) : (
                              <video 
                                src={item.value as string} 
                                className="w-full h-full object-cover"
                                controls
                                preload="metadata"
                              />
                            )
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <div className="text-center">
                                <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">URL de video</p>
                              </div>
                            </div>
                          )
                        ) : (
                          <video 
                            src={item.preview || ''} 
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                            muted
                          />
                        )}
                      </div>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(item.value as string, '_blank')}
                          className="h-6 w-6 p-0 text-white hover:bg-white hover:text-black"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete('videos', index, item.value as string)}
                          className="h-6 w-6 p-0 text-white hover:bg-red-500"
                        >
                          <X className="h-4 w-4" />
                      </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Checkbox para producto nuevo */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="new"
            checked={formData.new}
            onChange={(e) => setFormData(prev => ({ ...prev, new: e.target.checked }))}
            className="rounded"
          />
          <Label htmlFor="new">Producto nuevo</Label>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || isUploading || categories.length === 0}>
            {loading || isUploading ? 'Guardando...' : categories.length === 0 ? 'Sin categorías' : product ? 'Actualizar Producto' : 'Crear Producto'}
          </Button>
        </div>
      </form>

      {/* Modal para ver imagen en tamaño completo */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[95vh]">
            <img 
              src={selectedImage} 
              alt="Vista previa completa"
              className="w-full h-full object-contain rounded-lg"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black bg-opacity-50 text-white hover:bg-white hover:text-black h-10 w-10 sm:h-12 sm:w-12 rounded-full"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal para ver imagen de contenido en tamaño completo */}
      {selectedContentImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[95vh]">
            <img 
              src={selectedContentImage} 
              alt="Vista previa completa del contenido"
              className="w-full h-full object-contain rounded-lg"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedContentImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black bg-opacity-50 text-white hover:bg-white hover:text-black h-10 w-10 sm:h-12 sm:w-12 rounded-full"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de borrado */}
      {deleteConfirmation && (
        <ResponsiveDeleteModal
          isOpen={!!deleteConfirmation}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={handleDelete}
          title="Confirmar eliminación"
          description={`¿Estás seguro de que quieres eliminar este ${deleteConfirmation.type === 'images' ? 'imagen' : 
                                                           deleteConfirmation.type === 'contents' ? 'contenido' : 'video'}`}
          itemType={deleteConfirmation.type === 'images' ? 'imagen' : 
                   deleteConfirmation.type === 'contents' ? 'contenido' : 'video'}
          itemUrl={deleteConfirmation.url}
          confirmText="Eliminar"
        />
      )}
    </div>
  )
}
