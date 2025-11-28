import { Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

// Function to hash password
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return await bcrypt.hash(password, saltRounds);
};

async function createTestUser() {
  try {
    await client.connect();
    console.log('데이터베이스 연결 성공');

    // Hash the test password
    const hashedPassword = await hashPassword('password123');
    
    // Insert test user
    const result = await client.query(
      `INSERT INTO users (username, email, password) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET
         username = EXCLUDED.username,
         password = EXCLUDED.password
       RETURNING userid, username, email`,
      ['Test User', 'test@example.com', hashedPassword]
    );

    console.log('테스트 사용자 생성 완료:', result.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error('오류 발생:', err);
    if (client) {
      await client.end();
    }
  }
}

createTestUser();