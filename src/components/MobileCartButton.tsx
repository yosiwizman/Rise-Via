import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const MobileCartButton: React.FC = () => {
  const { getCartCount, setCartOpen } = useCart();
  const itemCount = getCartCount();
  
  if (itemCount === 0) return null;
  
  return (
    <button
      onClick={() => setCartOpen(true)}
      className="fixed bottom-24 right-4 z-50 md:hidden bg-gradient-to-r from-risevia-purple to-risevia-teal text-white p-4 rounded-full shadow-xl animate-bounce"
      aria-label={`Cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">
        {itemCount}
      </span>
    </button>
  );
};

export default MobileCartButton;
