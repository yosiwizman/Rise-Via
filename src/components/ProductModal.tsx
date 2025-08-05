import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Star, Shield, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    effects?: string[];
    terpenes?: { name: string; percentage: number }[];
    harvest_date?: string;
    test_date?: string;
  };
  onAddToCart: (productId: string) => void;
}

export const ProductModal = ({ isOpen, onClose, product, onAddToCart }: ProductModalProps) => {
  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-risevia-charcoal">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold text-risevia-black dark:text-white">
              {product.strain_name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-risevia-teal text-white text-lg px-3 py-1">
                {product.thca_potency}% THCA
              </Badge>
              {!product.in_stock && (
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-lg overflow-hidden">
              <img
                src={product.image_url}
                alt={product.strain_name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Product Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-risevia-black/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-risevia-purple">{product.thca_potency}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">THCA Potency</div>
              </div>
              <div className="bg-gray-50 dark:bg-risevia-black/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-risevia-teal">{product.volume}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {product.category} • {product.volume}
                  </div>
                  <div className="text-3xl font-bold text-risevia-purple">
                    ${product.price}
                  </div>
                </div>
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({product.review_count} reviews)
                    </span>
                  </div>
                )}
              </div>

              <p className="text-risevia-charcoal dark:text-gray-300 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Effects */}
              {product.effects && product.effects.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-risevia-black dark:text-white mb-3">
                    Effects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.effects.map((effect, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-risevia-teal text-risevia-teal"
                      >
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Terpenes */}
              {product.terpenes && product.terpenes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-risevia-black dark:text-white mb-3">
                    Terpene Profile
                  </h4>
                  <div className="space-y-2">
                    {product.terpenes.map((terpene, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-risevia-charcoal dark:text-gray-300">
                          {terpene.name}
                        </span>
                        <span className="text-sm font-medium text-risevia-purple">
                          {terpene.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Lab Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-risevia-teal" />
                  <div>
                    <div className="font-medium text-risevia-black dark:text-white">
                      Lab Tested & Verified
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Batch: {product.batch_id}
                    </div>
                  </div>
                </div>

                {product.test_date && (
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-risevia-purple" />
                    <div>
                      <div className="font-medium text-risevia-black dark:text-white">
                        Test Date
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(product.test_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {product.lab_results_url && (
                  <Button
                    variant="outline"
                    className="w-full border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
                    onClick={() => window.open(product.lab_results_url, '_blank')}
                  >
                    View Lab Results (COA)
                  </Button>
                )}
              </div>

              <Separator className="my-6" />

              {/* Add to Cart */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {product.in_stock ? `Add to Cart - $${product.price}` : 'Out of Stock'}
                </Button>

                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p>🔒 Secure checkout • 21+ only • Lab tested products</p>
                  <p>⚠️ This product has not been evaluated by the FDA</p>
                  <p>🌿 Contains less than 0.3% Delta-9 THC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
