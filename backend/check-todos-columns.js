import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkTodosColumns() {
  try {
    await client.connect();
    console.log('데이터베이스 연결 성공');

    // todos 테이블의 컬럼 정보 조회
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'todos'
      ORDER BY ordinal_position;
    `);
    
    console.log('todos 테이블의 컬럼 정보:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}, nullable: ${row.is_nullable}, default: ${row.column_default}`);
    });

    await client.end();
  } catch (err) {
    console.error('오류 발생:', err);
    if (client) {
      await client.end();
    }
  }
}

checkTodosColumns();