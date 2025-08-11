# RiseVia Hemp E-commerce Website

Premium THCA hemp products e-commerce platform with full compliance features.

## 🚀 Project Status

### ✅ Completed Infrastructure (August 2025)
- [x] **CI/CD Pipeline** - Comprehensive GitHub Actions workflow with progressive linting
- [x] **Code Quality Tools** - ESLint, Prettier, TypeScript, Husky pre-commit hooks
- [x] **Security Scanning** - Automated dependency and security vulnerability checks
- [x] **Documentation Suite** - Contributing guidelines, deployment docs, architecture overview
- [x] **Tech Debt Tracking** - Automated violation tracking with 69 baseline violations
- [x] **Branch Protection** - Main branch protected with required CI checks
- [x] **Vercel Deployment** - Automated production deployments

### 🚧 In Progress
- [ ] **Tech Debt Reduction** - Target: 69 → 50 violations ([Issue #43](https://github.com/yosiwizman/Rise-Via/issues/43))
- [ ] **Wishlist Integration** - Complete database persistence testing ([Issue #44](https://github.com/yosiwizman/Rise-Via/issues/44))
- [ ] **Asset Audit** - Comprehensive image and video verification ([Issue #45](https://github.com/yosiwizman/Rise-Via/issues/45))

### 📅 Upcoming Features
- [ ] User authentication system (Neon Auth)
- [ ] Payment processing integration
- [ ] Admin panel enhancements
- [ ] Advanced analytics and monitoring

## Features
- Age verification (21+)
- State shipping restrictions
- Product catalog with 80+ strains
- Lab results/COA integration
- Responsive design
- ADA compliant
- Session-based wishlist functionality
- Real-time cart management

## Tech Stack
- **Frontend:** React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- **Database:** Neon PostgreSQL (serverless database)
- **Deployment:** Vercel with automated CI/CD
- **Testing:** Vitest, React Testing Library
- **Code Quality:** ESLint, Prettier, Husky

## Version
Current: v2.0 (Production Ready with Full Infrastructure)

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Environment variables (see `.env.example`)

### Quick Start
```bash
# Clone and install
git clone https://github.com/yosiwizman/Rise-Via.git
cd Rise-Via
npm install

# Set up environment
cp .env.example .env.local
# Update .env.local with your actual values

# Start development server
npm run dev
```

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint (strict)
npm run lint:ci         # Run ESLint (allows 69 violations)
npm run lint:fix        # Auto-fix ESLint issues
npm run type-check      # TypeScript type checking
npm run format          # Format code with Prettier

# Testing
npm test                # Run tests
npm run test:coverage   # Run tests with coverage

# Maintenance
npm run security:check  # Security vulnerability scan
npm run debt:report     # Generate tech debt report
```

### CI/CD Pipeline
- **Triggers:** Push to `main`/`develop`, PRs to `main`
- **Checks:** Type checking, linting (progressive), security scan, build verification
- **Deployment:** Automatic to Vercel on successful main branch builds
- **Tech Debt:** Automated tracking prevents violation increases

### Branch Protection
Main branch requires:
- Pull request reviews
- Status checks: `tech-debt-analysis`, `code-quality`, `build-test`
- Up-to-date branches before merge

## Compliance Features

### Age Verification
- Fullscreen modal on first visit
- 21+ age confirmation required
- Cookie-based session storage

### State Restrictions
- Automatic blocking for prohibited states
- Manual state selection fallback
- Shipping restriction enforcement

### Product Compliance
- Third-party lab testing (COA) for each batch
- QR codes for easy COA access
- Required product warnings and disclaimers
- FDA compliance statements

## Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main page components
├── data/               # Product data and constants
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── lib/                # Library configurations
```

## License
Private - All rights reserved by RiseVia Cannabis
