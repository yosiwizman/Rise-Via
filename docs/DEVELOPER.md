# Rise-Via Developer Guide

## Project Overview

Rise-Via is a React-based e-commerce platform for THCA cannabis products built with modern web technologies and strict compliance requirements.

## Technology Stack

### Frontend
- **React 18** - UI framework with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Row Level Security** - Database-level security policies

### Testing
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing
- **@testing-library/jest-dom** - Custom Jest matchers

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── cart/            # Cart-related components
│   ├── wishlist/        # Wishlist components
│   └── admin/           # Admin dashboard components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── lib/                 # Third-party library configurations
├── data/                # Static data files
├── analytics/           # Analytics and tracking
├── contexts/            # React context providers
└── __tests__/           # Test files
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yosiwizman/Rise-Via.git
cd Rise-Via
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment setup:**
```bash
cp .env.example .env.local
```

4. **Configure environment variables:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

5. **Start development server:**
```bash
npm run dev
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Commit Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

### Code Quality

**Pre-commit hooks:**
- ESLint checks
- Prettier formatting
- TypeScript compilation
- Test execution

**Code standards:**
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow single responsibility principle
- Write self-documenting code
- Add JSDoc comments for complex functions

## Architecture

### State Management

**Zustand Stores:**
- `useCart` - Shopping cart state and operations
- `useWishlist` - Wishlist management
- `useTheme` - Theme and UI preferences

**Local State:**
- Component-specific state with `useState`
- Form state management
- UI interaction state

### Data Flow

1. **User Interaction** → Component
2. **Component** → Hook/Service
3. **Hook/Service** → Supabase API
4. **API Response** → State Update
5. **State Update** → UI Re-render

### Component Architecture

**Component Types:**
- **Pages** - Route-level components
- **Layouts** - Structural components
- **Features** - Business logic components
- **UI** - Reusable interface components
- **Forms** - Input and validation components

**Component Guidelines:**
- Keep components under 200 lines
- Extract complex logic to custom hooks
- Use composition over inheritance
- Implement proper prop typing
- Handle loading and error states

## API Integration

### Supabase Configuration

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Database Schema

**Core Tables:**
- `customers` - Customer information
- `customer_profiles` - Extended customer data
- `orders` - Order records
- `order_items` - Order line items
- `wishlist_sessions` - Wishlist sessions
- `wishlist_items` - Wishlist entries
- `activity_logs` - Admin activity tracking

### Service Layer

**Service Pattern:**
```typescript
export const customerService = {
  async createCustomer(data: CustomerData) {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return customer
  }
}
```

### Error Handling

**Centralized Error Handling:**
```typescript
export class ErrorHandler {
  static handleAPIError(error: Error, context?: string) {
    console.error(`API Error ${context}:`, error)
    // Log to monitoring service
    // Show user-friendly message
  }
}
```

## Testing Strategy

### Unit Testing

**Test Structure:**
```typescript
describe('useCart', () => {
  beforeEach(() => {
    // Setup
  })

  it('should add item to cart', () => {
    // Test implementation
  })
})
```

**Testing Guidelines:**
- Test business logic thoroughly
- Mock external dependencies
- Test error conditions
- Maintain 80%+ coverage
- Use descriptive test names

### Integration Testing

**Component Testing:**
```typescript
test('should display product information', async () => {
  render(<ProductCard product={mockProduct} />)
  
  expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
  expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument()
})
```

### E2E Testing

**Playwright Tests:**
```typescript
test('complete purchase flow', async ({ page }) => {
  await page.goto('/')
  // Age verification
  // Product selection
  // Cart operations
  // Checkout process
})
```

### Test Commands

```bash
npm test                 # Run unit tests
npm run test:coverage    # Run with coverage
npm run test:e2e        # Run E2E tests
npm run test:ui         # Run with UI
```

## Compliance Implementation

### Age Verification

**ComplianceManager:**
```typescript
export class ComplianceManager {
  static verifyAge(data: AgeVerificationData): ComplianceResult {
    // Age calculation
    // Risk scoring
    // Fraud detection
    return { isValid, riskScore, reasons }
  }
}
```

### State Restrictions

**State Blocking:**
```typescript
const BLOCKED_STATES = [
  "ID", "SD", "MS", "OR", "AK", "AR", "CO", "DE", "HI", "IN", 
  "IA", "KS", "KY", "LA", "MD", "MT", "NH", "NY", "NC", "RI", 
  "UT", "VT", "VA"
]

export const isStateBlocked = (stateCode: string): boolean => {
  return BLOCKED_STATES.includes(stateCode.toUpperCase())
}
```

### Audit Logging

**Activity Tracking:**
```typescript
export const activityService = {
  async logActivity(activity: ActivityLog) {
    // Log admin actions
    // Track user behavior
    // Compliance monitoring
  }
}
```

## Performance Optimization

### Code Splitting

**Route-based splitting:**
```typescript
const ShopPage = lazy(() => import('./pages/ShopPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
```

### Image Optimization

**OptimizedImage component:**
```typescript
export const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      {...props}
    />
  )
}
```

### Caching Strategy

**Local Storage:**
- Cart persistence
- Wishlist data
- User preferences
- Compliance verification

**Memory Caching:**
- Product data
- User session
- API responses

## Security Considerations

### Data Protection

**Sensitive Data Handling:**
- Never log sensitive information
- Encrypt data at rest
- Use HTTPS for all communications
- Implement proper authentication

**Input Validation:**
```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

### Authentication

**Supabase Auth Integration:**
```typescript
export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }
}
```

## Deployment

### Build Process

```bash
npm run build           # Production build
npm run preview         # Preview build locally
npm run lint           # Code linting
```

### Environment Configuration

**Production Environment:**
```env
VITE_SUPABASE_URL=production_url
VITE_SUPABASE_ANON_KEY=production_key
VITE_APP_ENV=production
```

### Deployment Checklist

- [ ] All tests passing
- [ ] Build completes without warnings
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates valid
- [ ] CDN cache cleared
- [ ] Monitoring alerts active

## Monitoring and Analytics

### Error Tracking

**Sentry Integration:**
```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.VITE_APP_ENV
})
```

### Performance Monitoring

**Core Web Vitals:**
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Analytics

**Google Analytics 4:**
```typescript
gtag('event', 'purchase', {
  transaction_id: orderId,
  value: orderTotal,
  currency: 'USD'
})
```

## Troubleshooting

### Common Issues

**Build Errors:**
- Clear `node_modules` and reinstall
- Check TypeScript errors
- Verify environment variables
- Update dependencies if needed

**Runtime Errors:**
- Check browser console
- Review Sentry error reports
- Test in different browsers
- Verify API responses

**Performance Issues:**
- Analyze bundle size
- Check for memory leaks
- Optimize images and assets
- Review network requests

### Debug Tools

**React DevTools:**
- Component inspection
- State debugging
- Performance profiling

**Browser DevTools:**
- Network monitoring
- Performance analysis
- Console debugging

## Contributing

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval
6. Merge to `develop`

### Code Review Guidelines

**Review Checklist:**
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

### Issue Reporting

**Bug Reports:**
- Clear description of issue
- Steps to reproduce
- Expected vs actual behavior
- Environment information
- Screenshots if applicable

**Feature Requests:**
- Business justification
- User stories
- Acceptance criteria
- Technical considerations
- Priority level

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Supabase CLI](https://supabase.com/docs/reference/cli)

### Community
- [React Community](https://react.dev/community)
- [TypeScript Community](https://www.typescriptlang.org/community)
- [Supabase Community](https://supabase.com/docs/guides/getting-started)

---

*This guide is maintained by the development team. For questions or updates, please contact the lead developer or create an issue in the repository.*
