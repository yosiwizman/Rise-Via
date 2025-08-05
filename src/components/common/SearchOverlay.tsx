import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { products } from '../../data/products.json';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProduct?: (productId: string) => void;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  strainType: string;
  thcaPercentage: number;
  price: number;
  images: string[];
  description: string;
  effects: string[];
  inventory: number;
  featured: boolean;
}

export default function SearchOverlay({ isOpen, onClose, onNavigateToProduct }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = products.filter((product: Product) => {
      const searchLower = searchTerm.toLowerCase();
      
      if (product.name.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      if (product.strainType.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      if (product.effects.some(effect => effect.toLowerCase().includes(searchLower))) {
        return true;
      }
      
      return false;
    }).slice(0, 5); // Max 5 results

    setSearchResults(filtered);
  }, [searchTerm]);

  const handleProductClick = (product: Product) => {
    if (onNavigateToProduct) {
      onNavigateToProduct(product.id);
    }
    onClose();
  };

  const handleClose = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          
          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search products by name, strain type, or effects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg border-risevia-purple focus:ring-risevia-purple focus:border-risevia-purple"
                  autoFocus
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-risevia-charcoal dark:text-gray-300 hover:text-risevia-purple"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchTerm.trim() === '' ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-risevia-charcoal dark:text-gray-300 mb-2">
                    Search Cannabis Products
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Search by product name, strain type (sativa, indica, hybrid), or effects
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-risevia-charcoal dark:text-gray-300 mb-2">
                    No products found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Try searching for different terms or browse our full catalog
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {searchResults.map((product) => (
                    <motion.button
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full p-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Product Image */}
                        <div className="w-12 h-12 bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-risevia-black dark:text-white truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-risevia-teal text-risevia-teal">
                              {product.strainType}
                            </Badge>
                            <span className="text-sm text-risevia-charcoal dark:text-gray-300">
                              {product.thcaPercentage}% THCA
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {product.effects.slice(0, 2).map((effect, idx) => (
                              <span key={idx} className="text-xs text-gray-500 dark:text-gray-400">
                                {effect}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold text-risevia-purple">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                  
                  {searchResults.length === 5 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Showing top 5 results. Refine your search for more specific results.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">ESC</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
