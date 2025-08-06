#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running build validation checks...\n');

const checks = [
  {
    name: 'TypeScript compilation',
    command: 'npx tsc --noEmit',
    description: 'Checking for TypeScript errors'
  },
  {
    name: 'ESLint validation',
    command: 'npm run lint',
    description: 'Running linting checks'
  },
  {
    name: 'Tests',
    command: 'npm run test:run',
    description: 'Running automated tests'
  },
  {
    name: 'Build process',
    command: 'npm run build',
    description: 'Testing production build'
  }
];

const criticalFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/ShopPage.tsx',
  'src/pages/AdminPage.tsx',
  'vercel.json',
  'vite.config.ts'
];

let hasErrors = false;

console.log('📁 Checking critical files...');
for (const file of criticalFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing critical file: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${file}`);
  }
}
console.log();

for (const check of checks) {
  console.log(`🔧 ${check.description}...`);
  try {
    execSync(check.command, { stdio: 'pipe' });
    console.log(`✅ ${check.name} passed\n`);
  } catch (error) {
    console.error(`❌ ${check.name} failed:`);
    console.error(error.stdout?.toString() || error.message);
    console.log();
    hasErrors = true;
  }
}

if (fs.existsSync('dist')) {
  console.log('📦 Checking build output...');
  const distFiles = ['dist/index.html', 'dist/assets'];
  for (const file of distFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.error(`❌ Missing build output: ${file}`);
      hasErrors = true;
    }
  }
  console.log();
}

console.log('🔗 Checking for URL construction issues...');
try {
  const imageOptFile = fs.readFileSync('src/utils/imageOptimization.ts', 'utf8');
  if (imageOptFile.includes('new URL(') && imageOptFile.includes('try {')) {
    console.log('✅ URL construction has error handling');
  } else {
    console.error('❌ URL construction may lack proper error handling');
    hasErrors = true;
  }
} catch (error) {
  console.error('❌ Could not validate URL construction');
  hasErrors = true;
}

console.log();
if (hasErrors) {
  console.error('❌ Build validation failed! Please fix the issues above.');
  process.exit(1);
} else {
  console.log('✅ All build validation checks passed!');
  process.exit(0);
}
