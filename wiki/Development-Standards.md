# Development Standards

## Code Patterns

### Zustand Store Pattern
```typescript
interface StoreState {
  items: Item[]
  addItem: (item: Item) => void
  removeItem: (id: string) => void
}

export const useStore = create<StoreState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  removeItem: (id) => set((state) => ({ 
    items: state.items.filter(i => i.id !== id) 
  }))
}))
```

### Component Pattern
```typescript
interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export function Component({ className = '', children }: ComponentProps) {
  return (
    <div className={`base-styles ${className}`}>
      {children}
    </div>
  )
}
```

### Error Handling Pattern
```typescript
try {
  const result = await apiCall()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  toast.error('User-friendly error message')
  return null
}
```

## Data Management

### JSON Data Loading
```typescript
import { products } from '../data/products.json'

// Product filtering
const filteredProducts = products.filter(product => 
  product.strainType === selectedType
)
```

### Supabase Integration (Planned)
```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('active', true)
```

## Tailwind Styling Patterns

### Component Styling
- Cards: `rounded-lg shadow-md p-6 bg-white dark:bg-gray-800`
- Buttons: `px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark`
- Containers: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Responsive: mobile-first (default → sm → md → lg → xl)

### Cannabis Brand Colors
- Primary: Custom green tones defined in CSS
- Gradients: Brand-specific gradient classes
- Neon effects: Custom glow animations for interactive elements

## TypeScript Standards

### Interface Definitions
```typescript
interface Product {
  id: string
  name: string
  slug: string
  category: string
  strainType: 'sativa' | 'indica' | 'hybrid'
  thcaPercentage: number
  price: number
  images: string[]
  description: string
  effects: string[]
  featured: boolean
  inventory: number
}
```

### Hook Typing
```typescript
interface UseCartReturn {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  total: number
  itemCount: number
}

export function useCart(): UseCartReturn {
  // Implementation
}
```

## File Organization

### Component Structure
```
components/
├── ui/                 # shadcn/ui base components
├── cart/              # Cart-specific components
├── wishlist/          # Wishlist functionality
├── admin/             # Admin dashboard
└── [feature]/         # Feature-specific components
```

### Naming Conventions
- **Components**: PascalCase (`ProductCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useCart.ts`)
- **Utils**: camelCase (`formatPrice.ts`)
- **Types**: PascalCase (`Product.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

## State Management

### Zustand Stores
```typescript
// Cart Store
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    // Implementation
  },
  // Other methods
}))

// Wishlist Store
export const useWishlistStore = create<WishlistState>((set) => ({
  items: [],
  addToWishlist: (productId) => {
    // Implementation
  },
  // Other methods
}))
```

### Local Storage Integration
```typescript
// Persist cart data
const persistedCart = localStorage.getItem('risevia-cart')
if (persistedCart) {
  setCartItems(JSON.parse(persistedCart))
}
```

## Testing Patterns

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { ProductCard } from './ProductCard'

test('renders product information', () => {
  const mockProduct = {
    id: 'test-1',
    name: 'Test Strain',
    price: 45.00,
    // ... other properties
  }
  
  render(<ProductCard product={mockProduct} />)
  expect(screen.getByText('Test Strain')).toBeInTheDocument()
})
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCart } from './useCart'

test('adds item to cart', () => {
  const { result } = renderHook(() => useCart())
  
  act(() => {
    result.current.addItem(mockProduct)
  })
  
  expect(result.current.items).toHaveLength(1)
})
```

## Performance Optimization

### Image Optimization
```typescript
// Lazy loading with placeholder
<img 
  src={product.images[0]} 
  alt={product.name}
  loading="lazy"
  className="w-full h-48 object-cover"
/>
```

### Code Splitting
```typescript
// Lazy load admin components
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'))

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <AdminDashboard />
</Suspense>
```

## Cannabis Industry Compliance

### Age Verification
```typescript
// Age gate implementation
const [isAgeVerified, setIsAgeVerified] = useState(false)

useEffect(() => {
  const verified = localStorage.getItem('age-verified')
  setIsAgeVerified(verified === 'true')
}, [])
```

### State Restrictions
```typescript
// State blocking logic
const blockedStates = ['ID', 'SD', 'KS'] // Example
const isStateBlocked = (state: string) => blockedStates.includes(state)
```

### Product Warnings
```typescript
// Required compliance warnings
const ComplianceWarning = () => (
  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
    <p className="text-sm text-yellow-800">
      This product has not been evaluated by the FDA. 
      Keep out of reach of children and pets.
    </p>
  </div>
)
```

## Build and Deployment

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
})
```

### Environment Variables
```typescript
// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
```

## Code Quality

### ESLint Configuration
- TypeScript strict mode enabled
- React hooks rules enforced
- React refresh plugin for development
- No unused variables or imports

### Formatting Standards
- Prettier for consistent formatting
- 2-space indentation
- Single quotes for strings
- Trailing commas where valid
- Semicolons required
