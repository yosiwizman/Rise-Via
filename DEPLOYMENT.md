# Deployment Guide

## Overview
Rise Via uses Vercel for hosting with automatic deployments triggered by GitHub Actions.

## Deployment Process

### Automatic Deployment
- **Production**: Automatic deployment on push to `main` branch
- **Preview**: Automatic preview deployment for all PRs
- **CI/CD**: GitHub Actions pipeline handles build, test, and deployment

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Environment Variables

#### Required Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key

# Neon Database Configuration
VITE_NEON_DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Resend Email Configuration
VITE_RESEND_API_KEY=your_resend_api_key
```

#### Vercel Secrets (for CI/CD)
```bash
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id
```

### Build Configuration
- **Framework**: Vite (React)
- **Node Version**: 18.x
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

### Database Setup

#### Supabase Setup
1. Create Supabase project
2. Run migrations in `supabase/migrations/`
3. Configure Row Level Security policies
4. Set up authentication providers

#### Neon Setup
1. Create Neon project
2. Run wishlist schema setup
3. Configure connection pooling
4. Set up database credentials

### Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Browser console errors logged
- **Uptime Monitoring**: Vercel deployment status
- **Database Monitoring**: Supabase and Neon dashboards

### Troubleshooting

#### Common Issues
1. **Build Failures**: Check TypeScript errors and lint issues
2. **Environment Variables**: Verify all required vars are set
3. **Database Connections**: Check connection strings and credentials
4. **Deployment Timeouts**: Optimize build process and dependencies

#### Debug Commands
```bash
# Local build test
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Test suite
npm test
```

### Rollback Process
1. Identify last working deployment in Vercel dashboard
2. Promote previous deployment to production
3. Or revert commits and redeploy

### Performance Optimization
- Code splitting with Vite
- Image optimization with Vercel
- CDN caching for static assets
- Database query optimization
