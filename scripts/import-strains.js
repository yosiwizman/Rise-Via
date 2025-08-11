import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const neonUrl = process.env.VITE_NEON_DATABASE_URL;

if (!neonUrl) {
  console.error('Missing Neon database configuration');
  process.exit(1);
}

const sql = neon(neonUrl);

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const generateSampleId = (index) => {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `${date}P${String(index).padStart(3, '0')}`;
};

const generateBatchId = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const randomNumbers = Math.floor(Math.random() * 9000000) + 1000000;
  return `${randomLetters} - ${randomNumbers}`;
};

const generateEffects = (strainType) => {
  const indicaEffects = ['relaxation', 'sleep', 'stress-relief', 'pain-relief', 'appetite'];
  const sativaEffects = ['energy', 'creativity', 'focus', 'euphoria', 'uplifting'];
  const hybridEffects = ['balanced', 'relaxation', 'creativity', 'mood-boost', 'focus'];
  
  switch (strainType) {
    case 'indica':
      return indicaEffects.slice(0, Math.floor(Math.random() * 3) + 2);
    case 'sativa':
      return sativaEffects.slice(0, Math.floor(Math.random() * 3) + 2);
    case 'hybrid':
      return hybridEffects.slice(0, Math.floor(Math.random() * 3) + 2);
    default:
      return ['relaxation', 'mood-boost'];
  }
};

const generateFlavors = () => {
  const allFlavors = ['earthy', 'sweet', 'citrus', 'pine', 'diesel', 'fruity', 'spicy', 'floral', 'woody', 'berry'];
  const numFlavors = Math.floor(Math.random() * 3) + 2;
  return allFlavors.sort(() => 0.5 - Math.random()).slice(0, numFlavors);
};

const generatePricing = (thcaPercentage) => {
  const basePrice = thcaPercentage > 30 ? 15 : thcaPercentage > 25 ? 12 : 10;
  return {
    gram: basePrice,
    eighth: Math.round(basePrice * 3.2),
    quarter: Math.round(basePrice * 6),
    half: Math.round(basePrice * 11),
    ounce: Math.round(basePrice * 20)
  };
};

const createDatabaseTables = async () => {
  console.log('Creating database tables...');
  
  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      sample_id VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) DEFAULT 'flower',
      strain_type VARCHAR(50) NOT NULL,
      thca_percentage DECIMAL(5,2) NOT NULL,
      batch_id VARCHAR(100) NOT NULL,
      volume_available INTEGER DEFAULT 0,
      description TEXT,
      effects JSONB DEFAULT '[]',
      flavors JSONB DEFAULT '[]',
      prices JSONB NOT NULL,
      images JSONB DEFAULT '[]',
      featured BOOLEAN DEFAULT false,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createInventoryLogsTable = `
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      change_amount INTEGER NOT NULL,
      reason VARCHAR(255),
      previous_count INTEGER NOT NULL,
      new_count INTEGER NOT NULL,
      user_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createInventoryAlertsTable = `
    CREATE TABLE IF NOT EXISTS inventory_alerts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      alert_type VARCHAR(50) NOT NULL,
      threshold INTEGER,
      current_value INTEGER,
      resolved BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    await sql(createProductsTable);
    await sql(createInventoryLogsTable);
    await sql(createInventoryAlertsTable);
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

const importStrains = async () => {
  try {
    console.log('🚀 Starting strain import process...');
    
    await createDatabaseTables();
    
    const strainsPath = path.join(__dirname, '../src/data/strains.json');
    const strainsData = JSON.parse(fs.readFileSync(strainsPath, 'utf8'));
    
    console.log(`📦 Found ${strainsData.length} strains to import`);
    
    const strainTypes = ['indica', 'sativa', 'hybrid'];
    const typeDistribution = { indica: 24, sativa: 18, hybrid: 39 };
    let typeCounters = { indica: 0, sativa: 0, hybrid: 0 };
    
    const products = [];
    
    for (let i = 0; i < 81; i++) {
      const sourceStrain = strainsData[i % strainsData.length];
      
      let strainType;
      if (typeCounters.indica < typeDistribution.indica) {
        strainType = 'indica';
        typeCounters.indica++;
      } else if (typeCounters.sativa < typeDistribution.sativa) {
        strainType = 'sativa';
        typeCounters.sativa++;
      } else {
        strainType = 'hybrid';
        typeCounters.hybrid++;
      }
      
      const name = `${sourceStrain.strain_name} ${i > 14 ? `#${i - 14}` : ''}`.trim();
      const thcaPercentage = parseFloat(sourceStrain.thca_potency) + (Math.random() * 4 - 2);
      
      const product = {
        sample_id: generateSampleId(i + 1),
        name,
        slug: generateSlug(name),
        category: 'flower',
        strain_type: strainType,
        thca_percentage: Math.max(15, Math.min(35, thcaPercentage)),
        batch_id: generateBatchId(),
        volume_available: Math.floor(Math.random() * 100) + 20,
        description: sourceStrain.description || `${name} is a premium ${strainType} strain with exceptional quality and potency.`,
        effects: generateEffects(strainType),
        flavors: generateFlavors(),
        prices: generatePricing(thcaPercentage),
        images: [],
        featured: Math.random() < 0.1,
        status: 'active'
      };
      
      products.push(product);
    }
    
    console.log('💾 Inserting products into database...');
    
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      try {
        const values = batch.map(product => 
          `('${product.sample_id}', '${product.name}', '${product.slug}', '${product.category}', '${product.strain_type}', ${product.thca_percentage}, '${product.batch_id}', ${product.volume_available}, '${product.description}', '${JSON.stringify(product.effects)}', '${JSON.stringify(product.flavors)}', '${JSON.stringify(product.prices)}', '${JSON.stringify(product.images)}', ${product.featured}, '${product.status}')`
        ).join(', ');
        
        await sql(`
          INSERT INTO products (sample_id, name, slug, category, strain_type, thca_percentage, batch_id, volume_available, description, effects, flavors, prices, images, featured, status)
          VALUES ${values}
        `);
        
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
      } catch (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
    }
    
    console.log(`🎉 Successfully imported ${products.length} strains!`);
    console.log(`📊 Distribution: Indica: ${typeCounters.indica}, Sativa: ${typeCounters.sativa}, Hybrid: ${typeCounters.hybrid}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
};

importStrains();
