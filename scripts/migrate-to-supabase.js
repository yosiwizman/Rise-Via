import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

config({ path: path.join(__dirname, '../.env.local') })

const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_SERVICE_KEY']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    console.error('Please check your .env.local file')
    process.exit(1)
  }
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
)

const productsPath = path.join(__dirname, '../src/data/products.json')
if (!fs.existsSync(productsPath)) {
  console.error(`❌ Products file not found: ${productsPath}`)
  process.exit(1)
}

const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'))
const products = productsData.products || productsData

console.log(`📦 Found ${products.length} products to migrate`)

async function migrateProducts() {
  console.log('🚀 Starting product migration...')
  
  const errors = []
  const successful = []
  
  try {
    console.log('🔌 Testing database connection...')
    const { error: pingError } = await supabase.from('products').select('count').limit(1)
    if (pingError) {
      console.error('❌ Cannot connect to database:', pingError.message)
      console.error('Please check your Supabase credentials and ensure the products table exists')
      process.exit(1)
    }
    console.log('✅ Database connection successful')
    
    
    const transformedProducts = products.map((product, index) => {
      try {
        if (!product.name) throw new Error(`Product at index ${index} missing name`)
        if (!product.price && !product.basePrice) throw new Error(`Product ${product.name} missing price`)
        
        const sku = product.sku || `SKU-${Date.now()}-${String(index).padStart(3, '0')}`
        
        const slug = product.slug || product.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        
        return {
          name: product.name,
          slug: slug,
          sku: sku,
          description: product.description || '',
          category: product.category || 'flower',
          strain_type: product.strainType || product.strain_type || 'hybrid',
          price: parseFloat(product.price || product.basePrice || '0'),
          thca_percentage: parseFloat(product.thcaPercentage || product.thca || '0'),
          effects: Array.isArray(product.effects) ? product.effects : [],
          terpenes: Array.isArray(product.terpenes) ? product.terpenes : [],
          inventory_count: product.quantity || product.inventory || product.inventory_count || 100,
          images: Array.isArray(product.images) ? product.images : [product.image].filter(Boolean),
          thumbnail: product.thumbnail || (product.images && product.images[0]) || product.image || null,
          featured: product.featured || false,
          status: product.status || 'active',
          lab_results_url: product.labResultsUrl || product.lab_results_url || null,
          coa_url: product.coaUrl || product.coa_url || null,
          batch_number: product.batchNumber || product.batch_number || `BATCH-2024-${String(index).padStart(3, '0')}`,
          harvest_date: product.harvestDate || product.harvest_date || new Date().toISOString().split('T')[0]
        }
      } catch (error) {
        errors.push({ product: product.name || `Index ${index}`, error: error.message })
        return null
      }
    }).filter(Boolean)
    
    if (errors.length > 0) {
      console.warn('⚠️ Validation errors found:')
      errors.forEach(e => console.warn(`  - ${e.product}: ${e.error}`))
    }
    
    console.log(`✅ Validated ${transformedProducts.length} products for migration`)
    
    const batchSize = 10
    for (let i = 0; i < transformedProducts.length; i += batchSize) {
      const batch = transformedProducts.slice(i, i + batchSize)
      const batchNumber = Math.floor(i/batchSize) + 1
      const totalBatches = Math.ceil(transformedProducts.length/batchSize)
      
      console.log(`📤 Inserting batch ${batchNumber}/${totalBatches} (${batch.length} products)...`)
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`❌ Batch ${batchNumber} failed:`, error.message)
        console.error('Error details:', error)
        errors.push({ batch: batchNumber, error: error.message, details: error })
        
        console.log(`🔍 Attempting individual inserts for batch ${batchNumber}...`)
        for (const product of batch) {
          try {
            const { data: singleData, error: singleError } = await supabase
              .from('products')
              .insert([product])
              .select()
            
            if (singleError) {
              console.error(`❌ Failed to insert ${product.name}:`, singleError.message)
              errors.push({ product: product.name, error: singleError.message })
            } else {
              successful.push(...singleData)
              console.log(`✅ Successfully inserted ${product.name}`)
            }
          } catch (individualError) {
            console.error(`❌ Exception inserting ${product.name}:`, individualError.message)
            errors.push({ product: product.name, error: individualError.message })
          }
        }
      } else {
        successful.push(...data)
        console.log(`✅ Batch ${batchNumber} inserted ${data.length} products`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error getting final count:', countError.message)
    }
    
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successfully migrated: ${successful.length} products`)
    console.log(`❌ Failed: ${errors.length} items`)
    console.log(`📦 Total in database: ${count || 'unknown'} products`)
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      errors.forEach(e => {
        if (e.product) {
          console.log(`  - ${e.product}: ${e.error}`)
        } else if (e.batch) {
          console.log(`  - Batch ${e.batch}: ${e.error}`)
        }
      })
    }
    
    const logPath = path.join(__dirname, `migration-log-${Date.now()}.json`)
    const logData = {
      timestamp: new Date().toISOString(),
      successful: successful.length,
      failed: errors.length,
      errors,
      totalInDb: count,
      migratedProducts: successful.map(p => ({ id: p.id, name: p.name, sku: p.sku }))
    }
    
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2))
    console.log(`\n📝 Migration log saved to: ${logPath}`)
    
    if (successful.length > 0) {
      console.log('\n🎉 Migration completed successfully!')
      console.log('Next steps:')
      console.log('1. Check your Supabase dashboard to verify products')
      console.log('2. Test the application with the new database')
      console.log('3. Update your application to use Supabase instead of JSON')
    } else {
      console.log('\n❌ Migration failed - no products were successfully inserted')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Migration failed with exception:', error)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

console.log('🌱 Rise-Via Product Migration to Supabase')
console.log('==========================================')
migrateProducts()
