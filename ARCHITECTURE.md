# System Architecture

## Overview
Rise Via is a React 19 e-commerce platform for cannabis products built with modern web technologies and a hybrid database strategy.

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **UI Components**: Radix UI, Lucide Icons
- **Notifications**: Sonner (toast notifications)

### Backend & Database
- **Database**: Neon (PostgreSQL)
  - Products catalog
  - Cart management
  - Order processing
  - User authentication
  - Wishlist functionality
  - Session-based persistence
- **Authentication**: Neon Auth
- **File Storage**: Cloudinary

### Infrastructure
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Email**: Resend API
- **Payments**: Stripe (configured)
- **Monitoring**: Vercel Analytics

## Database Strategy

### Database Architecture
The system uses Neon PostgreSQL for all data persistence:

#### Neon Database Schema
```
├── products (main catalog)
├── cart_items (shopping cart)
├── customers (user accounts)
├── orders (order management)
├── wishlist_sessions (session tracking)
├── wishlist_items (wishlist persistence)
└── auth_users (authentication)
```

### Benefits
- **Performance**: Single database with optimized queries and indexing
- **Scalability**: Neon's serverless PostgreSQL with automatic scaling
- **Reliability**: Built-in connection pooling and fault tolerance
- **Development**: Simplified architecture with single database connection

## Component Architecture

### Page Structure
```
src/pages/
├── HomePage.tsx (landing page with video background)
├── ShopPage.tsx (product catalog)
├── AdminPage.tsx (admin dashboard)
├── CheckoutPage.tsx (cart checkout)
└── WishlistPage.tsx (wishlist management)
```

### Component Hierarchy
```
App.tsx
├── Navigation.tsx (header with cart/wishlist)
├── HomePage.tsx
│   └── VideoBackground.tsx
├── ShopPage.tsx
│   ├── ProductCard.tsx
│   └── ProductDetailModal.tsx
├── CartSidebar.tsx (sliding cart panel)
└── AdminPage.tsx
    ├── DashboardMetrics.tsx
    ├── ProductManager.tsx
    ├── OrderManager.tsx
    └── EmailTester.tsx
```

### State Management
- **Cart State**: Neon-backed with session persistence
- **Wishlist State**: Neon-backed with custom hooks
- **UI State**: Local React state and Zustand stores
- **Authentication**: Neon Auth context

## API Integration

### Neon Client
```typescript
// src/lib/neon.ts
export const neonClient = neon(connectionString);
export const wishlistDb = { /* CRUD operations */ };
```

### Service Layer
```
src/services/
├── emailService.ts (Resend integration)
├── orderService.ts (order processing)
├── activityService.ts (admin logging)
└── wishlistService.ts (Neon integration)
```

## Security Architecture

### Authentication
- Neon Auth with email/password
- Row Level Security (RLS) policies
- JWT token-based sessions
- Admin role-based access control

### Data Protection
- Environment variable encryption
- HTTPS everywhere
- Input sanitization
- SQL injection prevention via parameterized queries

### Row Level Security Policies
```sql
-- Products: Public read access
CREATE POLICY "Anyone can view products" ON products FOR SELECT TO anon, authenticated USING (true);

-- Cart: User-specific access
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL TO authenticated USING (user_id = auth.uid());

-- Wishlist: Session-based access
CREATE POLICY "Session-based wishlist access" ON wishlist_items FOR ALL TO anon, authenticated USING (true);
```

## Performance Considerations

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization with Vercel
- Bundle size monitoring
- Lazy loading for product images

### Database Optimization
- Indexed queries on frequently accessed columns
- Connection pooling for Neon
- Neon serverless functions for complex operations
- Caching strategies for product catalog

### Monitoring
- Vercel Web Vitals tracking
- Database query performance monitoring
- Error boundary implementation
- Real-time metrics dashboard

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start development server: `npm run dev`
5. Access at `http://localhost:5173`

### Testing Strategy
- Unit tests with Vitest
- Component testing with React Testing Library
- E2E testing with Playwright
- Type checking with TypeScript

### Deployment Pipeline
1. Push to feature branch
2. Automated testing (CI)
3. Security scanning
4. Preview deployment
5. Code review
6. Merge to main
7. Production deployment

## Future Considerations

### Scalability
- Microservices architecture for high-traffic features
- CDN optimization for global distribution
- Database sharding strategies
- Caching layer implementation

### Feature Expansion
- Mobile app development (React Native)
- Advanced analytics integration
- Multi-tenant architecture
- Real-time features with WebSockets
