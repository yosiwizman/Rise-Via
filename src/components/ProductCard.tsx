import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { membershipService } from '../services/membershipService';
import { useCustomer } from '../contexts/CustomerContext';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  strain_type?: string;
  thc_percentage?: number;
  cbd_percentage?: number;
  description?: string;
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
  
  const customerTier = customer?.customer_profiles?.[0]?.membership_tier || 'GREEN';
  const tierDiscount = membershipService.calculateDiscount(product.price, customerTier);
  const discountedPrice = product.price - tierDiscount;
  const discountPercentage = tierDiscount > 0 ? (tierDiscount / product.price) * 100 : 0;

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
              {discountPercentage.toFixed(0)}% OFF
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => onToggleWishlist?.(product.id)}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>

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
                      ${discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
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
                You save ${tierDiscount.toFixed(2)} with {customerTier} membership!
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={() => onAddToCart?.(product)}
            className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal hover:opacity-90 transition-opacity"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
