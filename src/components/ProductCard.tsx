import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, ShoppingCart, Bell, Eye } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { membershipService } from '../services/membershipService';
import { useCustomer } from '../contexts/CustomerContext';
import { PriceAlertModal } from './PriceAlertModal';
import { ProductDetailModal } from './ProductDetailModal';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  strain_type?: string;
  thc_percentage?: number;
  cbd_percentage?: number;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false
}) => {
  const { customer } = useCustomer();
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToWishlist, isInWishlist: checkWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const customerTier = customer?.customer_profiles?.[0]?.membership_tier || 'GREEN';
  const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const tierDiscount = membershipService.calculateDiscount(numericPrice, customerTier);
  const discountedPrice = numericPrice - tierDiscount;
  const discountPercentage = tierDiscount > 0 ? (tierDiscount / numericPrice) * 100 : 0;
  
  const inWishlist = isInWishlist || checkWishlist(product.id);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      if (onAddToCart) {
        onAddToCart(product);
      } else {
        await addToCart({
          productId: product.id,
          name: product.name,
          price: discountedPrice,
          originalPrice: numericPrice,
          image: product.images[0] || '/placeholder-product.jpg',
          category: product.category,
          strainType: product.strain_type || '',
          thcaPercentage: product.thc_percentage || 0
        });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (onToggleWishlist) {
        onToggleWishlist(product.id);
      } else {
        await addToWishlist({
          name: product.name,
          price: numericPrice,
          image: product.images[0] || '/placeholder-product.jpg',
          category: product.category,
          thcContent: product.thc_percentage?.toString(),
          cbdContent: product.cbd_percentage?.toString(),
          effects: []
        });
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Tier Discount Badge */}
        {tierDiscount > 0 && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gradient-to-r from-risevia-purple to-risevia-teal text-white font-bold">
              {(typeof discountPercentage === 'number' ? discountPercentage : parseFloat(discountPercentage) || 0).toFixed(0)}% OFF
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={handleToggleWishlist}
            className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart 
              className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
            />
          </button>
          <button
            onClick={() => setShowPriceAlert(true)}
            className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            title="Set price alert"
          >
            <Bell className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Strain Type Badge */}
        {product.strain_type && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-white/90">
              {product.strain_type}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
            )}
          </div>

          {/* THC/CBD Info */}
          {(product.thc_percentage || product.cbd_percentage) && (
            <div className="flex gap-2 text-xs">
              {product.thc_percentage && (
                <Badge variant="outline">THC: {product.thc_percentage}%</Badge>
              )}
              {product.cbd_percentage && (
                <Badge variant="outline">CBD: {product.cbd_percentage}%</Badge>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {tierDiscount > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-risevia-purple">
                      ${(typeof discountedPrice === 'number' ? discountedPrice : parseFloat(discountedPrice) || 0).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${(typeof numericPrice === 'number' ? numericPrice : parseFloat(numericPrice) || 0).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold">${(typeof numericPrice === 'number' ? numericPrice : parseFloat(numericPrice) || 0).toFixed(2)}</span>
                )}
              </div>
              
              {customer && (
                <TierBadge 
                  tier={customerTier} 
                  discount={membershipService.getTierInfo(customerTier)?.discount}
                  showDiscount={tierDiscount > 0}
                  size="sm"
                />
              )}
            </div>

            {/* Member Savings */}
            {tierDiscount > 0 && (
              <div className="text-xs text-green-600 font-medium">
                You save ${(typeof tierDiscount === 'number' ? tierDiscount : parseFloat(tierDiscount) || 0).toFixed(2)} with {customerTier} membership!
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 bg-gradient-to-r from-risevia-purple to-risevia-teal hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button
              onClick={() => setShowProductDetail(true)}
              variant="outline"
              size="sm"
              className="px-3"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <PriceAlertModal
        isOpen={showPriceAlert}
        onClose={() => setShowPriceAlert(false)}
        productId={product.id}
        productName={product.name}
        currentPrice={numericPrice}
      />
      
      <ProductDetailModal
        isOpen={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        product={product}
      />
    </Card>
  );
};
