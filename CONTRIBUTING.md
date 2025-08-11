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
- **Neon**: Primary PostgreSQL database for all functionality (products, cart, orders, wishlist)
- Session-based persistence with fallback to local storage
- Single database integration for simplified architecture

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

## 🔧 Technical Debt Management

### Current Status
We are actively managing technical debt in the RiseViA codebase. As of the latest report:

- **Current Violations:** 69 ESLint violations
- **Target:** Gradual reduction to 0 violations
- **Strategy:** Progressive enforcement with automated tracking

### CI/CD Behavior

#### What Passes CI
✅ **Builds that don't increase violations** - Your PR will pass if:
- Total violations ≤ 69 (current baseline)
- No new violations introduced
- All other checks pass (build, security, etc.)

#### What Fails CI
❌ **Builds that increase violations** - Your PR will fail if:
- Total violations > 69
- New ESLint errors introduced
- Security vulnerabilities detected

#### Temporary Allowances
⚠️ **Current allowances for existing violations:**
- `@typescript-eslint/no-explicit-any`: 51 occurrences (being addressed)
- `react-refresh/only-export-components`: 10 occurrences
- `react-hooks/exhaustive-deps`: 3 occurrences
- Other minor violations: 5 occurrences

### Contributing Without Adding Tech Debt

#### Before You Code
```bash
# Check current violation count
npm run debt:report

# Run linting to see current issues
npm run lint:ci
```

#### While You Code
- **Use TypeScript properly** - Avoid `any` types, use specific interfaces
- **Follow React best practices** - Proper hook dependencies, component exports
- **Run linting frequently** - `npm run lint` to catch issues early

#### Before You Commit
```bash
# Auto-fix what can be fixed
npm run lint:fix

# Check if you've introduced new violations
npm run lint:ci

# Generate updated tech debt report
npm run debt:report
```

### Monitoring Progress

#### Automated Tracking
- Every PR gets a tech debt report comment
- Violation trends are tracked over time
- Progress is measured against sprint goals

#### Sprint Goals
- **Sprint 1-2:** Reduce to 60 violations (-9)
- **Sprint 3-4:** Reduce to 50 violations (-10)
- **Sprint 5-6:** Reduce to 40 violations (-10)
- **Sprint 7-8:** Reduce to 30 violations (-10)
- **Sprint 9-10:** Reduce to 20 violations (-10)
- **Sprint 11-12:** Reduce to 0 violations (-20)

### Labels for Tech Debt Work
When working on tech debt reduction, use these labels:
- `tech-debt` - General technical debt work
- `type-safety` - Fixing TypeScript `any` types
- `react-hooks` - Fixing hook dependency issues
- `code-quality` - General code quality improvements
- `refactoring` - Code structure improvements

### FAQ

#### Q: Why does my PR pass CI even with ESLint warnings?
A: We use progressive enforcement. As long as you don't increase the total violation count above 69, your PR will pass. This allows us to make progress while gradually improving code quality.

#### Q: Should I fix existing violations in my PR?
A: Yes, if they're related to your changes! Fixing violations while working on related code is encouraged and helps reduce our technical debt.

#### Q: What if I need to use `any` type temporarily?
A: Use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a comment explaining why, and create a follow-up issue to fix it properly.

#### Q: How can I help reduce technical debt?
A: 
1. Fix violations in files you're already modifying
2. Pick up tech debt issues during slower periods
3. Suggest better type definitions during code review
4. Help document patterns and best practices

### Recognition
Contributors who help reduce technical debt will be recognized in:
- Monthly team updates
- Contribution leaderboards  
- Special "Code Quality Champion" mentions

---

Thank you for contributing to RiseViA! 🌿
