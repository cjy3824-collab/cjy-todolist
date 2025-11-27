import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.on('connect', () => {
  console.log('PostgreSQL 연결 성공');
});

pool.on('error', (err) => {
  console.error('PostgreSQL 연결 오류:', err);
  process.exit(-1);
});

// Export pool and helper functions
export default pool;

// Function to execute queries using the pool
export const query = (text, params) => pool.query(text, params);

// Function to test database connection
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};