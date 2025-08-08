import { useEffect } from 'react';
import { useToast } from '../hooks/use-toast';

export function ToastEventHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const handleCartItemAdded = (event: CustomEvent) => {
      const { name, quantity } = event.detail;
      toast({
        title: "Added to Cart",
        description: `${name} has been added to your cart${quantity > 1 ? ` (${quantity})` : ''}.`,
      });
    };

    const handleWishlistItemAdded = (event: CustomEvent) => {
      const { name } = event.detail;
      toast({
        title: "Added to Wishlist",
        description: `${name} has been added to your wishlist.`,
      });
    };

    const handleWishlistItemRemoved = (event: CustomEvent) => {
      const { name } = event.detail;
      toast({
        title: "Removed from Wishlist",
        description: `${name} has been removed from your wishlist.`,
      });
    };

    window.addEventListener('cart-item-added', handleCartItemAdded as EventListener);
    window.addEventListener('wishlist-item-added', handleWishlistItemAdded as EventListener);
    window.addEventListener('wishlist-item-removed', handleWishlistItemRemoved as EventListener);

    return () => {
      window.removeEventListener('cart-item-added', handleCartItemAdded as EventListener);
      window.removeEventListener('wishlist-item-added', handleWishlistItemAdded as EventListener);
      window.removeEventListener('wishlist-item-removed', handleWishlistItemRemoved as EventListener);
    };
  }, [toast]);

  return null;
}
