const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.test' });

// 전역 테스트 타임아웃 설정
jest.setTimeout(30000);

// 글로벌 데이터베이스 클라이언트
let globalClient = null;

/**
 * 데이터베이스 연결 생성
 */
async function createDatabaseConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'todolist_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  await client.connect();
  return client;
}

/**
 * 데이터베이스 스키마 초기화
 */
async function initializeSchema(client) {
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // 기존 스키마 제거 (테스트용)
  await client.query('DROP SCHEMA public CASCADE;');
  await client.query('CREATE SCHEMA public;');
  await client.query('GRANT ALL ON SCHEMA public TO public;');

  // 스키마 생성
  await client.query(schema);
}

/**
 * 테스트 데이터 정리
 */
async function cleanupTestData(client) {
  await client.query('DELETE FROM todos WHERE userId IS NOT NULL;');
  await client.query('DELETE FROM users;');
}

// Jest 글로벌 설정
global.createDatabaseConnection = createDatabaseConnection;
global.initializeSchema = initializeSchema;
global.cleanupTestData = cleanupTestData;

// 모든 테스트 시작 전
beforeAll(async () => {
  try {
    globalClient = await createDatabaseConnection();
    await initializeSchema(globalClient);
  } catch (error) {
    console.error('테스트 설정 실패:', error.message);
    throw error;
  }
});

// 모든 테스트 완료 후
afterAll(async () => {
  if (globalClient) {
    await globalClient.end();
  }
});

// 각 테스트 완료 후 데이터 정리
afterEach(async () => {
  if (globalClient) {
    await cleanupTestData(globalClient);
  }
});

global.getGlobalClient = () => globalClient;
