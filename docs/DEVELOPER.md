# Rise-Via Developer Guide

## Project Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation
```bash
git clone https://github.com/yosiwizman/Rise-Via.git
cd Rise-Via
npm install
cp .env.example .env.local
```

### Environment Configuration
Create `.env.local` with required variables:

```env
VITE_NEON_DATABASE_URL=your_neon_database_url
VITE_RESEND_API_KEY=your_resend_key
```

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run test`: Run unit tests
- `npm run test:ui`: Run tests with UI
- `npm run test:coverage`: Generate coverage report
- `npm run test:e2e`: Run E2E tests
- `npm run lint`: Run ESLint
- `npm run storybook`: Start Storybook

### Project Structure
```
src/
├── components/          # React components
│   ├── admin/          # Admin-specific components
│   ├── cart/           # Cart-related components
│   ├── ui/             # Reusable UI components
│   └── wishlist/       # Wishlist components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and business logic
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── data/               # Static data files
├── analytics/          # Analytics services
└── contexts/           # React contexts
```

## Architecture

### State Management
- **Zustand**: Global state (cart, user preferences)
- **React Context**: Authentication state
- **Local Storage**: Persistence layer

### Database
- **Neon**: PostgreSQL database
- **Serverless**: Auto-scaling database
- **Branching**: Database branching for development

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library

### Testing
- **Vitest**: Test runner
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **Storybook**: Component documentation

## Testing

### Unit Tests
- **Vitest**: Test runner
- **React Testing Library**: Component testing
- **Coverage Target**: 80%

### Test Structure
```
src/
├── __tests__/          # Test files
│   ├── admin/         # Admin component tests
│   ├── services/      # Service tests
│   └── *.test.tsx     # Component tests
├── test-utils.tsx     # Test utilities
└── test-setup.ts      # Test configuration
```

### Running Tests
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# Storybook
npm run storybook
```

### Writing Tests
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

## Code Standards

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Interface definitions for all data structures

### ESLint Configuration
- React hooks rules
- TypeScript recommended rules
- Custom cannabis industry rules

### Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## Component Development

### Creating Components
1. Use functional components with hooks
2. Define TypeScript interfaces for props
3. Include JSDoc comments
4. Create Storybook stories
5. Write unit tests

### Example Component
```typescript
interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onAddToWishlist: (product: Product) => void
}

/**
 * ProductCard displays product information with actions
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist
}) => {
  return (
    <Card className="product-card">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
        <div className="actions">
          <Button onClick={() => onAddToCart(product)}>
            Add to Cart
          </Button>
          <Button onClick={() => onAddToWishlist(product)}>
            Add to Wishlist
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Storybook Stories
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ProductCard } from './ProductCard'

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    product: {
      id: '1',
      name: 'Blue Dream',
      price: 29.99,
      description: 'A balanced hybrid strain',
    },
    onAddToCart: () => {},
    onAddToWishlist: () => {},
  },
}
```

## API Integration

### Neon Client
```typescript
import { neon } from '@/lib/neon'

// Query data
const data = await neon`SELECT * FROM table_name WHERE column = ${value}`

// Insert data
await neon`INSERT INTO table_name (column) VALUES (${data})`
```

### Error Handling
```typescript
try {
  const result = await apiCall()
  return { data: result, error: null }
} catch (error) {
  console.error('API Error:', error)
  return { data: null, error }
}
```

### Service Pattern
```typescript
export const productService = {
  async getAll() {
    try {
      const data = await neon`SELECT * FROM products`
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  async create(product: Product) {
    try {
      const data = await neon`
        INSERT INTO products (name, price, description) 
        VALUES (${product.name}, ${product.price}, ${product.description})
        RETURNING *
      `
      return { data: data[0], error: null }
    } catch (error) {
      return { data: null, error }
    }
  },
}
```

## Performance

### Optimization Strategies
- Code splitting with React.lazy()
- Image optimization with WebP format
- Memoization with React.memo and useMemo
- Virtual scrolling for large lists

### Bundle Analysis
```bash
npm run build
npm run analyze
```

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size monitoring
- Runtime performance profiling

## Security

### Input Validation
```typescript
import { SecurityUtils } from '@/utils/security'

const sanitizedInput = SecurityUtils.sanitizeInput(userInput)
const isRateLimited = SecurityUtils.checkRateLimit('action', 30, 60000)
```

### Environment Variables
- Never commit secrets to repository
- Use environment variables for configuration
- Validate environment variables at startup

### XSS Protection
```typescript
import DOMPurify from 'dompurify'

const cleanHTML = DOMPurify.sanitize(userHTML)
```

## Deployment

### Vercel Deployment
1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Deploy automatically on push

### Environment Variables
Set in Vercel dashboard:
- `VITE_NEON_DATABASE_URL`

### Build Optimization
```bash
# Analyze bundle
npm run build
npm run analyze

# Check bundle size
npm run build:analyze
```

## Monitoring

### Error Tracking
- Sentry integration for error monitoring
- Custom error boundaries
- Performance monitoring

### Analytics
- Google Analytics 4
- Custom event tracking
- Conversion funnel analysis

### Logging
```typescript
import { logger } from '@/utils/logger'

logger.info('User action', { userId, action })
logger.error('API Error', { error, context })
```

## Contributing

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Run linting and tests
4. Create pull request
5. Code review and approval
6. Merge to main

### Code Review Checklist
- [ ] TypeScript types defined
- [ ] Unit tests written
- [ ] E2E tests updated
- [ ] Documentation updated
- [ ] Performance considered
- [ ] Accessibility verified
- [ ] Security reviewed

### Branch Naming
- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation updates
- `refactor/description`: Code refactoring

## Debugging

### Development Tools
- React DevTools
- Redux DevTools (if using Redux)
- Network tab for API monitoring
- Console for runtime errors

### Common Issues
- **Build Failures**: Check Node.js version, dependencies
- **Test Failures**: Review test setup, mocks
- **Performance Issues**: Profile components, check bundle size
- **API Errors**: Verify environment variables, network connectivity

### Debug Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run"],
  "console": "integratedTerminal"
}
```

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Neon Documentation](https://neon.tech/docs)

### Tools
- [VS Code Extensions](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Community
- [React Community](https://reactjs.org/community/support.html)
- [TypeScript Community](https://www.typescriptlang.org/community)
- [Cannabis Tech Community](https://cannabistech.com)
