import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Search, 
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { productService } from '../../services/productService';
import { emailService } from '../../services/emailService';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface Product {
  id: string;
  sku: string;
  name: string;
  strain: string;
  thc?: number;
  cbd?: number;
  base_price: number;
  quantity: number;
  in_stock: boolean;
  featured: boolean;
  low_stock_alert: number;
  track_inventory: boolean;
  created_at: string;
}

export const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStrain, setFilterStrain] = useState('all');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: number; quantity: number }>({ price: 0, quantity: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [updatingImages, setUpdatingImages] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadProducts(1);
    }
  }, [searchTerm, filterStrain]);

  const loadProducts = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const [data, count] = await Promise.all([
        productService.getAll(page, itemsPerPage),
        productService.getProductCount()
      ]);
      setProducts(data || []);
      setTotalProducts(count);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await productService.bulkDelete(selectedProducts);
        await loadProducts();
        setSelectedProducts([]);
      } catch (error) {
        console.error('Error deleting products:', error);
        alert('Error deleting products');
      }
    }
  };

  const handleBulkStatusUpdate = async (inStock: boolean) => {
    if (selectedProducts.length === 0) return;
    
    try {
      await productService.bulkUpdate({
        ids: selectedProducts,
        updates: { in_stock: inStock }
      });
      await loadProducts();
      setSelectedProducts([]);
      
      await checkAndSendLowStockAlerts();
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error updating product status');
    }
  };

  const handleQuickEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditValues({ price: product.base_price, quantity: product.quantity });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    
    try {
      await productService.update(editingProduct, {
        base_price: editValues.price,
        quantity: editValues.quantity
      });
      await loadProducts();
      setEditingProduct(null);
      
      await checkAndSendLowStockAlerts();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditValues({ price: 0, quantity: 0 });
  };

  const handleExportCSV = async () => {
    try {
      const allProducts = await productService.getAllProducts();
      productService.exportToCSV(allProducts || []);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting CSV');
    }
  };

  const handleUpdateImages = async () => {
    if (confirm('Update product images for the 11 specified products? This will replace existing images.')) {
      try {
        setUpdatingImages(true);
        const results = await productService.updateProductImages();
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        alert(`Image update complete: ${successful} successful, ${failed} failed`);
        await loadProducts();
      } catch (error) {
        console.error('Error updating images:', error);
        alert('Error updating product images');
      } finally {
        setUpdatingImages(false);
      }
    }
  };

  const checkAndSendLowStockAlerts = async () => {
    try {
      const lowStockProducts = await productService.getLowStockProducts();
      if (lowStockProducts && lowStockProducts.length > 0) {
        await emailService.sendLowStockAlert(lowStockProducts);
        console.log(`Low stock alert sent for ${lowStockProducts.length} products`);
      }
    } catch (error) {
      console.error('Error checking/sending low stock alerts:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStrain = filterStrain === 'all' || product.strain === filterStrain;
    return matchesSearch && matchesStrain;
  });

  const isLowStock = (product: Product) => {
    return product.track_inventory && product.quantity <= product.low_stock_alert;
  };

  const strainOptions = ['all', 'Sativa', 'Indica', 'Hybrid'];
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-risevia-purple border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Product Management
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdateImages}
                disabled={updatingImages}
                variant="outline"
              >
                {updatingImages ? 'Updating...' : 'Update Images'}
              </Button>
              <Button className="bg-gradient-to-r from-risevia-purple to-risevia-teal">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStrain}
                  onChange={(e) => setFilterStrain(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  {strainOptions.map(strain => (
                    <option key={strain} value={strain}>
                      {strain === 'all' ? 'All Strains' : strain}
                    </option>
                  ))}
                </select>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  {selectedProducts.length} products selected
                </span>
                <Button
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(true)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Mark In Stock
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBulkStatusUpdate(false)}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Mark Out of Stock
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left p-3">Product</th>
                    <th className="text-left p-3">SKU</th>
                    <th className="text-left p-3">Strain</th>
                    <th className="text-left p-3">THC%</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Quantity</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          {isLowStock(product) && (
                            <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.featured && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{product.sku}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.strain === 'Sativa' ? 'bg-green-100 text-green-800' :
                          product.strain === 'Indica' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {product.strain}
                        </span>
                      </td>
                      <td className="p-3">{product.thc ? `${product.thc}%` : '-'}</td>
                      <td className="p-3">
                        {editingProduct === product.id ? (
                          <Input
                            type="number"
                            value={editValues.price}
                            onChange={(e) => setEditValues({...editValues, price: parseFloat(e.target.value)})}
                            className="w-20"
                            step="0.01"
                          />
                        ) : (
                          `$${product.base_price.toFixed(2)}`
                        )}
                      </td>
                      <td className="p-3">
                        {editingProduct === product.id ? (
                          <Input
                            type="number"
                            value={editValues.quantity}
                            onChange={(e) => setEditValues({...editValues, quantity: parseInt(e.target.value)})}
                            className="w-20"
                          />
                        ) : (
                          <span className={isLowStock(product) ? 'text-orange-600 font-medium' : ''}>
                            {product.quantity}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {editingProduct === product.id ? (
                            <>
                              <Button size="sm" onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600">
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button size="sm" onClick={handleCancelEdit} variant="outline">
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleQuickEdit(product)}
                              variant="outline"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
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

            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 mt-4">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
