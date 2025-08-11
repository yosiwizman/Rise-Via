#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.DATABASE_URL);

async function migrateProducts() {
  try {
    console.log('Starting product migration to Neon...');

    const productsPath = path.join(__dirname, '../src/data/products.json');
    
    if (!fs.existsSync(productsPath)) {
      console.log('No products.json file found, skipping product migration');
      return;
    }

    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    console.log(`Found ${productsData.length} products to migrate`);

    for (const product of productsData) {
      try {
        await sql`
          INSERT INTO products (id, name, description, price, images, category, in_stock)
          VALUES (
            ${product.id || crypto.randomUUID()},
            ${product.name},
            ${product.description || ''},
            ${product.price},
            ${JSON.stringify(product.images || [])},
            ${product.category || 'general'},
            ${product.in_stock !== false}
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            images = EXCLUDED.images,
            category = EXCLUDED.category,
            in_stock = EXCLUDED.in_stock,
            updated_at = NOW()
        `;
        
        console.log(`Migrated product: ${product.name}`);
      } catch (error) {
        console.error(`Error migrating product ${product.name}:`, error.message);
      }
    }

    console.log('Product migration completed successfully!');
  } catch (error) {
    console.error('Error during product migration:', error);
    process.exit(1);
  }
}

async function verifyMigration() {
  try {
    console.log('\nVerifying migration...');

    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    console.log(`Total products in database: ${productCount[0].count}`);

    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Available tables:');
    tableExists.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    console.log('\nMigration verification completed!');
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

async function createSchema() {
  try {
    console.log('Creating database schema...');

    const schemaPath = path.join(__dirname, '../database/complete-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql.unsafe(statement.trim());
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error(`Error executing statement: ${error.message}`);
          }
        }
      }
    }

    console.log('Schema creation completed!');
  } catch (error) {
    console.error('Error creating schema:', error);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  await createSchema();
  await migrateProducts();
  await verifyMigration();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateProducts, verifyMigration, createSchema };
