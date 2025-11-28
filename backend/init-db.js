// 데이터베이스 초기화 스크립트
import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function initDatabase() {
  const client = await pool.connect();

  try {
    console.log('데이터베이스 초기화 시작...');

    // schema.sql 파일 읽기
    const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // 스키마 실행
    await client.query(schema);

    console.log('데이터베이스 초기화 완료!');
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
