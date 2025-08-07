import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔒 Running security check...');

const filesToCheck = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.jsx'
];

const dangerousPatterns = [
  /SUPABASE_SERVICE_KEY.*=.*[^env]/i,
  /service_role.*eyJ/i,
  /sk_live_/i,
  /sk_test_.*[a-zA-Z0-9]{20,}/i,
  /password.*=.*[^env]/i,
  /secret.*=.*[^env]/i,
  /private.*key.*=.*[^env]/i
];

let violations = 0;

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      dangerousPatterns.forEach(pattern => {
        if (pattern.test(line) && !line.includes('process.env') && !line.includes('import.meta.env')) {
          console.error(`❌ Security violation in ${filePath}:${index + 1}`);
          console.error(`   Line: ${line.trim()}`);
          violations++;
        }
      });
    });
  } catch (error) {
    console.warn(`⚠️ Could not read file: ${filePath}`);
  }
}

function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        checkFile(fullPath);
      }
    });
  } catch (error) {
    console.warn(`⚠️ Could not scan directory: ${dir}`);
  }
}

const envLocalPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists (good for local development)');
  console.log('⚠️ Make sure .env.local is in .gitignore and not committed');
}

const srcPath = path.join(__dirname, '../src');
scanDirectory(srcPath);

const gitignorePath = path.join(__dirname, '../.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignoreContent.includes('.env.local')) {
    console.error('❌ .env.local is not in .gitignore');
    violations++;
  } else {
    console.log('✅ .env.local is properly ignored');
  }
}

console.log('\n📊 Security Check Summary:');
if (violations === 0) {
  console.log('✅ No security violations found');
  process.exit(0);
} else {
  console.log(`❌ Found ${violations} security violation(s)`);
  console.log('Please fix these issues before deploying');
  process.exit(1);
}
