# Contributing to Rise Via

## Development Workflow

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Rise-Via.git`
3. Install dependencies: `npm install`
4. Copy environment variables: `cp .env.example .env.local`
5. Start development server: `npm run dev`

### Branch Strategy
- `main` - Production branch (protected)
- `develop` - Staging branch
- `feature/*` - New features
- `hotfix/*` - Urgent fixes
- `infra/*` - Infrastructure changes

### Pull Request Process
1. Create feature branch from `main`
2. Make your changes following coding standards
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Run type checking: `npm run type-check`
6. Build project: `npm run build`
7. Create PR with descriptive title and description
8. Ensure all CI checks pass
9. Request review from maintainers

### Coding Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new functionality
- Update documentation as needed

### Database Strategy
- **Supabase**: Main e-commerce functionality (products, cart, orders)
- **Neon**: Wishlist functionality with session-based persistence
- Both integrations are maintained in parallel

### Testing
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Type checking: `npm run type-check`
- Linting: `npm run lint`

### Environment Variables
See `.env.example` for required environment variables.

### Code Review Guidelines
- Review for functionality, performance, and security
- Check test coverage for new features
- Verify mobile responsiveness
- Ensure accessibility standards
- Validate error handling

### Deployment
- Automatic deployment to Vercel on merge to `main`
- Preview deployments for all PRs
- Environment variables managed in Vercel dashboard
