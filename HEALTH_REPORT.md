# Repository Health Report - Rise-Via
Generated on: Sat Aug  9 14:40:25 UTC 2025

## Executive Summary

### 🔴 Critical Issues Found
- **Security Vulnerabilities**: 4 moderate severity vulnerabilities in esbuild/vite dependencies
- **TypeScript Errors**: Missing "type-check" script in package.json
- **ESLint Violations**: 72 problems (58 errors, 14 warnings)
- **Test Failures**: 9/9 tests failed due to Supabase authentication issues
- **Build Warnings**: Large bundle size (822KB main chunk) and CSS import ordering

### 📊 Key Metrics
- **Security Vulnerabilities**: 4 moderate
- **TypeScript Errors**: Script missing (unable to run type-check)
- **ESLint Violations**: 58 errors, 14 warnings
- **Test Pass Rate**: 0% (9 failed, 0 passed)
- **Bundle Size**: 1.3MB total (822KB main JS chunk)
- **Build Status**: ✅ Successful with warnings
- **Outdated Dependencies**: 19 packages need updates

### 🚨 Immediate Action Required
1. Fix Supabase authentication setup in test environment
2. Add missing "type-check" script to package.json
3. Address security vulnerabilities with `npm audit fix`
4. Reduce bundle size through code splitting
5. Fix TypeScript `any` type violations (primary ESLint issue)

## Security Audit
```
# npm audit report

esbuild  <=0.24.2
Severity: moderate
esbuild enables any website to send any requests to the development server and read the response - https://github.com/advisories/GHSA-67mh-4wv8-2f99
fix available via `npm audit fix --force`
Will install vitest@3.2.4, which is a breaking change
node_modules/vite-node/node_modules/esbuild
node_modules/vitest/node_modules/esbuild
  vite  0.11.0 - 6.1.6
  Depends on vulnerable versions of esbuild
  node_modules/vite-node/node_modules/vite
  node_modules/vitest/node_modules/vite
    vite-node  <=2.2.0-beta.2
    Depends on vulnerable versions of vite
    node_modules/vite-node
      vitest  0.0.1 - 0.0.12 || 0.0.29 - 0.0.122 || 0.3.3 - 2.2.0-beta.2
      Depends on vulnerable versions of vite
      Depends on vulnerable versions of vite-node
      node_modules/vitest

4 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
## Build Status
```

> risevia-cannabis@0.0.0 build
> tsc -b && vite build

vite v6.3.5 building for production...
(node:5416) ExperimentalWarning: CommonJS module /home/ubuntu/repos/Rise-Via/vite.config.js is loading ES Module /home/ubuntu/repos/Rise-Via/node_modules/vite/dist/node/index.js using require().
Support for loading ES Module in require() is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
(node:5416) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/ubuntu/repos/Rise-Via/postcss.config.js?t=1754750442529 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/ubuntu/repos/Rise-Via/package.json.
transforming...
[vite:css][postcss] @import must precede all other statements (besides @charset or empty @layer)
7  |  }
8  |  
9  |  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
   |  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
10 |  
11 |  .neon-glow {
✓ 2107 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                          0.46 kB │ gzip:   0.30 kB
dist/assets/index-B25wVtit.css          84.22 kB │ gzip:  13.44 kB
dist/assets/render_resend-BIHI7g3E.js    0.03 kB │ gzip:   0.05 kB
dist/assets/index-Dr-9VQun.js          822.17 kB │ gzip: 240.12 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 4.42s
```

## TypeScript Check
```
npm error Missing script: "type-check"
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: /home/ubuntu/.npm/_logs/2025-08-09T14_40_51_813Z-debug-0.log
## ESLint Report
```

> risevia-cannabis@0.0.0 lint
> eslint .

(node:5544) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/ubuntu/repos/Rise-Via/eslint.config.js?mtime=1754410686554 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/ubuntu/repos/Rise-Via/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)

/home/ubuntu/repos/Rise-Via/src/analytics/cartAnalytics.ts
  20:31  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  40:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  55:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  57:18  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/analytics/wishlistAnalytics.ts
   20:31  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   43:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   58:44  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   60:18  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  146:50  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  151:30  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  186:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  187:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  202:51  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  212:45  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  215:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  222:68  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  225:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/components/AnalyticsPlaceholder.tsx
  11:14  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components
  13:53  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
  14:18  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/components/ProductDetailModal.tsx
  12:12  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/components/admin/CustomerList.tsx
  44:6  warning  React Hook useEffect has a missing dependency: 'fetchCustomers'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/ubuntu/repos/Rise-Via/src/components/admin/OrderManager.tsx
  113:6  warning  React Hook useEffect has a missing dependency: 'loadOrders'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/ubuntu/repos/Rise-Via/src/components/admin/ProductEditor.tsx
  14:21  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  15:13  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/components/admin/ProductManager.tsx
  157:43  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/components/ui/badge.tsx
  36:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/ubuntu/repos/Rise-Via/src/components/ui/button.tsx
  57:18  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/ubuntu/repos/Rise-Via/src/components/ui/form.tsx
  170:3  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/ubuntu/repos/Rise-Via/src/components/ui/navigation-menu.tsx
  119:3  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/ubuntu/repos/Rise-Via/src/components/ui/sidebar.tsx
  770:3  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/ubuntu/repos/Rise-Via/src/components/ui/toggle.tsx
  45:18  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistPage.tsx
   41:6   warning  React Hook useMemo has unnecessary dependencies: 'items' and 'sortBy'. Either exclude them or remove the dependency array  react-hooks/exhaustive-deps
  125:31  error    '_value' is defined but never used                                                                                         @typescript-eslint/no-unused-vars

/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx
   40:55  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
   41:20  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
   41:36  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
   48:14  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components
   68:97  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
   90:47  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
  126:49  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
  145:21  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
  153:45  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any
  188:21  error    Unexpected any. Specify a different type                                                                                        @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/dashboard/WishlistMetricsDashboard.tsx
  59:58  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  60:50  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/hooks/use-toast.ts
  21:7  error  'actionTypes' is assigned a value but only used as a type  @typescript-eslint/no-unused-vars

/home/ubuntu/repos/Rise-Via/src/hooks/useCart.ts
  165:10  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  166:29  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  169:16  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts
  59:38  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/pages/AccountPage.tsx
  39:56  error    Unexpected any. Specify a different type                                                                              @typescript-eslint/no-explicit-any
  46:6   warning  React Hook useEffect has a missing dependency: 'fetchCustomerData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx
  23:40  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  28:48  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/services/authService.ts
   4:57  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  19:61  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  47:62  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/services/priceTracking.ts
  126:42  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  141:52  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  182:54  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  184:18  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  211:32  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  220:35  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/test-utils.tsx
   5:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components
  18:1  warning  This rule can't verify that `export *` only exports components                                          react-refresh/only-export-components

/home/ubuntu/repos/Rise-Via/src/utils/compliance.ts
  179:39  error  '_ipAddress' is defined but never used  @typescript-eslint/no-unused-vars

/home/ubuntu/repos/Rise-Via/src/utils/errorHandling.ts
   27:30  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  209:20  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

/home/ubuntu/repos/Rise-Via/src/utils/imageOptimization.ts
  178:5  error  Expected an assignment or function call and instead saw an expression  @typescript-eslint/no-unused-expressions

/home/ubuntu/repos/Rise-Via/src/utils/security.ts
  98:36  error  Unnecessary escape character: \(  no-useless-escape
  98:38  error  Unnecessary escape character: \)  no-useless-escape

✖ 72 problems (58 errors, 14 warnings)

## Test Results
```

> risevia-cannabis@0.0.0 test
> vitest

[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m

 DEV  v1.6.1 /home/ubuntu/repos/Rise-Via

(node:5612) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/ubuntu/repos/Rise-Via/postcss.config.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/ubuntu/repos/Rise-Via/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
stderr | src/__tests__/error-boundary.test.tsx > ErrorBoundary > renders children when there is no error
Error: Uncaught [TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:68:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
The above error occurred in the <CustomerProvider> component:

    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

 ❯ src/__tests__/error-boundary.test.tsx  (3 tests | 3 failed) 80ms
   ❯ src/__tests__/error-boundary.test.tsx > ErrorBoundary > renders children when there is no error
     → supabase.auth.onAuthStateChange is not a function
   ❯ src/__tests__/error-boundary.test.tsx > ErrorBoundary > renders error UI when there is an error
     → supabase.auth.onAuthStateChange is not a function
   ❯ src/__tests__/error-boundary.test.tsx > ErrorBoundary > allows retry functionality
     → supabase.auth.onAuthStateChange is not a function
 ❯ src/__tests__/routes.test.tsx  (6 tests | 6 failed) 262ms
   ❯ src/__tests__/routes.test.tsx > Critical Routes > renders HomePage without crashing
     → supabase.auth.onAuthStateChange is not a function
   ❯ src/__tests__/routes.test.tsx > Critical Routes > renders ShopPage without crashing
     → supabase.auth.onAuthStateChange is not a function
   ❯ src/__tests__/routes.test.tsx > Critical Routes > renders AdminPage without crashing
     → supabase.auth.onAuthStateChange is not a function
   ❯ src/__tests__/routes.test.tsx > Critical Routes > HomePage contains expected content
     → supabase.auth.onAuthStateChange is not a function
   ❯ src/__tests__/routes.test.tsx > Critical Routes > ShopPage contains shop-related content
     → supabase.auth.onAuthStateChange is not a function
   ❯ src/__tests__/routes.test.tsx > Critical Routes > AdminPage contains admin-related content
     → supabase.auth.onAuthStateChange is not a function
stderr | src/__tests__/routes.test.tsx > Critical Routes > renders HomePage without crashing
Error: Uncaught [TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:68:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at performSyncWorkOnRoot (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26115:3)
    at flushSyncCallbacks (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:12042:22)
The above error occurred in the <CustomerProvider> component:

    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

stderr | src/__tests__/routes.test.tsx > Critical Routes > renders ShopPage without crashing
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:68:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <CustomerProvider> component:

    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

stderr | src/__tests__/routes.test.tsx > Critical Routes > renders AdminPage without crashing
Error: Uncaught [TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:68:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
The above error occurred in the <CustomerProvider> component:

    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

stderr | src/__tests__/routes.test.tsx > Critical Routes > HomePage contains expected content
Error: Uncaught [TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:68:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at performSyncWorkOnRoot (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26115:3)
    at flushSyncCallbacks (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:12042:22)
The above error occurred in the <CustomerProvider> component:

    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

stderr | src/__tests__/routes.test.tsx > Critical Routes > ShopPage contains shop-related content
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_2__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/hooks/useWishlist.ts:15:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
Error: Uncaught [TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:68:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <WishlistButton> component:

    at WishlistButton (/home/ubuntu/repos/Rise-Via/src/components/wishlist/WishlistButton.tsx:16:3)
    at div
    at div
    at div
    at div
    at ProductCard (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:35:26)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at MotionDOMComponent (file:///home/ubuntu/repos/Rise-Via/node_modules/framer-motion/dist/es/motion/index.mjs:42:16)
    at div
    at div
    at ShopPage (/home/ubuntu/repos/Rise-Via/src/pages/ShopPage.tsx:22:53)
    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
The above error occurred in the <CustomerProvider> component:

    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.

stderr | src/__tests__/routes.test.tsx > Critical Routes > AdminPage contains admin-related content
Error: Uncaught [TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function]
    at reportException (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/helpers/runtime-script-errors.js:66:24)
    at innerInvokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:353:9)
    at invokeEventListeners (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:286:3)
    at HTMLUnknownElementImpl._dispatch (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:233:9)
    at HTMLUnknownElementImpl.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/events/EventTarget-impl.js:104:17)
    at HTMLUnknownElement.dispatchEvent (/home/ubuntu/repos/Rise-Via/node_modules/jsdom/lib/jsdom/living/generated/EventTarget.js:241:34)
    at Object.invokeGuardedCallbackDev (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4213:16)
    at invokeGuardedCallback (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:4277:31)
    at reportUncaughtErrorInDEV (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:22877:5)
    at captureCommitPhaseError (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27165:5) TypeError: __vite_ssr_import_5__.supabase.auth.onAuthStateChange is not a function
    at /home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:68:54
    at commitHookEffectListMount (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:23189:26)
    at commitPassiveMountOnFiber (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24970:11)
    at commitPassiveMountEffects_complete (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24930:9)
    at commitPassiveMountEffects_begin (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24917:7)
    at commitPassiveMountEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:24905:3)
    at flushPassiveEffectsImpl (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27078:3)
    at flushPassiveEffects (/home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:27023:14)
    at /home/ubuntu/repos/Rise-Via/node_modules/react-dom/cjs/react-dom.development.js:26808:9
    at flushActQueue (/home/ubuntu/repos/Rise-Via/node_modules/react/cjs/react.development.js:2667:24)
The above error occurred in the <CustomerProvider> component:

    at CustomerProvider (/home/ubuntu/repos/Rise-Via/src/contexts/CustomerContext.tsx:24:29)
    at AllTheProviders (/home/ubuntu/repos/Rise-Via/src/test-utils.tsx:7:28)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 9 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/__tests__/error-boundary.test.tsx > ErrorBoundary > renders children when there is no error
 FAIL  src/__tests__/routes.test.tsx > Critical Routes > renders AdminPage without crashing
 FAIL  src/__tests__/routes.test.tsx > Critical Routes > AdminPage contains admin-related content
TypeError: supabase.auth.onAuthStateChange is not a function
 ❯ src/contexts/CustomerContext.tsx:68:54
     66|     checkAuthStatus();
     67|     
     68|     const { data: { subscription } } = supabase.auth.onAuthStateChange…
       |                                                      ^
     69|       if (event === 'SIGNED_OUT') {
     70|         setCustomer(null);
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3
 ❯ flushPassiveEffects node_modules/react-dom/cjs/react-dom.development.js:27023:14
 ❯ node_modules/react-dom/cjs/react-dom.development.js:26808:9
 ❯ flushActQueue node_modules/react/cjs/react.development.js:2667:24

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/9]⎯

 FAIL  src/__tests__/error-boundary.test.tsx > ErrorBoundary > renders error UI when there is an error
 FAIL  src/__tests__/error-boundary.test.tsx > ErrorBoundary > allows retry functionality
 FAIL  src/__tests__/routes.test.tsx > Critical Routes > renders HomePage without crashing
 FAIL  src/__tests__/routes.test.tsx > Critical Routes > HomePage contains expected content
TypeError: supabase.auth.onAuthStateChange is not a function
 ❯ src/contexts/CustomerContext.tsx:68:54
     66|     checkAuthStatus();
     67|     
     68|     const { data: { subscription } } = supabase.auth.onAuthStateChange…
       |                                                      ^
     69|       if (event === 'SIGNED_OUT') {
     70|         setCustomer(null);
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3
 ❯ flushPassiveEffects node_modules/react-dom/cjs/react-dom.development.js:27023:14
 ❯ performSyncWorkOnRoot node_modules/react-dom/cjs/react-dom.development.js:26115:3
 ❯ flushSyncCallbacks node_modules/react-dom/cjs/react-dom.development.js:12042:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/9]⎯

 FAIL  src/__tests__/routes.test.tsx > Critical Routes > renders ShopPage without crashing
 FAIL  src/__tests__/routes.test.tsx > Critical Routes > ShopPage contains shop-related content
TypeError: supabase.auth.onAuthStateChange is not a function
 ❯ src/hooks/useWishlist.ts:15:54
     13|     loadWishlist()
     14|     
     15|     const { data: { subscription } } = supabase.auth.onAuthStateChange…
       |                                                      ^
     16|       if (event === 'SIGNED_IN' && session?.user) {
     17|         await wishlistService.migrateSessionWishlist(session.user.id)
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3
 ❯ flushPassiveEffects node_modules/react-dom/cjs/react-dom.development.js:27023:14
 ❯ node_modules/react-dom/cjs/react-dom.development.js:26808:9
 ❯ flushActQueue node_modules/react/cjs/react.development.js:2667:24

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/9]⎯

⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 30 unhandled errors during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.

⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯
TypeError: supabase.from(...).select(...).eq(...).single is not a function
 ❯ Object.getOrCreateSession src/services/wishlistService.ts:20:8
     18|       .select('*')
     19|       .eq('session_token', token)
     20|       .single()
       |        ^
     21| 
     22|     if (existingSession) return existingSession
 ❯ Object.getWishlist src/services/wishlistService.ts:47:32
 ❯ loadWishlist src/hooks/useWishlist.ts:50:51
 ❯ src/hooks/useWishlist.ts:13:5
 ❯ commitHookEffectListMount node_modules/react-dom/cjs/react-dom.development.js:23189:26
 ❯ commitPassiveMountOnFiber node_modules/react-dom/cjs/react-dom.development.js:24970:11
 ❯ commitPassiveMountEffects_complete node_modules/react-dom/cjs/react-dom.development.js:24930:9
 ❯ commitPassiveMountEffects_begin node_modules/react-dom/cjs/react-dom.development.js:24917:7
 ❯ commitPassiveMountEffects node_modules/react-dom/cjs/react-dom.development.js:24905:3
 ❯ flushPassiveEffectsImpl node_modules/react-dom/cjs/react-dom.development.js:27078:3

This error originated in "src/__tests__/routes.test.tsx" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 Test Files  2 failed (2)
      Tests  9 failed (9)
     Errors  30 errors
   Start at  14:41:03
   Duration  2.01s (transform 372ms, setup 218ms, collect 1.06s, tests 342ms, environment 936ms, prepare 396ms)


 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
Cancelling test run. Press CTRL+c again to exit forcefully.

## Bundle Size
```
1.3M	dist/
```

## Outdated Dependencies
```
Package                 Current   Wanted   Latest  Location                             Depended by
@eslint/js               9.32.0   9.33.0   9.33.0  node_modules/@eslint/js              Rise-Via
@supabase/supabase-js    2.53.0   2.54.0   2.54.0  node_modules/@supabase/supabase-js   Rise-Via
@testing-library/react   14.3.1   14.3.1   16.3.0  node_modules/@testing-library/react  Rise-Via
@types/node              24.2.0   24.2.1   24.2.1  node_modules/@types/node             Rise-Via
@types/react            18.3.23  18.3.23   19.1.9  node_modules/@types/react            Rise-Via
@types/react-dom         18.3.7   18.3.7   19.1.7  node_modules/@types/react-dom        Rise-Via
@vitejs/plugin-react      4.7.0    4.7.0    5.0.0  node_modules/@vitejs/plugin-react    Rise-Via
autoprefixer            10.4.20  10.4.21  10.4.21  node_modules/autoprefixer            Rise-Via
eslint                   9.32.0   9.33.0   9.33.0  node_modules/eslint                  Rise-Via
globals                 15.15.0  15.15.0   16.3.0  node_modules/globals                 Rise-Via
jsdom                    23.2.0   23.2.0   26.1.0  node_modules/jsdom                   Rise-Via
lucide-react            0.364.0  0.364.0  0.539.0  node_modules/lucide-react            Rise-Via
postcss                  8.4.49    8.5.6    8.5.6  node_modules/postcss                 Rise-Via
react                    18.3.1   18.3.1   19.1.1  node_modules/react                   Rise-Via
react-dom                18.3.1   18.3.1   19.1.1  node_modules/react-dom               Rise-Via
recharts                 2.12.4   2.15.4    3.1.2  node_modules/recharts                Rise-Via
resend                    5.0.0    5.0.0    6.0.1  node_modules/resend                  Rise-Via
tailwindcss              3.4.16   3.4.17   4.1.11  node_modules/tailwindcss             Rise-Via
typescript                5.6.3    5.6.3    5.9.2  node_modules/typescript              Rise-Via
vite                      6.3.5    6.3.5    7.1.1  node_modules/vite                    Rise-Via
vitest                    1.6.1    1.6.1    3.2.4  node_modules/vitest                  Rise-Via
zod                      4.0.14   4.0.16   4.0.16  node_modules/zod                     Rise-Via
