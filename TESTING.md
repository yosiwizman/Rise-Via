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

### Supabase Testing
- Use test database for integration tests
- Mock Supabase client for unit tests
- Test RLS policies with different user roles
- Verify data integrity and constraints

### Neon Testing
- Mock Neon client for unit tests
- Test wishlist persistence scenarios
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
