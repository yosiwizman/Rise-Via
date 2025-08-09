# Development Standards

## 📋 Table of Contents
- [Code Organization](#code-organization)
- [TypeScript Standards](#typescript-standards)
- [React Patterns](#react-patterns)
- [State Management](#state-management)
- [Database Patterns](#database-patterns)
- [Styling Guidelines](#styling-guidelines)
- [Testing Standards](#testing-standards)
- [Performance Guidelines](#performance-guidelines)
- [Security Best Practices](#security-best-practices)
- [Git Workflow](#git-workflow)

## Code Organization

### File Structure Rules
```
src/
├── components/
│   ├── common/         # Shared, reusable components
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       └── index.ts
│   ├── products/       # Product domain components
│   └── cart/           # Cart domain components
├── hooks/              # Custom React hooks (use* prefix)
├── pages/              # Route-based page components
├── services/           # API calls and external services
├── store/              # Zustand stores
├── utils/              # Pure utility functions
├── types/              # Shared TypeScript types
└── config/             # App configuration
```

### Import Order (enforced by ESLint)
```typescript
// 1. External dependencies
import React from 'react'
import { useRouter } from 'next/router'

// 2. Internal aliases
import { Button } from '@/components/common'
import { useCart } from '@/hooks'

// 3. Relative imports
import { localHelper } from './utils'

// 4. Types
import type { Product } from '@/types'

// 5. Styles (if any)
import styles from './Component.module.css'
```

## TypeScript Standards

### Strict Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Definitions
```typescript
// ✅ GOOD: Explicit, reusable types
interface ProductProps {
  id: string
  name: string
  price: number
  category: 'flower' | 'edible' | 'topical'
  thcContent?: number  // Optional with ?
  cbdContent?: number
}

// ❌ BAD: Inline types, any
const product: any = { ... }
const handleClick = (e: any) => { ... }

// ✅ GOOD: Type imports
import type { FC, ReactNode } from 'react'

// ✅ GOOD: Discriminated unions for state
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Product[] }
  | { status: 'error'; error: string }
```

## React Patterns

### Component Structure (Max 200 lines)
```typescript
// ✅ GOOD: Functional component with proper types
interface ProductCardProps {
  product: Product
  onAddToCart?: (id: string) => void
  className?: string
}

export function ProductCard({ 
  product, 
  onAddToCart,
  className = '' 
}: ProductCardProps) {
  // 1. Hooks first
  const [isLoading, setIsLoading] = useState(false)
  const { addItem } = useCart()
  
  // 2. Derived state
  const isInStock = product.quantity > 0
  
  // 3. Event handlers
  const handleAddToCart = async () => {
    if (!isInStock) return
    
    setIsLoading(true)
    try {
      await addItem(product)
      toast.success('Added to cart!')
    } catch (error) {
      console.error('Add to cart failed:', error)
      toast.error('Failed to add item')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 4. Early returns
  if (!product) return null
  
  // 5. Main render
  return (
    <div className={`card ${className}`}>
      {/* Component JSX */}
    </div>
  )
}
```

### Custom Hooks Pattern
```typescript
// ✅ GOOD: Descriptive name, clear return type
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}
```

## State Management

### Zustand Store Pattern
```typescript
// store/cartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface CartItem {
  id: string
  quantity: number
  price: number
}

interface CartStore {
  items: CartItem[]
  total: number
  
  // Actions
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  
  // Computed
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    immer((set, get) => ({
      items: [],
      total: 0,
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          state.items.push(item)
        }
        state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
      }),
      
      removeItem: (id) => set((state) => {
        state.items = state.items.filter(i => i.id !== id)
        state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
      }),
      
      updateQuantity: (id, quantity) => set((state) => {
        const item = state.items.find(i => i.id === id)
        if (item) {
          item.quantity = quantity
          state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
        }
      }),
      
      clearCart: () => set({ items: [], total: 0 }),
      
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0)
    })),
    {
      name: 'cart-storage'
    }
  )
)
```

## Database Patterns

### Supabase Queries with Error Handling
```typescript
// services/products.ts
import { supabase } from '@/config/supabase'

export async function getActiveProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        category,
        images,
        thc_content,
        cbd_content
      `)
      .eq('active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return { data: null, error }
  }
}

// With pagination
export async function getProductsPaginated(page = 1, limit = 12) {
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(from, to)
  
  return {
    data,
    error,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }
}
```

### Neon Queries (Wishlist)
```typescript
// services/wishlist.ts
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function getUserWishlist(userId: string) {
  try {
    const result = await sql`
      SELECT 
        w.id,
        w.product_id,
        w.added_at,
        p.name,
        p.price,
        p.image_url
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${userId}
      ORDER BY w.added_at DESC
    `
    return { data: result, error: null }
  } catch (error) {
    console.error('Wishlist fetch failed:', error)
    return { data: null, error }
  }
}
```

## Styling Guidelines

### Tailwind CSS Patterns
```typescript
// ✅ GOOD: Semantic class combinations
const styles = {
  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
  
  // Components
  card: 'rounded-lg shadow-md p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow',
  button: {
    primary: 'px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50',
    secondary: 'px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50',
    danger: 'px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700'
  },
  
  // States
  error: 'text-red-600 text-sm mt-1',
  success: 'text-green-600 text-sm mt-1',
  disabled: 'opacity-50 cursor-not-allowed',
  
  // Responsive
  hideOnMobile: 'hidden sm:block',
  mobileOnly: 'sm:hidden'
}

// Usage
<button className={styles.button.primary}>
  Add to Cart
</button>
```

### Dark Mode Support
```typescript
// Always include dark mode variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Products
  </h1>
</div>
```

## Testing Standards

### Component Testing
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('is disabled when loading', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCart } from './useCart'

describe('useCart', () => {
  it('adds items to cart', () => {
    const { result } = renderHook(() => useCart())
    
    act(() => {
      result.current.addItem({ id: '1', name: 'Product', price: 10 })
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.total).toBe(10)
  })
})
```

## Performance Guidelines

### Image Optimization
```typescript
// ✅ GOOD: Lazy loading with blur placeholder
import Image from 'next/image'

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  loading="lazy"
  placeholder="blur"
  blurDataURL={product.blurDataUrl}
/>
```

### Code Splitting
```typescript
// ✅ GOOD: Lazy load heavy components
const AdminPanel = lazy(() => import('./AdminPanel'))

// ✅ GOOD: Lazy load routes
const routes = [
  {
    path: '/admin',
    element: (
      <Suspense fallback={<Loading />}>
        <AdminPanel />
      </Suspense>
    )
  }
]
```

### Memoization
```typescript
// ✅ GOOD: Memoize expensive computations
const expensiveValue = useMemo(() => {
  return products.filter(p => p.category === category)
    .sort((a, b) => b.price - a.price)
}, [products, category])

// ✅ GOOD: Memoize callbacks
const handleSearch = useCallback((term: string) => {
  setSearchTerm(term)
}, [])
```

## Security Best Practices

### Input Validation
```typescript
// ✅ GOOD: Validate and sanitize user input
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  category: z.enum(['flower', 'edible', 'topical'])
})

export function validateProduct(data: unknown) {
  return ProductSchema.safeParse(data)
}
```

### Environment Variables
```typescript
// ✅ GOOD: Type-safe env vars
const env = {
  supabaseUrl: process.env.VITE_SUPABASE_URL!,
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY!,
  
  // Validate at startup
  validate() {
    if (!this.supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL')
    if (!this.supabaseKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY')
  }
}
```

### Authentication Checks
```typescript
// ✅ GOOD: Protected route wrapper
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" />
  
  return <>{children}</>
}
```

## Git Workflow

### Branch Naming
```bash
feature/add-payment-integration
fix/cart-calculation-error
chore/update-dependencies
docs/api-documentation
test/product-component
refactor/optimize-images
```

### Commit Messages
```bash
# ✅ GOOD: Conventional commits
feat: add Stripe payment integration
fix: resolve cart total calculation error
docs: update API documentation
test: add product component tests
refactor: optimize image loading
chore: update dependencies

# ❌ BAD: Vague messages
fixed stuff
updates
work in progress
```

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] No ESLint violations added
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

## Code Review Checklist

Before approving PRs, ensure:
- [ ] No console.log statements (except error handling)
- [ ] TypeScript types are explicit (no any)
- [ ] Components are under 200 lines
- [ ] Error handling for async operations
- [ ] Loading states for user feedback
- [ ] Accessibility attributes (aria-labels, roles)
- [ ] Responsive design tested
- [ ] Dark mode compatibility
- [ ] No hardcoded values (use constants/env)
- [ ] Tests included for new features

## Performance Metrics to Monitor

- **Bundle Size**: Keep under 200KB for initial load
- **Lighthouse Score**: Maintain >90 for all metrics
- **Core Web Vitals**:
  - LCP: <2.5s
  - FID: <100ms
  - CLS: <0.1
- **Code Coverage**: Aim for >80%

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Testing Library](https://testing-library.com)
