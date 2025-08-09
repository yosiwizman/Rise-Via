# Testing Strategy

## Overview
Rise Via uses a comprehensive testing strategy covering unit tests, integration tests, and end-to-end testing.

## Testing Stack
- **Unit Testing**: Vitest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Code Formatting**: Prettier

## Running Tests

### All Tests
```bash
npm test                 # Run all unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:e2e        # Run end-to-end tests
```

### Specific Test Types
```bash
npm run type-check      # TypeScript type checking
npm run lint           # ESLint linting
npm run lint:fix       # Auto-fix linting issues
npm run build          # Build verification
```

## Product Import & Inventory System Testing

### Prerequisites

1. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Fill in your actual values:
   # - VITE_DATABASE_URL (Neon database)
   # - VITE_CLOUDINARY_CLOUD_NAME
   # - VITE_CLOUDINARY_API_KEY
   # - VITE_CLOUDINARY_API_SECRET
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

### Product Import Testing Steps

#### 1. Build Verification
```bash
npm run build
npm run lint
```

#### 2. Import Cannabis Strains
```bash
npm run import-strains
```
Expected: 81 strains imported to database with complete data structure

#### 3. Generate Placeholder Images
```bash
npm run generate-images
```
Expected: 3 placeholder images generated per strain via Cloudinary

#### 4. Test Development Server
```bash
npm run dev
```

### Manual Testing Checklist

#### Shop Page (/shop)
- [ ] Products load from database (or fallback to JSON)
- [ ] Search functionality works
- [ ] Filter by strain type (Indica/Sativa/Hybrid)
- [ ] Sort by name, price, THCA%, popularity
- [ ] Product cards display correctly
- [ ] Add to cart functionality
- [ ] Wishlist functionality

#### Admin - Product Manager (/admin)
- [ ] Products list loads
- [ ] Search and filter products
- [ ] Bulk actions (delete, status change, price adjustment)
- [ ] Quick edit functionality
- [ ] Export to CSV
- [ ] Add/Edit product modal

#### Admin - Inventory Manager (/admin)
- [ ] Inventory overview cards
- [ ] Low stock alerts (< 10 units)
- [ ] Inventory adjustment modal
- [ ] Stock level updates
- [ ] Inventory history view
- [ ] Real-time data refresh

#### Database Verification
Check that these tables exist and have data:
- `products` (81 records)
- `inventory_logs` (adjustment history)
- `inventory_alerts` (low stock notifications)

#### Error Scenarios
Test these edge cases:
- [ ] Database connection failure (should fallback to JSON)
- [ ] Cloudinary upload failure (should use placeholder URLs)
- [ ] Invalid inventory adjustments
- [ ] Search with no results
- [ ] Filter combinations

## Test Structure

### Unit Tests
Location: `src/**/*.test.{ts,tsx}`

```typescript
// Example: src/hooks/useCart.test.ts
import { renderHook } from '@testing-library/react';
import { useCart } from './useCart';

describe('useCart', () => {
  it('should add items to cart', () => {
    const { result } = renderHook(() => useCart());
    // Test implementation
  });
});
```

### Component Tests
Location: `src/components/**/*.test.tsx`

```typescript
// Example: src/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('should display product information', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Product Name')).toBeInTheDocument();
  });
});
```

### E2E Tests
Location: `tests/e2e/**/*.spec.ts`

```typescript
// Example: tests/e2e/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete shopping flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="shop-link"]');
  // Test implementation
});
```

## Testing Guidelines

### Unit Test Best Practices
- Test one thing at a time
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error conditions
- Maintain high test coverage (>80%)

### Component Test Best Practices
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility features
- Mock API calls and external services
- Test responsive behavior

### E2E Test Best Practices
- Test critical user journeys
- Use page object model for complex flows
- Test across different browsers
- Include mobile viewport testing
- Test with real data when possible

## Test Data Management

### Mock Data
```typescript
// src/test-utils/mockData.ts
export const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  // ... other properties
};
```

### Test Utilities
```typescript
// src/test-utils/renderWithProviders.tsx
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <QueryClient>
          {children}
        </QueryClient>
      </BrowserRouter>
    ),
  });
}
```

## Database Testing

### Neon Testing
- Mock Neon client for unit tests
- Test product import scenarios
- Test inventory management operations
- Verify session-based access patterns
- Test error handling and fallbacks

## CI/CD Testing

### GitHub Actions Pipeline
```yaml
# .github/workflows/main.yml
jobs:
  test:
    steps:
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Pre-commit Hooks
```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm test
```

## Coverage Requirements

### Minimum Coverage Targets
- **Overall**: 80%
- **Critical Paths**: 95%
- **Components**: 85%
- **Utilities**: 90%
- **Services**: 85%

### Coverage Reports
```bash
npm run test:coverage
open coverage/index.html
```

## Testing Checklist

### Before Committing
- [ ] All tests pass locally
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Coverage meets requirements

### Before Merging PR
- [ ] All CI checks pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Code review approved
- [ ] Documentation updated

## Product Import Success Criteria

✅ All 81 strains imported with complete data structure
✅ Placeholder images generated for all strains
✅ Inventory tracking with real-time updates
✅ Low stock alerts trigger at < 10 units
✅ Search and filters work correctly
✅ Admin can manage inventory through interface
✅ No build or lint errors
✅ Responsive design on mobile/tablet

## Troubleshooting

### Common Issues

1. **Import Script Fails**
   - Check Neon database URL is correct
   - Verify database connection
   - Check strains.json file exists

2. **Images Don't Generate**
   - Verify Cloudinary credentials
   - Check API rate limits
   - Ensure upload preset exists

3. **Components Don't Load**
   - Check for TypeScript errors
   - Verify all imports are correct
   - Check console for runtime errors

4. **Database Connection Issues**
   - Verify Neon database URL and credentials
   - Check network connectivity
   - Review Neon dashboard for errors

## Debugging Tests

### Common Issues
1. **Async Testing**: Use proper async/await patterns
2. **DOM Cleanup**: Ensure proper test isolation
3. **Mock Issues**: Verify mock implementations
4. **Timing Issues**: Use proper waiting strategies

### Debug Commands
```bash
npm run test -- --reporter=verbose
npm run test:e2e -- --debug
npm run test:e2e -- --headed
```

## Performance Testing

### Metrics to Monitor
- Bundle size impact
- Component render performance
- Database query performance
- Page load times
- Core Web Vitals

### Tools
- Lighthouse CI
- Bundle analyzer
- React DevTools Profiler
- Vercel Analytics

## Accessibility Testing

### Automated Testing
- Jest-axe for accessibility violations
- Screen reader testing
- Keyboard navigation testing
- Color contrast validation

### Manual Testing
- Test with screen readers
- Verify keyboard-only navigation
- Check focus management
- Validate ARIA attributes
