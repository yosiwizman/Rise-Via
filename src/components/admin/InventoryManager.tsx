import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Edit, History, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';
import productsData from '../../data/products.json';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  lastRestocked: string;
  category: string;
  price: number;
}

interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'increase' | 'decrease' | 'restock' | 'damage' | 'theft';
  quantity: number;
  reason: string;
  adjustedBy: string;
  timestamp: string;
}

export const InventoryManager: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      const [dbProducts, logs] = await Promise.all([
        productService.getAll(),
        productService.getInventoryLogs()
      ]);
      
      if (dbProducts.length > 0) {
        setProducts(dbProducts);
        const inventoryItems: InventoryItem[] = dbProducts.map(product => ({
          id: product.id || '',
          name: product.name,
          sku: product.sample_id || '',
          currentStock: product.volume_available || 0,
          lowStockThreshold: 10,
          reorderPoint: 20,
          lastRestocked: product.updated_at || product.created_at || new Date().toISOString(),
          category: product.category,
          price: product.price || 0
        }));
        setInventory(inventoryItems);
        
        const adjustmentItems: InventoryAdjustment[] = logs.map(log => ({
          id: log.id!,
          productId: log.product_id,
          productName: dbProducts.find(p => p.id === log.product_id)?.name || 'Unknown Product',
          type: log.change_amount > 0 ? 'increase' : 'decrease',
          quantity: Math.abs(log.change_amount),
          reason: log.reason || 'No reason provided',
          adjustedBy: log.user_id || 'System',
          timestamp: log.created_at || new Date().toISOString()
        }));
        setAdjustments(adjustmentItems);
      } else {
        const mockInventory: InventoryItem[] = productsData.products.map(product => ({
          id: product.id,
          name: product.name,
          sku: `SKU-${product.id}`,
          currentStock: Math.floor(Math.random() * 100) + 5,
          lowStockThreshold: 10,
          reorderPoint: 20,
          lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: product.category,
          price: product.price
        }));
        setInventory(mockInventory);

        const mockAdjustments: InventoryAdjustment[] = [
          {
            id: '1',
            productId: '1',
            productName: 'Blue Dream',
            type: 'restock',
            quantity: 50,
            reason: 'Weekly restock',
            adjustedBy: 'Admin User',
            timestamp: new Date().toISOString()
          }
        ];
        setAdjustments(mockAdjustments);
      }
    } catch (error) {
      console.error('Error loading inventory data:', error);
      const mockInventory: InventoryItem[] = productsData.products.map(product => ({
        id: product.id,
        name: product.name,
        sku: `SKU-${product.id}`,
        currentStock: Math.floor(Math.random() * 100) + 5,
        lowStockThreshold: 10,
        reorderPoint: 20,
        lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: product.category,
        price: product.price
      }));
      setInventory(mockInventory);
    }
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.currentStock <= item.lowStockThreshold);
  };

  const getReorderItems = () => {
    return inventory.filter(item => item.currentStock <= item.reorderPoint);
  };

  const handleAdjustment = async () => {
    if (!selectedItem || !adjustmentQuantity || !adjustmentReason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const quantity = parseInt(adjustmentQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid positive quantity');
        return;
      }

      const newStock = adjustmentType === 'increase' 
        ? selectedItem.currentStock + quantity
        : Math.max(0, selectedItem.currentStock - quantity);

      try {
        await productService.updateInventory(
          selectedItem.id,
          newStock,
          adjustmentReason,
          'admin-user'
        );
        
        await loadInventoryData();
        alert(`Inventory successfully ${adjustmentType === 'increase' ? 'increased' : 'decreased'} by ${quantity} units`);
      } catch (dbError) {
        console.warn('Database update failed, updating local state:', dbError);
        
        setInventory(prev => prev.map(item => 
          item.id === selectedItem.id 
            ? { ...item, currentStock: newStock, lastRestocked: new Date().toISOString() }
            : item
        ));

        const newAdjustment: InventoryAdjustment = {
          id: Date.now().toString(),
          productId: selectedItem.id,
          productName: selectedItem.name,
          type: adjustmentType,
          quantity,
          reason: adjustmentReason,
          adjustedBy: 'Admin User',
          timestamp: new Date().toISOString()
        };

        setAdjustments(prev => [newAdjustment, ...prev]);
        alert(`Inventory updated locally (database unavailable). ${adjustmentType === 'increase' ? 'Increased' : 'Decreased'} by ${quantity} units`);
      }

      setShowAdjustmentModal(false);
      setSelectedItem(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory. Please try again.');
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.lowStockThreshold) {
      return { status: 'Low Stock', color: 'bg-red-100 text-red-800' };
    } else if (item.currentStock <= item.reorderPoint) {
      return { status: 'Reorder Soon', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const lowStockItems = getLowStockItems();
  const reorderItems = getReorderItems();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowHistory(true)}
            variant="outline"
          >
            <History className="w-4 h-4 mr-2" />
            View History
          </Button>
          <Button
            onClick={loadInventoryData}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Reorder Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reorderItems.length}</div>
            <p className="text-xs text-muted-foreground">Items approaching reorder point</p>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Critical Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded">
                <span className="text-red-700 font-medium">{item.name}</span>
                <span className="text-red-600 text-sm">{item.currentStock} left</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-left p-3 font-medium">Current Stock</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Last Restocked</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm">{item.sku}</td>
                      <td className="p-3">
                        <div className="font-semibold">{item.currentStock}</div>
                        <div className="text-xs text-gray-500">
                          Threshold: {item.lowStockThreshold}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(item.lastRestocked).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowAdjustmentModal(true);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showAdjustmentModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Adjust Inventory</h3>
              <Button
                onClick={() => setShowAdjustmentModal(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Product</label>
                <p className="font-medium">{selectedItem.name}</p>
                <p className="text-sm text-gray-600">Current Stock: {selectedItem.currentStock}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Adjustment Type</label>
                <Select value={adjustmentType} onValueChange={(value: 'increase' | 'decrease') => setAdjustmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">Increase Stock</SelectItem>
                    <SelectItem value="decrease">Decrease Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <Input
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Reason</label>
                <Input
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Enter reason for adjustment"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAdjustment} className="flex-1">
                  Apply Adjustment
                </Button>
                <Button
                  onClick={() => setShowAdjustmentModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Inventory Adjustment History</h3>
              <Button
                onClick={() => setShowHistory(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Quantity</th>
                    <th className="text-left p-3 font-medium">Reason</th>
                    <th className="text-left p-3 font-medium">Adjusted By</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustments.map((adjustment) => (
                    <tr key={adjustment.id} className="border-b">
                      <td className="p-3 text-sm">
                        {new Date(adjustment.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-medium">{adjustment.productName}</td>
                      <td className="p-3">
                        <Badge className={
                          adjustment.type === 'increase' || adjustment.type === 'restock'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }>
                          {adjustment.type}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {adjustment.type === 'increase' || adjustment.type === 'restock' ? '+' : '-'}
                        {adjustment.quantity}
                      </td>
                      <td className="p-3">{adjustment.reason}</td>
                      <td className="p-3 text-sm text-gray-600">{adjustment.adjustedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
