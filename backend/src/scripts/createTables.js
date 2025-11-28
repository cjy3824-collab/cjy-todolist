import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 파일의 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 로드
dotenv.config();

// 스키마 파일 경로 (절대 경로 사용)
const schemaPath = 'C:/test/cjy-todolist/database/schema.sql';

async function createTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Database connected successfully');

    // 스키마 파일 읽기
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // 쿼리 실행
    await client.query(schema);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

createTables();