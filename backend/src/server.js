// src/server.js
import app from './app.js';
import pool from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// 서버 시작
const server = app.listen(PORT, HOST, async () => {
  console.log(`서버가 ${HOST}:${PORT}에서 실행 중입니다.`);
  
  // 데이터베이스 연결 테스트
  try {
    await pool.query('SELECT NOW()');
    console.log('데이터베이스 연결 성공');
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
  }
});

// 서버 종료 시 처리
process.on('SIGTERM', () => {
  console.log('SIGTERM 수신, 서버 종료 중...');
  server.close(() => {
    console.log('서버 종료됨');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT 수신, 서버 종료 중...');
  server.close(() => {
    console.log('서버 종료됨');
    process.exit(0);
  });
});

// 예외 처리
process.on('uncaughtException', (err) => {
  console.error('예기치 못한 오류 발생:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason, promise);
  process.exit(1);
});

export default server;