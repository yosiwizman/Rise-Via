import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: {
    id: string;
    strain_name: string;
    category: string;
    thca_potency: number;
    volume: string;
    price: number;
    image_url: string;
    description: string;
    batch_id: string;
    lab_results_url?: string;
    in_stock: boolean;
    rating?: number;
    review_count?: number;
  };
  onViewDetails: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

export const ProductCard = ({ product, onViewDetails, onAddToCart }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="card-light border-gray-200 hover:border-risevia-teal/40 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Product Image */}
        <div className="aspect-square bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.strain_name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className="bg-risevia-teal text-white">
              {product.thca_potency}% THCA
            </Badge>
            {!product.in_stock && (
              <Badge variant="destructive">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="w-10 h-10 p-0"
              onClick={() => onViewDetails(product.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-risevia-black dark:text-gray-100 text-lg">
                {product.strain_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-risevia-charcoal dark:text-gray-300/70">
                <span>{product.category}</span>
                <span>•</span>
                <span>{product.volume}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-risevia-purple">
                ${product.price}
              </div>
              {product.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{product.rating}</span>
                  {product.review_count && (
                    <span className="text-gray-500">({product.review_count})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow flex flex-col">
          <p className="text-risevia-charcoal dark:text-gray-300 text-sm mb-4 flex-grow">
            {product.description}
          </p>
          
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              Batch: {product.batch_id}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => onViewDetails(product.id)}
                variant="outline"
                className="flex-1 border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
              >
                View Details
              </Button>
              
              <Button
                onClick={() => onAddToCart(product.id)}
                disabled={!product.in_stock}
                className="flex-1 neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
