export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  thcContent?: string;
  cbdContent?: string;
  effects?: string[];
  dateAdded: number;
  priority: 'low' | 'medium' | 'high';
  priceAlert?: PriceAlert;
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  categoryCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  dateCreated: number;
  lastUpdated: number;
}

export interface WishlistShare {
  id: string;
  items: WishlistItem[];
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
  isPublic: boolean;
  shareCode: string;
  title?: string;
  description?: string;
}

export interface PriceAlert {
  id: string;
  itemId: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
  notificationSent: boolean;
}

export interface WishlistAnalytics {
  addToWishlistEvents: number;
  removeFromWishlistEvents: number;
  shareEvents: number;
  importEvents: number;
  conversionEvents: number;
  averageItemsPerWishlist: number;
  topCategories: Array<{ category: string; count: number }>;
  priceAlertConversions: number;
  returnVisitorRate: number;
}

export interface WishlistState {
  items: WishlistItem[];
  stats: WishlistStats;
  isLoading: boolean;
  error: string | null;
}

export interface WishlistActions {
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'dateAdded' | 'priority'>) => void;
  removeFromWishlist: (itemId: string) => void;
  updateItemPriority: (itemId: string, priority: WishlistItem['priority']) => void;
  clearWishlist: () => void;
  isInWishlist: (itemId: string) => boolean;
  getWishlistCount: () => number;
  generateShareLink: () => Promise<string>;
  importWishlist: (shareCode: string) => Promise<boolean>;
  setPriceAlert: (itemId: string, targetPrice: number) => void;
  removePriceAlert: (itemId: string) => void;
  getItemsByCategory: (category: string) => WishlistItem[];
  getItemsByPriority: (priority: WishlistItem['priority']) => WishlistItem[];
  sortItems: (sortBy: 'name' | 'price' | 'dateAdded' | 'priority') => WishlistItem[];
}

export type WishlistStore = WishlistState & WishlistActions;
