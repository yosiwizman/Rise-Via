# RiseVia Hemp E-commerce Website

Premium THCA hemp products e-commerce platform with full compliance features.

<!-- Redeployment trigger for environment variable configuration -->

## Features
- Age verification (21+)
- State shipping restrictions
- Product catalog with 80+ strains
- Lab results/COA integration
- Responsive design
- ADA compliant

## Tech Stack
- React 19
- TailwindCSS
- shadcn/ui
- Framer Motion
- Vercel deployment ready

## Version
Current: v1.0 (Light Theme)

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deployment
The application is configured for Vercel deployment. Simply connect your repository to Vercel for automatic deployments.

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
