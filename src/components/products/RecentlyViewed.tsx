import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  strainType: string;
  thcaPercentage: number;
  thcPercentage: number;
  price: number;
  images: string[];
  description: string;
  effects: string[];
  terpenes: Array<{ name: string; percentage: number }>;
  batchNumber: string;
  harvestDate: string;
  labResultsUrl: string;
  inventory: number;
  featured: boolean;
}

interface RecentlyViewedProps {
  onViewDetails: (product: Product) => void;
}

export default function RecentlyViewed({ onViewDetails }: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getRecentlyViewed = (): Product[] => {
      const stored = localStorage.getItem('risevia-recently-viewed');
      return stored ? JSON.parse(stored) : [];
    };
    
    const recentProducts = getRecentlyViewed();
    setProducts(recentProducts);
  }, []);

  if (products.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12"
    >
      <h2 className="text-2xl font-bold gradient-text mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </motion.section>
  );
}
