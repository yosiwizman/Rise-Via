#!/usr/bin/env node

/**
 * Quick TypeScript fixes for CI/CD
 */

import fs from 'fs';
import path from 'path';

const fixes = [
  // Remove unused variables by adding underscore prefix
  {
    file: 'src/lib/performance-optimization.ts',
    search: 'error?: Error',
    replace: '_error?: Error'
  },
  {
    file: 'src/lib/third-party-integrations.ts',
    search: 'async getContacts(filters?: any)',
    replace: 'async getContacts(_filters?: any)'
  },
  {
    file: 'src/lib/third-party-integrations.ts',
    search: 'async sendSMS(to: string, message: string, metadata?: any)',
    replace: 'async sendSMS(to: string, message: string, _metadata?: any)'
  },
  {
    file: 'src/services/aiService.ts',
    search: 'type PredictiveAnalytics',
    replace: 'type _PredictiveAnalytics'
  },
  {
    file: 'src/services/aiService.ts',
    search: 'CacheManager,',
    replace: '// CacheManager,'
  },
  {
    file: 'src/services/aiService.ts',
    search: 'HubSpotIntegration,',
    replace: '// HubSpotIntegration,'
  },
  {
    file: 'src/services/aiService.ts',
    search: 'TwilioSMSIntegration,',
    replace: '// TwilioSMSIntegration,'
  },
  {
    file: 'src/services/aiService.ts',
    search: 'type IntegrationConfig,',
    replace: '// type IntegrationConfig,'
  },
  {
    file: 'src/services/aiService.ts',
    search: 'type SyncResult',
    replace: '// type SyncResult'
  }
];

console.log('🔧 Applying TypeScript fixes...');

fixes.forEach(fix => {
  const filePath = path.join(process.cwd(), fix.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(fix.search)) {
      content = content.replace(fix.search, fix.replace);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${fix.file}`);
    }
  }
});

console.log('🎉 TypeScript fixes applied!');