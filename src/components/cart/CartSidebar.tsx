import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ShoppingBag, Plus, Minus, Trash2, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { CartItem } from '../../types/cart';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export const CartSidebar = ({ isOpen, onClose, onNavigate }: CartSidebarProps) => {
  const { items, removeFromCart, updateQuantity, clearCart, stats } = useCart();
  
  if (!stats) {
    return null;
  }

  const CartItemComponent = ({ item }: { item: CartItem }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuantityChange = async (newQuantity: number) => {
      setIsUpdating(true);
      updateQuantity(item.id, newQuantity);
      setTimeout(() => setIsUpdating(false), 200);
    };

    return (
      <div className="flex items-center space-x-3 py-4">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-risevia-black dark:text-gray-100 truncate">
            {item.name}
          </h4>
          <p className="text-sm text-risevia-charcoal dark:text-gray-400 capitalize">
            {item.strainType} • {item.category}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge className="bg-risevia-teal text-white text-xs">
              {item.thcaPercentage}% THCA
            </Badge>
            {item.originalPrice && item.originalPrice !== item.price && (
              <Badge className="bg-green-500 text-white text-xs">
                {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
              </Badge>
            )}
            <span className="text-sm font-medium text-risevia-black dark:text-gray-100">
              ${(typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0).toFixed(2)}
            </span>
          </div>
          
          {item.quantityBreaks && item.quantityBreaks.length > 0 && (
            <div className="mt-2 text-xs text-risevia-teal">
              {item.quantityBreaks.map((qb, idx) => (
                <div key={idx}>
                  Buy {qb.minQuantity}+ for ${(typeof qb.discountedPrice === 'number' ? qb.discountedPrice : parseFloat(qb.discountedPrice) || 0).toFixed(2)} each
                </div>
              ))}
            </div>
          )}
          
          {item.bundleSuggestions && item.bundleSuggestions.length > 0 && (
            <div className="mt-2 text-xs text-risevia-purple">
              {item.bundleSuggestions[0].message}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center font-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-96 max-w-full bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
        <SheetHeader className="p-4 border-b bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold gradient-text">
              Shopping Cart
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {items.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-risevia-charcoal dark:text-gray-400">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700"
              >
                Clear Cart
              </Button>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-risevia-black dark:text-gray-100 mb-2">
                Your cart is empty
              </h3>
              <p className="text-risevia-charcoal dark:text-gray-400 mb-6">
                Add some premium THCA products to get started
              </p>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {items.map((item, index) => (
                <div key={item.id}>
                  <CartItemComponent item={item} />
                  {index < items.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 bg-white dark:bg-gray-900 flex-shrink-0 space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to free delivery</span>
                <span>${(stats?.subtotal || 0).toFixed(2)} / $75.00</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-risevia-purple to-risevia-teal h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(((stats?.subtotal || 0) / 75) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            {/* Tax and Total Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${(stats?.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>${(stats?.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-lg font-semibold text-risevia-black dark:text-gray-100">
                  Total:
                </span>
                <span className="text-xl font-bold gradient-text">
                  ${(stats?.totalValue || 0).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-risevia-charcoal">
                Estimated delivery: {stats?.estimatedDelivery || 'Next business day'}
              </div>
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white py-3 text-lg touch-optimized"
              onClick={() => {
                console.log('🚀 Proceeding to checkout...');
                try {
                  if (onNavigate) {
                    onNavigate('checkout');
                    onClose();
                  }
                } catch (error) {
                  console.error('Checkout navigation error:', error);
                }
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
