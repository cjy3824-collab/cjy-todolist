import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkUsers() {
  try {
    await client.connect();
    console.log('데이터베이스 연결 성공');

    // users 테이블의 모든 사용자 조회
    const result = await client.query('SELECT userid, username, email, password FROM users');
    
    console.log('등록된 사용자 목록:');
    result.rows.forEach(row => {
      console.log(`- ID: ${row.userid}, Username: ${row.username}, Email: ${row.email}, Password hash: ${row.password.substring(0, 20)}...`);
    });

    await client.end();
  } catch (err) {
    console.error('오류 발생:', err);
    if (client) {
      await client.end();
    }
  }
}

checkUsers();