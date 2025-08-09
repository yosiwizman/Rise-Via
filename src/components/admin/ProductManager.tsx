import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit, Trash2, Download, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ProductEditor } from './ProductEditor';
import { productService } from '../../services/productService';
import productsData from '../../data/products.json';

interface DBProduct {
  id?: string;
  sample_id: string;
  name: string;
  slug: string;
  category: string;
  strain_type: 'indica' | 'sativa' | 'hybrid';
  thca_percentage: number;
  batch_id: string;
  volume_available: number;
  description: string;
  effects: string[];
  flavors: string[];
  prices: {
    gram: number;
    eighth: number;
    quarter: number;
    half: number;
    ounce: number;
  };
  images: string[];
  featured: boolean;
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  thc: string;
  type: string;
  effects?: string[];
  inventory: number;
  active: boolean;
  description?: string;
  featured?: boolean;
  images?: string[];
  hover_image?: string;
  video_url?: string;
  strainType?: string;
  thcaPercentage?: number;
}

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<(Product | DBProduct)[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const dbProducts = await productService.getAll();
      
      if (dbProducts.length > 0) {
        setProducts(dbProducts as (Product | DBProduct)[]);
      } else {
        const loadedProducts = productsData.products.map(product => ({
          ...product,
          inventory: Math.floor(Math.random() * 100) + 10,
          active: true,
          thc: product.thcaPercentage.toString(),
          type: product.strainType
        }));
        setProducts(loadedProducts as any);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      const loadedProducts = productsData.products.map(product => ({
        ...product,
        inventory: Math.floor(Math.random() * 100) + 10,
        active: true,
        thc: product.thcaPercentage.toString(),
        type: product.strainType
      }));
      setProducts(loadedProducts as any);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id!).filter(Boolean));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedProducts.length} selected products?`)) {
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id!)));
      setSelectedProducts([]);
    }
  };

  const handleBulkStatusChange = (active: boolean) => {
    setProducts(prev => prev.map(p => 
      selectedProducts.includes(p.id!) ? { ...p, active } : p
    ));
    setSelectedProducts([]);
  };

  const handleBulkPriceAdjustment = () => {
    const adjustment = prompt('Enter price adjustment (e.g., +5, -10, *1.1):');
    if (!adjustment) return;

    const operator = adjustment[0];
    const value = parseFloat(adjustment.slice(1));

    if (isNaN(value)) {
      alert('Invalid adjustment value');
      return;
    }

    setProducts(prev => prev.map(p => {
      if (!selectedProducts.includes(p.id!)) return p;
      
      let newPrice = 'price' in p ? p.price : (typeof p.prices === 'object' ? p.prices.gram : 0);
      switch (operator) {
        case '+':
          newPrice = newPrice + value;
          break;
        case '-':
          newPrice = newPrice - value;
          break;
        case '*':
          newPrice = newPrice * value;
          break;
        default:
          return p;
      }
      
      if ('price' in p) {
        return { ...p, price: Math.max(0, Math.round(newPrice * 100) / 100) };
      } else {
        return { ...p, prices: { ...p.prices, gram: Math.max(0, Math.round(newPrice * 100) / 100) } };
      }
    }));
    setSelectedProducts([]);
  };

  const handleQuickEdit = (product: Product | DBProduct, field: string, value: string | number | boolean) => {
    setProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, [field]: value } : p
    ));
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Price', 'Category', 'THC', 'Type', 'Inventory', 'Active'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        p.id,
        `"${p.name}"`,
        'price' in p ? p.price : (typeof p.prices === 'object' ? p.prices.gram : 0),
        p.category,
        'thc' in p ? p.thc : p.thca_percentage,
        'type' in p ? p.type : p.strain_type,
        'inventory' in p ? p.inventory : p.volume_available,
        'active' in p ? p.active : (p.status === 'active')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = [...new Set(products.map(p => p.category))];

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductEditorOpen(true);
  };

  const handleEditProduct = (product: Product | DBProduct) => {
    setEditingProduct(product as Product);
    setIsProductEditorOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct && 'sample_id' in editingProduct) {
        await productService.update(editingProduct.id!, productData);
      } else if (productData.sample_id) {
        await productService.create(productData);
      }
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      if (editingProduct) {
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
        ));
      } else {
        setProducts(prev => [...prev, { ...productData, id: Date.now().toString() }]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Management
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                onClick={handleAddProduct}
                className="bg-gradient-to-r from-risevia-purple to-risevia-teal"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedProducts.length} products selected
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBulkStatusChange(true)}
                    size="sm"
                    variant="outline"
                  >
                    Activate
                  </Button>
                  <Button
                    onClick={() => handleBulkStatusChange(false)}
                    size="sm"
                    variant="outline"
                  >
                    Deactivate
                  </Button>
                  <Button
                    onClick={handleBulkPriceAdjustment}
                    size="sm"
                    variant="outline"
                  >
                    Adjust Prices
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left font-medium">Product</th>
                  <th className="p-3 text-left font-medium">Price</th>
                  <th className="p-3 text-left font-medium">Category</th>
                  <th className="p-3 text-left font-medium">THC</th>
                  <th className="p-3 text-left font-medium">Inventory</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedProducts.includes(product.id!)}
                        onCheckedChange={() => handleSelectProduct(product.id!)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{'type' in product ? product.type : product.strain_type}</div>
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={'price' in product ? product.price : (typeof product.prices === 'object' ? product.prices.gram : 0)}
                        onChange={(e) => handleQuickEdit(product, 'price', parseFloat(e.target.value))}
                        className="w-20 h-8"
                        step="0.01"
                      />
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sm">{'thc' in product ? product.thc : product.thca_percentage}%</td>
                    <td className="p-3">
                      <Input
                        type="number"
                        value={'inventory' in product ? product.inventory : product.volume_available}
                        onChange={(e) => handleQuickEdit(product, 'inventory', parseInt(e.target.value))}
                        className="w-20 h-8"
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={('active' in product ? product.active : (product.status === 'active')) ? 'active' : 'inactive'}
                        onValueChange={(value) => handleQuickEdit(product, 'active', value === 'active')}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEditProduct(product)}
                          size="sm"
                          variant="ghost"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Delete this product?')) {
                              setProducts(prev => prev.filter(p => p.id !== product.id));
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <ProductEditor
        isOpen={isProductEditorOpen}
        onClose={() => setIsProductEditorOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct || undefined}
      />
    </div>
  );
};
