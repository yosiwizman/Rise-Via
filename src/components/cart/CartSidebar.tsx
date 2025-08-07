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
  onNavigate: (page: string) => void;
}

export const CartSidebar = ({ isOpen, onClose, onNavigate }: CartSidebarProps) => {
  const { items, getCartTotal, removeFromCart, updateQuantity, clearCart } = useCart();

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
            <span className="text-sm font-medium text-risevia-black dark:text-gray-100">
              ${item.price.toFixed(2)}
            </span>
          </div>
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
      <SheetContent side="right" className="w-full sm:max-w-lg bg-white dark:bg-gray-900">
        <SheetHeader className="space-y-4">
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

        <div className="flex-1 overflow-y-auto py-4">
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
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-risevia-black dark:text-gray-100">
                Total:
              </span>
              <span className="text-xl font-bold gradient-text">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white py-3 text-lg"
              onClick={() => {
                console.log('🚀 Proceeding to checkout...');
                onNavigate('checkout');
                onClose();
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
