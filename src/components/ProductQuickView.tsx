import { ProductDetailModal } from './ProductDetailModal';

interface ProductQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    thcaPercentage?: number;
    category: string;
    effects?: string[];
    strainType?: string;
    description: string;
    [key: string]: unknown;
  };
}

export const ProductQuickView = ({ isOpen, onClose, product }: ProductQuickViewProps) => {
  return (
    <ProductDetailModal
      isOpen={isOpen}
      onClose={onClose}
      product={product}
      mode="quick"
    />
  );
};
