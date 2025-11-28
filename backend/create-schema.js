import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createSchema() {
  try {
    await client.connect();
    console.log('데이터베이스 연결 성공');

    // schema.sql 파일 읽기
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // 쿼리 실행
    await client.query(schemaSQL);
    console.log('스키마 생성 완료');

    await client.end();
  } catch (err) {
    console.error('오류 발생:', err);
    if (client) {
      await client.end();
    }
  }
}

createSchema();