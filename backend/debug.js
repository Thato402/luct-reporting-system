const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'luct_reporting',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
});

async function debugReports() {
  try {
    console.log('🔍 Starting debug...');
    
    // 1. Test database connection
    console.log('1. Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // 2. Check if tables exist
    console.log('2. Checking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📊 Tables found:', tables.rows.map(t => t.table_name));
    
    // 3. Check reports table structure
    console.log('3. Checking reports table structure...');
    const reportsStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'reports'
      ORDER BY ordinal_position
    `);
    console.log('📋 Reports table columns:');
    reportsStructure.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 4. Check if there's any data
    console.log('4. Checking data...');
    const reportsCount = await client.query('SELECT COUNT(*) as count FROM reports');
    const usersCount = await client.query('SELECT COUNT(*) as count FROM users');
    
    console.log(`📈 Reports count: ${reportsCount.rows[0].count}`);
    console.log(`👥 Users count: ${usersCount.rows[0].count}`);
    
    // 5. Show sample reports if any exist
    if (parseInt(reportsCount.rows[0].count) > 0) {
      console.log('5. Sample reports:');
      const sampleReports = await client.query('SELECT id, faculty_name, class_name, course_name FROM reports LIMIT 3');
      sampleReports.rows.forEach(report => {
        console.log(`   - ID: ${report.id}, Faculty: ${report.faculty_name}, Class: ${report.class_name}, Course: ${report.course_name}`);
      });
    } else {
      console.log('5. No reports found in database');
    }
    
    // 6. Test the actual query from our API
    console.log('6. Testing API query...');
    const testQuery = `
      SELECT 
        r.*, 
        u.name as sender_name, 
        u.role as sender_role,
        u.email as sender_email
      FROM reports r 
      LEFT JOIN users u ON r.created_by = u.id 
      ORDER BY r.created_at DESC 
      LIMIT 5
    `;
    
    try {
      const apiQueryResult = await client.query(testQuery);
      console.log(`✅ API query successful, found ${apiQueryResult.rows.length} reports`);
    } catch (queryError) {
      console.log('❌ API query failed:', queryError.message);
    }
    
    client.release();
    
  } catch (error) {
    console.log('❌ Debug failed with error:', error.message);
  } finally {
    await pool.end();
  }
}

debugReports();