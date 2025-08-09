import { ProductDetailModal } from './ProductDetailModal';

interface ProductQuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
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
