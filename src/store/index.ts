import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  thcaContent: number;
  category: string;
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: boolean;
  emailUpdates: boolean;
}

export interface AppState {
  cartItems: CartItem[];
  cartOpen: boolean;
  cartTotal: number;
  
  darkMode: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  accessibilityWidgetOpen: boolean;
  
  ageVerified: boolean;
  userPreferences: UserPreferences;
  
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  toggleDarkMode: () => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  toggleAccessibilityWidget: () => void;
  
  setAgeVerified: (verified: boolean) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
}

const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      cartOpen: false,
      cartTotal: 0,
      darkMode: false,
      searchOpen: false,
      mobileMenuOpen: false,
      accessibilityWidgetOpen: false,
      ageVerified: false,
      userPreferences: {
        currency: 'USD',
        language: 'en',
        notifications: true,
        emailUpdates: false,
      },
      
      addToCart: (newItem) => {
        const { cartItems } = get();
        const existingItem = cartItems.find(item => item.id === newItem.id);
        
        let updatedItems: CartItem[];
        if (existingItem) {
          updatedItems = cartItems.map(item =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedItems = [...cartItems, { ...newItem, quantity: 1 }];
        }
        
        set({
          cartItems: updatedItems,
          cartTotal: calculateCartTotal(updatedItems),
        });
      },
      
      removeFromCart: (id) => {
        const { cartItems } = get();
        const updatedItems = cartItems.filter(item => item.id !== id);
        set({
          cartItems: updatedItems,
          cartTotal: calculateCartTotal(updatedItems),
        });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        
        const { cartItems } = get();
        const updatedItems = cartItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
        set({
          cartItems: updatedItems,
          cartTotal: calculateCartTotal(updatedItems),
        });
      },
      
      clearCart: () => {
        set({
          cartItems: [],
          cartTotal: 0,
        });
      },
      
      toggleCart: () => {
        set(state => ({ cartOpen: !state.cartOpen }));
      },
      
      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });
        
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      toggleSearch: () => {
        set(state => ({ searchOpen: !state.searchOpen }));
      },
      
      toggleMobileMenu: () => {
        set(state => ({ mobileMenuOpen: !state.mobileMenuOpen }));
      },
      
      toggleAccessibilityWidget: () => {
        set(state => ({ accessibilityWidgetOpen: !state.accessibilityWidgetOpen }));
      },
      
      setAgeVerified: (verified) => {
        set({ ageVerified: verified });
      },
      
      updateUserPreferences: (preferences) => {
        set(state => ({
          userPreferences: { ...state.userPreferences, ...preferences }
        }));
      },
    }),
    {
      name: 'risevia-store',
      partialize: (state) => ({
        cartItems: state.cartItems,
        cartTotal: state.cartTotal,
        darkMode: state.darkMode,
        ageVerified: state.ageVerified,
        userPreferences: state.userPreferences,
      }),
    }
  )
);

export const initializeDarkMode = () => {
  const { darkMode } = useAppStore.getState();
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
