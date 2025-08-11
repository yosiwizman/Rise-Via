const imports = [
  { name: 'Navigation', path: '../components/Navigation' },
  { name: 'Footer', path: '../components/Footer' },
  { name: 'SecurityUtils', path: '../utils/security' },
  { name: 'PerformanceMonitor', path: '../utils/performance' },
  { name: 'useWishlist', path: '../hooks/useWishlist' },
  { name: 'AdminPage', path: '../pages/AdminPage' },
  { name: 'App', path: '../App' }
];

export async function testImports() {
  console.log('🔍 Starting import test...');
  
  for (const imp of imports) {
    try {
      console.log(`🔍 Testing import: ${imp.name}`);
      await import(imp.path);
      console.log(`✅ ${imp.name} imported successfully`);
    } catch (error) {
      console.error(`❌ ${imp.name} import failed:`, error);
      if (error instanceof Error && error.message.includes("'S'")) {
        console.error(`🔴 FOUND 'S' ERROR IN ${imp.name}!`, error.stack);
      }
    }
  }
  
  console.log('🔍 Import test completed');
}
