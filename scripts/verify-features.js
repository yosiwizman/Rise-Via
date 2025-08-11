const fs = require('fs');
const path = require('path');

const features = {
  'wishlist_persistence': {
    test: () => {
      const wishlistData = localStorage.getItem('risevia-wishlist');
      return wishlistData !== null || localStorage.getItem('wishlist_session') !== null;
    },
    location: 'src/hooks/useWishlist.ts',
    description: 'Wishlist items persist after page refresh'
  },
  'browse_products_button': {
    test: () => {
      return document.querySelector('[data-testid="browse-products"]') !== null ||
             document.querySelector('a[href="/shop"]') !== null ||
             document.querySelector('button[onclick*="shop"]') !== null;
    },
    location: 'src/pages/HomePage.tsx',
    description: 'Browse products button exists and navigates to shop'
  },
  
  'age_verification': {
    test: () => {
      return localStorage.getItem('age_verified') !== null ||
             localStorage.getItem('risevia_age_verified') !== null;
    },
    location: 'src/components/AgeGate.tsx',
    description: 'Age verification modal and persistence'
  },
  'privacy_policy': {
    test: () => {
      return fetch('/privacy').then(r => r.status === 200).catch(() => false);
    },
    location: 'src/pages/PrivacyPage.tsx',
    description: 'Separate privacy policy page'
  },
  'terms_of_service': {
    test: () => {
      return fetch('/terms').then(r => r.status === 200).catch(() => false);
    },
    location: 'src/pages/TermsPage.tsx',
    description: 'Separate terms of service page'
  },
  'state_restrictions': {
    test: () => {
      return typeof window.checkStateRestrictions === 'function' ||
             document.querySelector('[data-testid="state-blocker"]') !== null;
    },
    location: 'src/components/StateBlocker.tsx',
    description: 'State shipping restrictions enforcement'
  },
  
  'password_reset': {
    test: () => {
      return fetch('/reset-password').then(r => r.status === 200).catch(() => false);
    },
    location: 'src/pages/ResetPasswordPage.tsx',
    description: 'Password reset functionality'
  },
  'order_tracking': {
    test: () => {
      return fetch('/account/orders').then(r => r.status === 200).catch(() => false) ||
             fetch('/orders/track').then(r => r.status === 200).catch(() => false);
    },
    location: 'src/pages/OrderTrackingPage.tsx',
    description: 'Customer order tracking system'
  },
  'product_reviews': {
    test: () => {
      return document.querySelector('[data-testid="product-reviews"]') !== null ||
             document.querySelector('.product-reviews') !== null;
    },
    location: 'src/components/ProductReviews.tsx',
    description: 'Product reviews and ratings system'
  }
};

const checkFileExists = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
};

const generateReport = () => {
  const timestamp = new Date().toISOString();
  let report = `# FEATURE VERIFICATION REPORT - ${timestamp}\n\n`;
  
  report += `## Executive Summary\n`;
  report += `This report provides a comprehensive assessment of the current feature implementation status in the RiseViA cannabis e-commerce platform.\n\n`;
  
  report += `## File Status Check\n\n`;
  
  const expectedFiles = [
    'src/pages/PrivacyPage.tsx',
    'src/pages/TermsPage.tsx', 
    'src/pages/ResetPasswordPage.tsx',
    'src/pages/OrderTrackingPage.tsx',
    'src/components/ProductReviews.tsx',
    'src/components/AgeGate.tsx',
    'src/components/StateBlocker.tsx',
    'src/hooks/useWishlist.ts'
  ];
  
  expectedFiles.forEach(file => {
    const exists = checkFileExists(file);
    report += `${exists ? '✅' : '❌'} ${file} ${exists ? 'exists' : 'missing'}\n`;
  });
  
  report += `\n## Feature Implementation Status\n\n`;
  
  Object.entries(features).forEach(([name, feature]) => {
    const exists = checkFileExists(feature.location);
    report += `### ${name.replace(/_/g, ' ').toUpperCase()}\n`;
    report += `- **Location**: ${feature.location}\n`;
    report += `- **Description**: ${feature.description}\n`;
    report += `- **File Status**: ${exists ? '✅ EXISTS' : '❌ MISSING'}\n`;
    report += `- **Test**: Browser-based functional test required\n\n`;
  });
  
  report += `## Database Status\n\n`;
  report += `### Expected Tables\n`;
  const expectedTables = [
    'users',
    'customers', 
    'products',
    'orders',
    'order_items',
    'wishlist_sessions',
    'wishlist_items',
    'reviews',
    'coupons',
    'password_resets'
  ];
  
  expectedTables.forEach(table => {
    report += `- ${table}\n`;
  });
  
  report += `\n*Note: Database table verification requires Neon connection*\n\n`;
  
  report += `## Implementation Priority\n\n`;
  report += `### PRIORITY 1: Critical Fixes (Immediate)\n`;
  report += `- [ ] Fix wishlist persistence (if broken)\n`;
  report += `- [ ] Fix browse products button (if broken)\n\n`;
  
  report += `### PRIORITY 2: Legal Compliance (Day 1)\n`;
  report += `- [ ] Create separate Privacy Policy page\n`;
  report += `- [ ] Create separate Terms of Service page\n`;
  report += `- [ ] Verify age verification system\n\n`;
  
  report += `### PRIORITY 3: Security Features (Day 2)\n`;
  report += `- [ ] Implement password reset system\n`;
  report += `- [ ] Create order tracking page\n`;
  report += `- [ ] Add product reviews system\n\n`;
  
  report += `## Next Steps\n\n`;
  report += `1. **Manual Browser Testing**: Start development server and test each feature\n`;
  report += `2. **Database Verification**: Check Neon tables and schema\n`;
  report += `3. **Implementation Planning**: Create detailed implementation plan for missing features\n`;
  report += `4. **Systematic Implementation**: Implement features in priority order\n\n`;
  
  report += `## Technical Notes\n\n`;
  report += `- **Framework**: React 19 with Vite\n`;
  report += `- **Database**: Neon PostgreSQL\n`;
  report += `- **State Management**: Zustand\n`;
  report += `- **Styling**: TailwindCSS with custom risevia-* classes\n`;
  report += `- **Authentication**: Custom implementation with Neon\n\n`;
  
  report += `---\n`;
  report += `*Report generated by automated verification script*\n`;
  report += `*Manual testing required for complete verification*\n`;
  
  return report;
};

const report = generateReport();
const reportPath = path.join(__dirname, '..', 'VERIFICATION_REPORT.md');
fs.writeFileSync(reportPath, report);

console.log('📊 VERIFICATION REPORT GENERATED');
console.log('📁 Location: VERIFICATION_REPORT.md');
console.log('\n🔍 FILE STATUS SUMMARY:');

const expectedFiles = [
  'src/pages/PrivacyPage.tsx',
  'src/pages/TermsPage.tsx', 
  'src/pages/ResetPasswordPage.tsx',
  'src/pages/OrderTrackingPage.tsx',
  'src/components/ProductReviews.tsx'
];

expectedFiles.forEach(file => {
  const exists = checkFileExists(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🎯 NEXT ACTIONS:');
console.log('1. Start development server: npm run dev');
console.log('2. Test existing features in browser');
console.log('3. Check database tables in Neon');
console.log('4. Implement missing features in priority order');

module.exports = { features, generateReport };
