import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { WishlistButton } from './wishlist/WishlistButton';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    strainType: string;
    category: string;
    thcaPercentage: number;
    description: string;
    effects: string[];
    inventory: number;
  } | null;
}

export const ProductDetailModal = ({ isOpen, onClose, product }: ProductDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
          <DialogDescription className="sr-only">
            Product details for {product.name} - {product.strainType} strain with {product.thcaPercentage}% THCA
          </DialogDescription>
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
                  image: product.images[0],
                  category: product.category,
                  strainType: product.strainType,
                  thcaPercentage: product.thcaPercentage
                });
                toast.success(`${product.name} added to cart!`, {
                  description: `$${product.price} • ${product.thcaPercentage}% THCA`,
                  duration: 3000,
                });
              }}
              className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal text-white py-3 text-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
