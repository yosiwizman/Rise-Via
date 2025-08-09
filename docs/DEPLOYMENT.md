# Rise-Via Deployment Guide

## Overview

This guide covers deploying the Rise-Via cannabis e-commerce platform to production environments, including Vercel for the frontend and Supabase for the backend infrastructure.

## Prerequisites

### Required Accounts
- **Vercel Account** - For frontend deployment
- **Supabase Account** - For backend and database
- **GitHub Account** - For repository access
- **Domain Provider** - For custom domain (optional)

### Required Tools
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Vercel CLI (optional)
- Supabase CLI (optional)

## Environment Setup

### Development Environment

1. **Clone Repository:**
```bash
git clone https://github.com/yosiwizman/Rise-Via.git
cd Rise-Via
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Environment Variables:**
```bash
cp .env.example .env.local
```

4. **Configure Environment Variables:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key

# Email Service
VITE_RESEND_API_KEY=your_resend_api_key

# Application Environment
VITE_APP_ENV=development

# Analytics (Optional)
VITE_GA_TRACKING_ID=your_google_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

### Production Environment

**Required Environment Variables:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_SUPABASE_SERVICE_KEY=your_production_service_key

# Email Service
VITE_RESEND_API_KEY=your_production_resend_key

# Application Environment
VITE_APP_ENV=production

# Security
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# Performance
VITE_ENABLE_PWA=true
VITE_ENABLE_COMPRESSION=true
```

## Database Setup

### Supabase Configuration

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note the project URL and API keys

2. **Database Schema:**
```sql
-- Customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer profiles table
CREATE TABLE customer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  addresses JSONB DEFAULT '[]',
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist sessions table
CREATE TABLE wishlist_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist items table
CREATE TABLE wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES wishlist_sessions(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_alert JSONB DEFAULT NULL
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **Row Level Security (RLS):**
```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Customer policies
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Wishlist policies
CREATE POLICY "Users can manage own wishlist sessions" ON wishlist_sessions
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage wishlist items" ON wishlist_items
  FOR ALL USING (
    session_id IN (
      SELECT id FROM wishlist_sessions 
      WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

-- Order policies
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (customer_id::text = auth.uid()::text);

-- Admin policies (service key required)
CREATE POLICY "Service role can manage all data" ON customers
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage profiles" ON customer_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage activity logs" ON activity_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
```

4. **Indexes for Performance:**
```sql
-- Customer indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Wishlist indexes
CREATE INDEX idx_wishlist_sessions_token ON wishlist_sessions(session_token);
CREATE INDEX idx_wishlist_sessions_user ON wishlist_sessions(user_id);
CREATE INDEX idx_wishlist_items_session ON wishlist_items(session_id);
CREATE INDEX idx_wishlist_items_product ON wishlist_items(product_id);

-- Order indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Activity log indexes
CREATE INDEX idx_activity_logs_admin ON activity_logs(admin_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

## Frontend Deployment

### Vercel Deployment

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings

2. **Build Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

3. **Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all production environment variables
   - Ensure sensitive keys are properly secured

4. **Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records with your domain provider

### Manual Deployment

1. **Build Application:**
```bash
npm run build
```

2. **Test Build Locally:**
```bash
npm run preview
```

3. **Deploy to Static Hosting:**
   - Upload `dist` folder to your hosting provider
   - Configure redirects for SPA routing
   - Set up SSL certificate

## Performance Optimization

### Build Optimization

1. **Bundle Analysis:**
```bash
npm run analyze
```

2. **Code Splitting:**
```typescript
// Lazy load pages
const ShopPage = lazy(() => import('./pages/ShopPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

// Lazy load heavy components
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal'))
```

3. **Image Optimization:**
```typescript
// Use optimized images
<OptimizedImage
  src="/images/product.jpg"
  alt="Product"
  width={400}
  height={300}
  loading="lazy"
/>
```

### Caching Strategy

1. **Static Assets:**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

2. **Service Worker:**
```javascript
// Register service worker for caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

## Security Configuration

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.userway.org;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co;
">
```

### HTTPS Configuration

1. **Force HTTPS:**
```javascript
// Redirect HTTP to HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length))
}
```

2. **Security Headers:**
```javascript
// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})
```

## Monitoring and Analytics

### Error Tracking

1. **Sentry Configuration:**
```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
})
```

2. **Error Boundaries:**
```typescript
<Sentry.ErrorBoundary fallback={ErrorFallback}>
  <App />
</Sentry.ErrorBoundary>
```

### Performance Monitoring

1. **Core Web Vitals:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

2. **Google Analytics:**
```typescript
// Google Analytics 4
gtag('config', 'GA_TRACKING_ID', {
  page_title: document.title,
  page_location: window.location.href
})
```

## Backup and Recovery

### Database Backups

1. **Automated Backups:**
   - Supabase provides automatic daily backups
   - Configure backup retention policy
   - Set up backup notifications

2. **Manual Backups:**
```bash
# Export database
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# Import database
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

### Application Backups

1. **Code Repository:**
   - Ensure all code is committed to Git
   - Use GitHub for redundancy
   - Tag releases for easy rollback

2. **Static Assets:**
   - Backup uploaded images and files
   - Use CDN for asset distribution
   - Implement asset versioning

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Build completes without errors (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers configured
- [ ] SSL certificates valid
- [ ] Performance optimizations applied
- [ ] Error tracking configured
- [ ] Analytics configured

### Post-Deployment

- [ ] Application loads correctly
- [ ] All features functional
- [ ] Database connections working
- [ ] Email notifications working
- [ ] Payment processing working
- [ ] Age verification working
- [ ] State blocking working
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable

### Rollback Plan

1. **Immediate Rollback:**
```bash
# Revert to previous Vercel deployment
vercel --prod --force

# Or rollback via Vercel dashboard
```

2. **Database Rollback:**
```bash
# Restore from backup
psql -h db.your-project.supabase.co -U postgres -d postgres < previous_backup.sql
```

3. **DNS Rollback:**
   - Update DNS records to previous deployment
   - Clear CDN cache if applicable

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Monitor error rates
   - Check performance metrics
   - Review security logs
   - Update dependencies

2. **Monthly:**
   - Database maintenance
   - Backup verification
   - Security audit
   - Performance optimization

3. **Quarterly:**
   - Dependency updates
   - Security patches
   - Feature deployments
   - Disaster recovery testing

### Monitoring Alerts

1. **Application Alerts:**
   - High error rates
   - Slow response times
   - Database connection issues
   - Payment processing failures

2. **Infrastructure Alerts:**
   - Server downtime
   - Database performance
   - SSL certificate expiration
   - Domain expiration

## Troubleshooting

### Common Issues

1. **Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

2. **Environment Variable Issues:**
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

3. **Database Connection Issues:**
```bash
# Test database connection
psql -h db.your-project.supabase.co -U postgres -d postgres -c "SELECT 1"
```

4. **Performance Issues:**
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
npm run lighthouse
```

### Support Contacts

- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Supabase Support:** [supabase.com/support](https://supabase.com/support)
- **Development Team:** dev@risevia.com
- **Emergency Contact:** emergency@risevia.com

---

*This deployment guide is maintained by the development team. For questions or updates, please contact the DevOps team or create an issue in the repository.*
