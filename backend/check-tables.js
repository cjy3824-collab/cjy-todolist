import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkTables() {
  try {
    await client.connect();
    console.log('데이터베이스 연결 성공');

    // 테이블 목록 조회
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('데이터베이스에 존재하는 테이블 목록:');
    result.rows.forEach(row => {
      console.log('- ' + row.table_name);
    });

    // refresh_tokens 테이블 존재 여부 확인
    const refreshTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'refresh_tokens'
      ) AS table_exists;
    `);
    
    console.log(`\nrefresh_tokens 테이블 존재 여부: ${refreshTableResult.rows[0].table_exists}`);

    await client.end();
  } catch (err) {
    console.error('오류 발생:', err);
    if (client) {
      await client.end();
    }
  }
}

checkTables();