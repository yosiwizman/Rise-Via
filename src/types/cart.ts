export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  strainType: string;
  thcaPercentage: number;
  quantity: number;
  dateAdded: number;
}

export interface CartStats {
  totalItems: number;
  totalValue: number;
  itemCount: number;
  dateCreated: number;
  lastUpdated: number;
}

export interface CartState {
  items: CartItem[];
  stats: CartStats;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CartActions {
  addToCart: (item: Omit<CartItem, 'id' | 'dateAdded' | 'quantity'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string) => boolean;
  setCartOpen: (open: boolean) => void;
}

export type CartStore = CartState & CartActions;
