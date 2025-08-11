# RiseViA Project Wiki

## 🟢 Current Project Status

- **Production URL**: https://rise-via.vercel.app
- **GitHub Repository**: yosiwizman/Rise-Via
- **Deployment Platform**: Vercel (auto-deploy on main branch)
- **CI/CD**: Manual deployment via Vercel integration
- **Project Stage**: Production-ready hemp e-commerce platform

## 🛠️ Technology Stack (Current)

- **Frontend**: React 18.3.1, TypeScript 5.6, Vite 6.0
- **Styling**: TailwindCSS 3.4, Framer Motion 12.23
- **State Management**: Zustand 5.0 with React Context
- **UI Components**: Radix UI, Lucide React icons, shadcn/ui
- **Database**: Neon PostgreSQL
- **Payment Processing**: Stripe (in development)
- **Email**: Resend API (configured)
- **CDN**: Cloudinary for images and videos
- **Testing**: Vitest 1.6, React Testing Library

## 💼 Business Context

- **Industry**: Hemp/Cannabis E-commerce (THCA products)
- **Compliance Requirements**:
  - Age verification (21+ mandatory)
  - State-by-state shipping restrictions
  - Cannabis-friendly payment processors only
  - FDA compliance disclaimers
- **Target Market**: Legal hemp/cannabis consumers in compliant states
- **Product Catalog**: 15 premium THCA strains

## 🧑‍💻 Development Standards

**Component Guidelines**
- Functional components with hooks only
- TypeScript interfaces required for all props
- Component files in PascalCase
- Maximum component complexity kept reasonable

**Code Quality**
- ESLint with TypeScript configuration
- Prettier formatting (automatic)
- React hooks and refresh plugins enabled

**Git Strategy**
- Branch naming: feature/*, fix/*, devin/*, infra/*
- PR reviews recommended before merge
- No direct commits to main branch preferred

**Naming Conventions**
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case for utils, PascalCase for components

## 🐞 Known Issues & Current State

1. **Product Data**: Currently using JSON files (products.json, strains.json)
2. **Payment Integration**: Stripe integration in development
3. **Database**: Neon configured but not fully integrated
4. **Testing**: Test suite configured but needs expansion
5. **CI/CD**: Manual deployment, no automated testing pipeline

## ⚙️ Current Development Workflow

- **Local Development**: `npm run dev` (Vite dev server)
- **Build Process**: `npm run build` (TypeScript + Vite)
- **Linting**: `npm run lint` (ESLint)
- **Testing**: `npm test` (Vitest)
- **Deployment**: Vercel automatic deployment on main branch push

## 🗄 Data Architecture

### Current Implementation
- **Product Catalog**: JSON files in `src/data/`
  - `products.json`: 15 THCA strains with full product data
  - `strains.json`: Legacy strain data (may be deprecated)
- **State Management**: Zustand stores for cart and wishlist
- **Local Storage**: Age verification, cart persistence

### Planned Database (Neon)
- Products catalog
- Shopping cart (persistent)
- User accounts
- Order management
- Wishlist functionality

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── cart/           # Cart functionality
│   ├── wishlist/       # Wishlist features
│   ├── admin/          # Admin dashboard
│   └── [other]/        # Feature components
├── hooks/              # Custom React hooks
├── pages/              # Route pages
├── data/               # JSON data files
├── utils/              # Helper functions
├── lib/                # Library configurations
├── types/              # TypeScript definitions
└── services/           # API services
```

## 🔑 Environment Variables Required

- `VITE_NEON_DATABASE_URL` - Neon database connection URL
- `VITE_RESEND_API_KEY` - Email service API key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe payment processing
- `VITE_CLOUDINARY_CLOUD_NAME` - Image/video CDN

## ✨ Key Features Implemented

- Age verification gate (21+ requirement)
- State restriction checking
- Product catalog with 15 THCA strains
- Shopping cart with Zustand state management
- Wishlist functionality
- Responsive design with mobile support
- Admin dashboard components
- Compliance warnings and disclaimers

## 📆 Development Priorities

1. Complete Stripe payment integration
2. Implement Neon database integration
3. Add user authentication system
4. Enhance admin panel functionality
5. Implement order management
6. Add automated testing pipeline
7. Set up CI/CD with GitHub Actions

## 📝 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run test         # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run validate     # Build validation script
```

## 🚦 Team Coordination

- Multiple development sessions can run in parallel
- Use feature branches for new development
- Coordinate database changes carefully
- Test thoroughly before merging to main

## 🔗 Important URLs

- **Production**: https://rise-via.vercel.app
- **Repository**: https://github.com/yosiwizman/Rise-Via
- **Vercel Dashboard**: Connected for automatic deployments

## 📊 Current Metrics

- **Product Count**: 15 THCA strains
- **Strain Types**: Sativa, Indica, Hybrid varieties
- **Price Range**: $41-$52 per product
- **Inventory Tracking**: Individual stock levels maintained
- **Featured Products**: 9 featured strains for homepage display
