import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { WishlistButton } from './wishlist/WishlistButton';
import { useCart } from '../hooks/useCart';
import { ProductReviews } from './ProductReviews';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  mode?: 'full' | 'quick';
}

export const ProductDetailModal = ({ isOpen, onClose, product, mode = 'full' }: ProductDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'recommendations'>('details');
  const { addToCart } = useCart();

  if (!product) return null;


  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
              />
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded border-2 overflow-hidden ${
                      index === currentImageIndex ? 'border-risevia-purple' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-risevia-charcoal text-sm capitalize mb-2">{product.strainType} • {product.category}</p>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-3xl font-bold text-risevia-black">${product.price}</span>
                  <Badge className="bg-risevia-teal text-white">{product.thcaPercentage}% THCA</Badge>
                </div>
              </div>
              <WishlistButton
                item={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0],
                  category: product.category,
                  effects: product.effects
                }}
                size="lg"
              />
            </div>

            <p className="text-risevia-charcoal leading-relaxed">{product.description}</p>

            <div>
              <h4 className="font-semibold text-risevia-black mb-2">Effects</h4>
              <div className="flex flex-wrap gap-2">
                {product.effects.map((effect: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-risevia-purple text-risevia-purple">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-risevia-charcoal">In Stock:</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {product.inventory} units
              </Badge>
            </div>

            <Button 
              onClick={() => {
                addToCart({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.price,
                  image: product.images[0],
                  category: product.category,
                  strainType: product.strainType,
                  thcaPercentage: product.thcaPercentage
                });
                console.log('✅ Added to cart from modal:', product.name);
                if (mode === 'quick') {
                  onClose();
                }
              }}
              className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white py-3 text-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {mode === 'full' && (
          <div className="mt-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-risevia-purple text-risevia-purple'
                    : 'text-risevia-charcoal hover:text-risevia-purple'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-risevia-purple text-risevia-purple'
                    : 'text-risevia-charcoal hover:text-risevia-purple'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'recommendations'
                    ? 'border-b-2 border-risevia-purple text-risevia-purple'
                    : 'text-risevia-charcoal hover:text-risevia-purple'
                }`}
              >
                Similar Products
              </button>
            </div>

            <div className="mt-4">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-risevia-black mb-2">Product Details</h4>
                    <p className="text-risevia-charcoal">{product.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-risevia-black mb-2">Lab Results</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-risevia-charcoal">THCA:</span>
                        <span className="ml-2 font-medium">{product.thcaPercentage}%</span>
                      </div>
                      <div>
                        <span className="text-risevia-charcoal">Type:</span>
                        <span className="ml-2 font-medium capitalize">{product.strainType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <ProductReviews productId={product.id} />
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-risevia-black mb-3">Similar Products</h4>
                    <p className="text-risevia-charcoal">Recommendations will be available soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
