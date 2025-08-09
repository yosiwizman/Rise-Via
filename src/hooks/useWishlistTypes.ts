export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dateAdded: string;
  priceAlert?: {
    targetPrice: number;
    isActive: boolean;
  };
  thcContent?: number;
  effects?: string[];
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  priorityCounts: {
    high: number;
    medium: number;
    low: number;
  };
  categoryCounts: Record<string, number>;
}

export interface WishlistHook {
  items: WishlistItem[];
  stats: WishlistStats;
  removeFromWishlist: (id: string) => void;
  updateItemPriority: (id: string, priority: 'low' | 'medium' | 'high') => void;
  clearWishlist: () => void;
  setPriceAlert: (id: string, targetPrice: number) => void;
  removePriceAlert: (id: string) => void;
  generateShareLink: () => Promise<string>;
  sortItems: () => WishlistItem[];
}
