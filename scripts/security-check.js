import fs from 'fs'
import path from 'path'

console.log('🔒 Running security check...')

const ALLOWED_PATTERNS = [
  'admin123', // Dev admin password
  'test', 'mock', 'example', 'demo', // Test data
  'localStorage', 'sessionStorage', // Browser storage for dev
  'TODO', 'FIXME', // Dev comments
  'console.log', // Dev logging
  'ANALYTICS_KEY', 'METRICS_KEY', 'STORAGE_KEY', // Dev localStorage keys
]

const FORBIDDEN_PATTERNS = [
  /SUPABASE_SERVICE_KEY\s*=\s*["'][^"']+["']/,
  /service_role_key\s*[:=]\s*["'][^"']+["']/,
  /Bearer\s+eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/, // Real JWT tokens
  /sk_live_[a-zA-Z0-9]+/, // Stripe live keys
  /password\s*[:=]\s*["'][^"']{20,}["']/, // Long passwords (likely real)
  /secret\s*[:=]\s*["'][^"']{20,}["']/, // Long secrets (likely real)
]

let violations = 0

function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath)
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        checkFile(fullPath)
      }
    })
  } catch (error) {
    console.warn(`⚠️ Could not scan directory: ${dir}`)
  }
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (pattern.test(content)) {
        const isAllowed = ALLOWED_PATTERNS.some(allowedPattern => 
          content.includes(allowedPattern)
        )
        
        if (!isAllowed) {
          console.error(`❌ Security violation in ${filePath}: Potential secret exposed`)
          violations++
        } else {
          console.log(`⚠️ Development pattern found in ${filePath} (allowed)`)
        }
      }
    })
  } catch (error) {
    console.warn(`⚠️ Could not read file: ${filePath}`)
  }
}

const envLocalPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists (good for local development)')
  console.log('⚠️ Make sure .env.local is in .gitignore and not committed')
}

const gitignorePath = path.join(process.cwd(), '.gitignore')
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
  if (!gitignoreContent.includes('.env.local')) {
    console.error('❌ .env.local is not in .gitignore')
    violations++
  } else {
    console.log('✅ .env.local is properly ignored')
  }
}

const srcPath = path.join(process.cwd(), 'src')
scanDirectory(srcPath)

console.log('\n📊 Security Check Summary:')
if (violations === 0) {
  console.log('✅ No security violations found')
  process.exit(0)
} else {
  console.log(`❌ Found ${violations} security violation(s)`)
  console.log('Please fix these issues before deploying')
  process.exit(1)
}
