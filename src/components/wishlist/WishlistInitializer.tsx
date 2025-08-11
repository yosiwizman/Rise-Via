import { useEffect } from 'react';
import { useWishlist } from '../../hooks/useWishlist';

export const WishlistInitializer = () => {
  const { initializeSession } = useWishlist();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return null;
};
