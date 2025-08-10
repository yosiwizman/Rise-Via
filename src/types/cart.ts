export interface QuantityBreak {
  minQuantity: number;
  discountPercentage: number;
  discountedPrice: number;
}

export interface BundleSuggestion {
  productId: string;
  name: string;
  additionalQuantity: number;
  discountPercentage: number;
  message: string;
}

export interface CartProgress {
  current: number;
  target: number;
  benefit: string;
  percentage: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  strainType: string;
  thcaPercentage: number;
  quantity: number;
  dateAdded: number;
  quantityBreaks?: QuantityBreak[];
  bundleSuggestions?: BundleSuggestion[];
}

export interface CartStats {
  totalItems: number;
  totalValue: number;
  itemCount: number;
  dateCreated: number;
  lastUpdated: number;
  subtotal: number;
  tax: number;
  estimatedDelivery: string;
  progress: CartProgress;
}

export interface CartState {
  items: CartItem[];
  stats: CartStats;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CartActions {
  addToCart: (item: Omit<CartItem, 'id' | 'dateAdded' | 'quantity' | 'quantityBreaks' | 'bundleSuggestions'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string) => boolean;
  setCartOpen: (open: boolean) => void;
}

export type CartStore = CartState & CartActions;
