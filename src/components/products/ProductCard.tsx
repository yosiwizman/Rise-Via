import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { useCart } from '../../context/CartContext';
import AddToCartToast from '../ui/AddToCartToast';

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

interface ProductCardProps {
  product: Product;
  index: number;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, index, onViewDetails }: ProductCardProps) {
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState(false);

  const getPotencyBadge = (potency: number) => {
    if (potency >= 30) {
      return <Badge className="bg-risevia-purple text-white">Premium {potency}%</Badge>;
    } else if (potency >= 25) {
      return <Badge className="bg-risevia-teal text-white">Strong {potency}%</Badge>;
    } else {
      return <Badge className="bg-gray-600 text-white">Standard {potency}%</Badge>;
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      strainType: product.strainType,
      thcaPercentage: product.thcaPercentage
    });
    setShowToast(true);
  };

  return (
    <>
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="card-light border-gray-200 hover:border-risevia-purple/40 transition-all duration-300 overflow-hidden group">
          <div className="aspect-square bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 relative overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              {getPotencyBadge(product.thcaPercentage)}
            </div>
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="border-white text-white bg-black/50">
                {product.strainType}
              </Badge>
            </div>
          </div>
          
          <CardHeader className="pb-2">
            <CardTitle className="text-risevia-black dark:text-gray-100 text-lg">{product.name}</CardTitle>
            <div className="flex justify-between text-sm text-risevia-charcoal dark:text-gray-300">
              <span>${product.price}</span>
              <span>Stock: {product.inventory}</span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            <p className="text-risevia-charcoal dark:text-gray-300 text-sm line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {product.effects.slice(0, 3).map((effect, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-risevia-teal text-risevia-teal">
                  {effect}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-risevia-purple text-risevia-purple hover:bg-risevia-purple hover:text-white"
                    onClick={() => onViewDetails(product)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Button
                size="sm"
                className="flex-1 neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <AddToCartToast 
        message={`${product.name} added to cart!`}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
