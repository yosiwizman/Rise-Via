import { testConnection, initializeTables } from './lib/database';

async function setupDatabase() {
  console.log('🚀 Starting database setup for Rise-Via...');
  
  // Test connection
  console.log('Testing database connection...');
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.error('❌ Failed to connect to database. Please check your VITE_DATABASE_URL or VITE_NEON_DATABASE_URL environment variable.');
    process.exit(1);
  }
  
  console.log('✅ Database connection successful!');
  
  // Initialize tables
  console.log('Initializing database tables...');
  const tablesCreated = await initializeTables();
  
  if (!tablesCreated) {
    console.error('❌ Failed to create database tables. Please check the error messages above.');
    process.exit(1);
  }
  
  console.log('✅ All database tables created successfully!');
  console.log('🎉 Database setup complete! Your Rise-Via platform is ready.');
}

// Run the setup
setupDatabase().catch(error => {
  console.error('Fatal error during database setup:', error);
  process.exit(1);
});
