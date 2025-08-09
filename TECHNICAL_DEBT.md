# Technical Debt Report

Generated: 2025-08-08T19:16:33.098Z

## Summary ⚠️

| Metric | Value | Trend |
|--------|-------|-------|
| Total Violations | 69 | 📈 +13 |
| Errors | 56 | 🔴 |
| Warnings | 13 | 🟡 |
| Baseline | 56 | 📊 |

## Top 5 Files with Most Violations

- `src/analytics/wishlistAnalytics.ts`: 13 violations
- `src/contexts/CustomerContext.tsx`: 9 violations
- `src/services/priceTracking.ts`: 6 violations
- `src/analytics/cartAnalytics.ts`: 4 violations
- `src/components/AnalyticsPlaceholder.tsx`: 3 violations

## Top 5 Most Violated Rules

- `@typescript-eslint/no-explicit-any`: 51 occurrences
- `react-refresh/only-export-components`: 10 occurrences
- `react-hooks/exhaustive-deps`: 3 occurrences
- `@typescript-eslint/no-unused-vars`: 2 occurrences
- `no-useless-escape`: 2 occurrences

## Progress Tracking

⚠️ **Attention needed!** Technical debt increased by 13 violations.

## Action Items

- [ ] Fix 56 errors (priority: HIGH)
- [ ] Address `@typescript-eslint/no-explicit-any` violations (51 occurrences)
- [ ] Refactor `src/analytics/wishlistAnalytics.ts`
- [ ] Schedule tech debt sprint to reduce violations below 40
## How to Fix

1. Run `npm run lint:fix` to auto-fix some violations
2. Review files in the top 5 list above
3. Focus on one rule at a time from the most violated list
4. Run `npm run debt:track` to update progress
