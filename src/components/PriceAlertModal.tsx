import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bell, X } from 'lucide-react';
import { priceAlertsService } from '../services/priceAlertsService';
import { useCustomer } from '../contexts/CustomerContext';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentPrice: number;
}

export const PriceAlertModal = ({ isOpen, onClose, productId, productName, currentPrice }: PriceAlertModalProps) => {
  const { customer, isAuthenticated } = useCustomer();
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !customer?.id) {
      window.alert('Please log in to set price alerts');
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      window.alert('Please enter a valid price');
      return;
    }

    if (price >= currentPrice) {
      window.alert('Target price must be lower than current price');
      return;
    }

    setLoading(true);

    try {
      const alert = await priceAlertsService.createAlert({
        customer_id: customer.id,
        product_id: productId,
        product_name: productName,
        target_price: price,
        current_price: currentPrice,
        is_active: true
      });

      if (alert) {
        window.alert('Price alert set successfully! You\'ll be notified when the price drops.');
        setTargetPrice('');
        onClose();
      } else {
        window.alert('Failed to set price alert. Please try again.');
      }
    } catch {
      window.alert('Failed to set price alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Set Price Alert
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">{productName}</Label>
              <div className="text-sm text-gray-600">Current price: ${(typeof currentPrice === 'number' ? currentPrice : parseFloat(currentPrice) || 0).toFixed(2)}</div>
            </div>
            
            <div>
              <Label htmlFor="targetPrice">Alert me when price drops to:</Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                min="0.01"
                max={currentPrice - 0.01}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter target price"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Must be lower than current price
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !isAuthenticated}
                className="flex-1 bg-gradient-to-r from-risevia-purple to-risevia-teal"
              >
                {loading ? 'Setting Alert...' : 'Set Alert'}
              </Button>
            </div>

            {!isAuthenticated && (
              <div className="text-sm text-gray-600 text-center">
                Please log in to set price alerts
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
