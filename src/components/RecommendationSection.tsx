import { RecommendationEngine } from '../services/RecommendationEngine';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface Product {
  id: string;
  name: string;
  strainType: string;
  thcaPercentage: number;
  effects: string[];
  category: string;
  price: number;
  images: string[];
}

interface RecommendationSectionProps {
  currentProduct: Product;
  onProductClick?: (product: Product) => void;
}

export const RecommendationSection = ({ currentProduct, onProductClick }: RecommendationSectionProps) => {
  const recommendations = RecommendationEngine.getRecommendations(currentProduct);

  const ProductCard = ({ product }: { product: Product }) => (
    <Card 
      className="cursor-pointer hover:border-risevia-purple transition-colors"
      onClick={() => onProductClick?.(product)}
    >
      <CardContent className="p-3">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-32 object-cover rounded mb-2" 
        />
        <h5 className="font-medium text-sm mb-1">{product.name}</h5>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-risevia-black">${product.price}</span>
          <Badge className="bg-risevia-teal text-white text-xs">
            {product.thcaPercentage}% THCA
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 mt-8">
      {recommendations.similar.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-risevia-black mb-4">Similar Effects</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.similar.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {recommendations.pairs_well.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-risevia-black mb-4">Frequently Bought Together</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.pairs_well.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {recommendations.potency_match.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-risevia-black mb-4">Similar Potency</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.potency_match.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
