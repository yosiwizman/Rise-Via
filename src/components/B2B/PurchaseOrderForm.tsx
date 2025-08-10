import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ShoppingCart, Plus, Minus, FileText } from 'lucide-react';
import { wholesalePricingService, PurchaseOrderItem } from '../../services/wholesalePricingService';
import { productService } from '../../services/productService';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images?: string[];
}

interface PurchaseOrderFormProps {
  customerId: string;
  wholesaleTier: string;
  onOrderCreated: (orderId: string) => void;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  customerId,
  wholesaleTier,
  onOrderCreated
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const tierInfo = wholesalePricingService.getTierInfo(wholesaleTier);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await productService.getAll();
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    const wholesalePrice = wholesalePricingService.calculateWholesalePrice(product.price, wholesaleTier);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: PurchaseOrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        wholesalePrice,
        total: wholesalePrice
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.productId !== productId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, total: item.wholesalePrice * newQuantity }
          : item
      ));
    }
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const discount = wholesalePricingService.calculateOrderDiscount(subtotal, wholesaleTier);
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add items to your order');
      return;
    }

    const { total } = calculateTotals();
    if (tierInfo && total < tierInfo.minimumOrder) {
      toast.error(`Minimum order of $${tierInfo.minimumOrder} required for ${tierInfo.name} tier`);
      return;
    }

    setLoading(true);
    try {
      const purchaseOrder = await wholesalePricingService.createPurchaseOrder(
        customerId,
        orderItems,
        wholesaleTier
      );

      if (purchaseOrder) {
        toast.success('Purchase order created successfully!');
        onOrderCreated(purchaseOrder.id);
        setOrderItems([]);
      } else {
        toast.error('Failed to create purchase order');
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Tier Information */}
      {tierInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white">
                {tierInfo.name} Tier
              </Badge>
              <span className="text-lg">{tierInfo.discountPercentage}% Wholesale Discount</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Minimum Order: ${tierInfo.minimumOrder}</p>
                <p className="text-sm text-gray-600">Credit Terms: {tierInfo.creditTerms}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Benefits:</p>
                <ul className="text-xs text-gray-600 list-disc list-inside">
                  {tierInfo.benefits.slice(0, 2).map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Search */}
      <Card>
        <CardHeader>
          <CardTitle>Add Products to Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="search">Search Products</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredProducts.map(product => {
              const wholesalePrice = wholesalePricingService.calculateWholesalePrice(product.price, wholesaleTier);
              const savings = product.price - wholesalePrice;
              
              return (
                <div key={product.id} className="border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2">{product.name}</h4>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 line-through">Retail: ${product.price}</span>
                      <span className="text-green-600 font-medium">Save ${savings.toFixed(2)}</span>
                    </div>
                    <div className="text-sm font-bold text-risevia-purple">
                      Wholesale: ${wholesalePrice.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToOrder(product)}
                    className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add to Order
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      {orderItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Items ({orderItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderItems.map(item => (
                <div key={item.productId} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-gray-600">
                      ${item.wholesalePrice.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">${item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Wholesale Discount ({tierInfo?.discountPercentage}%):</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                {tierInfo && total < tierInfo.minimumOrder && (
                  <p className="text-sm text-red-600">
                    Minimum order of ${tierInfo.minimumOrder} required
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleSubmitOrder}
              disabled={loading || orderItems.length === 0 || (tierInfo ? total < tierInfo.minimumOrder : false)}
              className="w-full mt-4 bg-gradient-to-r from-risevia-purple to-risevia-teal"
            >
              {loading ? 'Creating Order...' : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
