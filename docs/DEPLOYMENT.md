# Rise-Via Deployment Guide

## Overview
Rise-Via is deployed on Vercel with Supabase as the backend database.

## Prerequisites
- Vercel account
- Supabase project
- GitHub repository access
- Domain name (optional)

## Environment Setup

### Supabase Configuration
1. Create new Supabase project
2. Set up database tables:
   ```sql
   -- Wishlist sessions
   CREATE TABLE wishlist_sessions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     session_token TEXT UNIQUE NOT NULL,
     user_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Wishlist items
   CREATE TABLE wishlist_items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     session_id UUID REFERENCES wishlist_sessions(id) ON DELETE CASCADE,
     product_id TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Customers
   CREATE TABLE customers (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     phone TEXT,
     address JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Orders
   CREATE TABLE orders (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     order_number TEXT UNIQUE NOT NULL,
     customer_id UUID REFERENCES customers(id),
     status TEXT DEFAULT 'pending',
     payment_status TEXT DEFAULT 'pending',
     total_amount DECIMAL(10,2) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Order items
   CREATE TABLE order_items (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
     product_id TEXT NOT NULL,
     quantity INTEGER NOT NULL,
     price DECIMAL(10,2) NOT NULL,
     total DECIMAL(10,2) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. Configure Row Level Security (RLS):
   ```sql
   -- Enable RLS
   ALTER TABLE wishlist_sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
   ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

   -- Wishlist sessions policies
   CREATE POLICY "Users can access their own sessions" ON wishlist_sessions
     FOR ALL USING (
       session_token = current_setting('request.headers')::json->>'session-token'
       OR user_id = auth.uid()
     );

   -- Wishlist items policies
   CREATE POLICY "Users can access their wishlist items" ON wishlist_items
     FOR ALL USING (
       session_id IN (
         SELECT id FROM wishlist_sessions 
         WHERE session_token = current_setting('request.headers')::json->>'session-token'
         OR user_id = auth.uid()
       )
     );

   -- Customer policies
   CREATE POLICY "Users can access their own data" ON customers
     FOR ALL USING (auth.uid() = id);

   -- Order policies
   CREATE POLICY "Users can access their orders" ON orders
     FOR ALL USING (
       customer_id IN (
         SELECT id FROM customers WHERE id = auth.uid()
       )
     );

   -- Order items policies
   CREATE POLICY "Users can access their order items" ON order_items
     FOR ALL USING (
       order_id IN (
         SELECT id FROM orders WHERE customer_id = auth.uid()
       )
     );
   ```

4. Generate API keys

### Environment Variables
Set the following in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SUPABASE_SERVICE_KEY` | Service role key (admin) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_RESEND_API_KEY` | Email service key | `re_xxx` |

## Vercel Deployment

### Initial Setup
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node.js Version**: 18.x

### Deployment Process
1. Push changes to main branch
2. Vercel automatically builds and deploys
3. Preview deployments for pull requests
4. Production deployment on merge

### Custom Domain
1. Add domain in Vercel dashboard
2. Configure DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```
3. SSL certificate automatically provisioned

## Database Migrations

### Schema Updates
1. Update Supabase schema via dashboard or SQL editor
2. Test changes in staging environment
3. Apply to production database
4. Update application code accordingly

### Data Migrations
```sql
-- Example: Add new column
ALTER TABLE wishlist_items 
ADD COLUMN priority TEXT DEFAULT 'medium';

-- Example: Update existing data
UPDATE wishlist_items 
SET priority = 'high' 
WHERE created_at > NOW() - INTERVAL '7 days';

-- Example: Create index
CREATE INDEX idx_wishlist_items_session_id 
ON wishlist_items(session_id);
```

### Migration Best Practices
- Always backup before migrations
- Test migrations in staging first
- Use transactions for complex migrations
- Monitor performance impact

## Monitoring & Maintenance

### Health Checks
- Vercel function monitoring
- Supabase database health
- Third-party service status
- SSL certificate expiration

### Performance Monitoring
- Core Web Vitals tracking
- Error rate monitoring
- Database query performance
- API response times

### Backup Strategy
- Supabase automatic backups (daily)
- Code repository backups
- Environment variable backups
- Database schema versioning

### Monitoring Tools
```javascript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}

// Error tracking
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## Security

### SSL/TLS
- Automatic HTTPS via Vercel
- HSTS headers enabled
- Secure cookie settings

### API Security
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- SQL injection prevention
- CORS configuration

### Compliance
- GDPR compliance features
- Cannabis industry regulations
- Age verification requirements
- Data retention policies

## Rollback Procedures

### Application Rollback
1. Identify problematic deployment
2. Revert to previous Vercel deployment:
   ```bash
   vercel --prod --force
   ```
3. Monitor for stability
4. Investigate and fix issues

### Database Rollback
1. Stop application traffic
2. Restore from Supabase backup:
   ```sql
   -- Via Supabase dashboard or CLI
   supabase db reset --db-url "your-db-url"
   ```
3. Verify data integrity
4. Resume application traffic

### Emergency Procedures
- Incident response team contacts
- Communication plan for outages
- Escalation procedures
- Post-incident review process

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify environment variables
- Review build logs for errors
- Check dependency conflicts

#### Database Connection Issues
- Verify Supabase credentials
- Check network connectivity
- Review RLS policies
- Monitor connection limits

#### Performance Issues
- Analyze bundle size
- Check database query performance
- Monitor server resources
- Review CDN configuration

#### SSL Certificate Issues
- Verify domain configuration
- Check DNS propagation
- Review certificate status
- Contact Vercel support

### Debugging Tools
```bash
# Vercel CLI debugging
vercel logs --follow

# Database debugging
supabase logs --db

# Performance analysis
npm run build:analyze
```

### Support Contacts
- **Vercel Support**: vercel.com/support
- **Supabase Support**: supabase.com/support
- **Emergency Contact**: admin@risevia.com

## Scaling Considerations

### Traffic Growth
- Vercel automatic scaling
- Database connection pooling
- CDN optimization
- Edge function deployment

### Feature Expansion
- Microservices architecture
- API versioning strategy
- Database sharding
- Multi-region deployment

### Cost Optimization
- Monitor usage metrics
- Optimize bundle sizes
- Review service plans
- Implement caching strategies

## Compliance & Legal

### Cannabis Regulations
- State-specific shipping restrictions
- Age verification compliance
- Product labeling requirements
- Lab testing documentation

### Data Protection
- GDPR compliance
- CCPA compliance
- Data encryption standards
- Privacy policy enforcement

### Audit Requirements
- Access logging
- Data modification tracking
- Compliance reporting
- Regular security audits

## Disaster Recovery

### Backup Verification
- Regular backup testing
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)
- Business continuity planning

### Incident Response
1. **Detection**: Monitoring alerts
2. **Assessment**: Impact evaluation
3. **Response**: Immediate actions
4. **Recovery**: Service restoration
5. **Review**: Post-incident analysis

### Communication Plan
- Internal notification procedures
- Customer communication templates
- Status page updates
- Media response guidelines
