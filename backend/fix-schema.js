const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'luct_reporting',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
});

async function fixSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Add missing columns if they don't exist
    await pool.query(`
      DO $$ 
      BEGIN 
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS topic_taught TEXT NOT NULL DEFAULT 'Topic not specified';
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS learning_outcomes TEXT NOT NULL DEFAULT 'Outcomes not specified';
      EXCEPTION
        WHEN duplicate_column THEN 
          NULL;
      END $$;
    `);
    
    console.log('✅ Schema updated successfully');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
  } finally {
    await pool.end();
  }
}

fixSchema();