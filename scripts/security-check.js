import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const securityPatterns = [
  {
    pattern: /SUPABASE_SERVICE_KEY\s*=\s*["'][^"']+["']/g,
    message: 'Supabase service key found in code',
    severity: 'error'
  },
  {
    pattern: /service_role_key\s*=\s*["'][^"']+["']/g,
    message: 'Service role key found in code',
    severity: 'error'
  },
  {
    pattern: /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g,
    message: 'JWT token found in code',
    severity: 'error'
  },
  {
    pattern: /sk_live_[A-Za-z0-9]+/g,
    message: 'Stripe live secret key found in code',
    severity: 'error'
  }
];

const allowedPatterns = [
  /admin123/g, // Development passwords
  /test|mock|demo/gi, // Test data
  /localStorage|sessionStorage/g, // Browser storage
  /TODO|FIXME/gi, // Development comments
  /console\.log/g // Debug statements
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const violations = [];

  for (const { pattern, message, severity } of securityPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      const isAllowed = allowedPatterns.some(allowedPattern => 
        matches.some(match => allowedPattern.test(match))
      );
      
      if (!isAllowed) {
        violations.push({
          file: filePath,
          message,
          severity,
          matches: matches.length
        });
      }
    }
  }

  return violations;
}

function main() {
  console.log('🔍 Running security scan...');
  
  const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', { 
    ignore: ['node_modules/**', 'dist/**', 'build/**'] 
  });
  
  let totalViolations = 0;
  let hasErrors = false;

  for (const file of sourceFiles) {
    const violations = scanFile(file);
    
    if (violations.length > 0) {
      violations.forEach(violation => {
        console.log(`${violation.severity.toUpperCase()}: ${violation.message}`);
        console.log(`  File: ${violation.file}`);
        console.log(`  Matches: ${violation.matches}`);
        console.log('');
        
        totalViolations++;
        if (violation.severity === 'error') {
          hasErrors = true;
        }
      });
    }
  }

  if (totalViolations === 0) {
    console.log('✅ No security violations found');
    process.exit(0);
  } else {
    console.log(`⚠️  Found ${totalViolations} security violations`);
    if (hasErrors) {
      console.log('❌ Security scan failed due to critical violations');
      process.exit(1);
    } else {
      console.log('⚠️  Security scan completed with warnings');
      process.exit(0);
    }
  }
}

main();
