import { useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  strainType: string;
  thcaPercentage: number;
}

export function useRecentlyViewed(product?: Product) {
  useEffect(() => {
    if (!product) return;
    
    const stored = localStorage.getItem('risevia-recently-viewed');
    const recent = stored ? JSON.parse(stored) : [];
    
    const filtered = recent.filter((p: Product) => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, 4);
    
    localStorage.setItem('risevia-recently-viewed', JSON.stringify(updated));
  }, [product]);

  const getRecentlyViewed = (): Product[] => {
    const stored = localStorage.getItem('risevia-recently-viewed');
    return stored ? JSON.parse(stored) : [];
  };

  return { getRecentlyViewed };
}
