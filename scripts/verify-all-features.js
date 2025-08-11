#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 RISE-VIA FEATURE VERIFICATION\n');
console.log('=' .repeat(50));

const features = {
  'Shopping Cart': {
    files: ['src/hooks/useCart.ts', 'src/components/cart/CartSidebar.tsx'],
    status: null
  },
  'Checkout Flow': {
    files: ['src/pages/CheckoutPage.tsx', 'src/components/StripeCheckout.tsx'],
    status: null
  },
  'Customer Accounts': {
    files: ['src/contexts/CustomerContext.tsx', 'src/pages/AccountPage.tsx'],
    status: null
  },
  'Admin Dashboard': {
    files: ['src/pages/AdminPage.tsx', 'src/components/admin/ProductEditor.tsx'],
    status: null
  },
  
  'Age Verification': {
    files: ['src/components/AgeVerificationModal.tsx', 'src/components/AgeGate.tsx'],
    status: null
  },
  'Privacy Policy': {
    files: ['src/pages/PrivacyPage.tsx', 'src/pages/legal/PrivacyPolicy.tsx'],
    status: null
  },
  'Terms of Service': {
    files: ['src/pages/TermsPage.tsx', 'src/pages/legal/TermsOfService.tsx'],
    status: null
  },
  'State Restrictions': {
    files: ['src/utils/stateRestrictions.ts'],
    status: null
  },
  
  'Wishlist Persistence': {
    files: ['src/hooks/useWishlist.ts', 'src/lib/neon.ts'],
    status: null
  },
  'Password Reset': {
    files: ['src/pages/ResetPasswordPage.tsx'],
    status: null
  },
  'Order Tracking': {
    files: ['src/pages/OrderTrackingPage.tsx'],
    status: null
  },
  'Product Reviews': {
    files: ['src/components/ProductReviews.tsx'],
    status: null
  },
  
  'Coupon System': {
    files: ['src/components/CouponInput.tsx', 'src/services/couponService.ts'],
    status: null
  },
  'Abandoned Cart': {
    files: ['src/services/abandonedCartService.ts'],
    status: null
  },
  'Shipping Calculator': {
    files: ['src/components/ShippingCalculator.tsx'],
    status: null
  },
  'Tax Calculator': {
    files: ['src/utils/taxCalculator.ts'],
    status: null
  }
};

Object.entries(features).forEach(([name, config]) => {
  const allFilesExist = config.files.every(file => {
    const fullPath = path.join(process.cwd(), file);
    return fs.existsSync(fullPath);
  });
  
  config.status = allFilesExist ? '✅' : '❌';
  console.log(`${config.status} ${name}`);
  if (!allFilesExist) {
    config.files.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (!fs.existsSync(fullPath)) {
        console.log(`   Missing: ${file}`);
      }
    });
  }
});

const completed = Object.values(features).filter(f => f.status === '✅').length;
const total = Object.keys(features).length;
const percentage = Math.round((completed / total) * 100);

console.log('\n' + '=' .repeat(50));
console.log(`📊 COMPLETION STATUS: ${completed}/${total} (${percentage}%)`);
console.log('=' .repeat(50));

const report = {
  timestamp: new Date().toISOString(),
  completed,
  total,
  percentage,
  features
};

fs.writeFileSync('FEATURE_STATUS.json', JSON.stringify(report, null, 2));
console.log('\n📁 Report saved to FEATURE_STATUS.json');
