import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ProductMediaManager } from './ProductMediaManager';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  type: string;
  thc: string;
  description?: string;
  effects?: string[];
  inventory: number;
  active: boolean;
  featured?: boolean;
  images?: string[];
  hover_image?: string;
  video_url?: string;
  strainType?: string;
  thcaPercentage?: number;
}

interface ProductEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product;
}

export const ProductEditor: React.FC<ProductEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  product
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price?.toString() || '',
    category: product?.category || '',
    strainType: product?.strainType || product?.type || '',
    thcaPercentage: product?.thcaPercentage?.toString() || product?.thc || '',
    description: product?.description || '',
    effects: product?.effects?.join(', ') || '',
    inventory: product?.inventory?.toString() || '',
    featured: product?.featured || false,
    images: product?.images || [],
    hoverImage: product?.hover_image || '',
    videoUrl: product?.video_url || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: product?.id || Date.now().toString(),
      name: formData.name,
      price: parseFloat(String(formData.price)),
      category: formData.category,
      thc: String(formData.thcaPercentage || '0'),
      type: formData.strainType || 'hybrid',
      effects: formData.effects.split(',').map((e: string) => e.trim()).filter((e: string) => e),
      inventory: parseInt(formData.inventory.toString()),
      active: true,
      description: formData.description,
      images: formData.images,
      hover_image: formData.hoverImage,
      video_url: formData.videoUrl,
      strainType: formData.strainType,
      thcaPercentage: parseFloat(String(formData.thcaPercentage || '0'))
    };
    onSave(productData);
    onClose();
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b bg-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-gray-900">
                {product ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price" className="text-gray-700 font-medium">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-gray-700 font-medium">
                    Category
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger className="w-full border rounded px-3 py-2 text-gray-900 bg-white">
                      <SelectValue placeholder="Select category" className="text-gray-900" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="flower" className="text-gray-900">Flower</SelectItem>
                      <SelectItem value="pre-rolls" className="text-gray-900">Pre-Rolls</SelectItem>
                      <SelectItem value="concentrates" className="text-gray-900">Concentrates</SelectItem>
                      <SelectItem value="edibles" className="text-gray-900">Edibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="strainType" className="text-gray-700 font-medium">
                    Strain Type
                  </Label>
                  <Select value={formData.strainType} onValueChange={(value) => handleChange('strainType', value)}>
                    <SelectTrigger className="w-full border rounded px-3 py-2 text-gray-900 bg-white">
                      <SelectValue placeholder="Select strain type" className="text-gray-900" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="sativa" className="text-gray-900">Sativa</SelectItem>
                      <SelectItem value="indica" className="text-gray-900">Indica</SelectItem>
                      <SelectItem value="hybrid" className="text-gray-900">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thcaPercentage" className="text-gray-700 font-medium">
                    THCA Percentage
                  </Label>
                  <Input
                    id="thcaPercentage"
                    type="number"
                    step="0.1"
                    value={formData.thcaPercentage}
                    onChange={(e) => handleChange('thcaPercentage', e.target.value)}
                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                    placeholder="0.0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="inventory" className="text-gray-700 font-medium">
                    Inventory Count
                  </Label>
                  <Input
                    id="inventory"
                    type="number"
                    value={formData.inventory}
                    onChange={(e) => handleChange('inventory', e.target.value)}
                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                    placeholder="0"
                    required
                  />
                </div>
              </div>


              <div>
                <Label htmlFor="effects" className="text-gray-700 font-medium">
                  Effects (comma-separated)
                </Label>
                <Input
                  id="effects"
                  value={formData.effects}
                  onChange={(e) => handleChange('effects', e.target.value)}
                  className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                  placeholder="relaxing, euphoric, creative"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => handleChange('featured', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="featured" className="text-gray-700 font-medium">
                  Featured Product
                </Label>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Product Images</h3>
                <ProductMediaManager 
                  initialImages={formData.images || []}
                  initialHoverImage={formData.hoverImage}
                  initialVideo={formData.videoUrl}
                  onMediaUploaded={(urls) => {
                    const imageUrls = urls.filter(url => !url.includes('/video/'));
                    const videoUrls = urls.filter(url => url.includes('/video/'));
                    
                    setFormData(prev => ({
                      ...prev,
                      images: [...(prev.images || []), ...imageUrls].slice(0, 3),
                      ...(videoUrls.length > 0 && !prev.videoUrl && { videoUrl: videoUrls[0] })
                    }));
                  }}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {product ? 'Update Product' : 'Save Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
