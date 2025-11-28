// src/middlewares/corsConfig.js
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// CORS 옵션 설정
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // 프론트엔드 기본 URL
  credentials: true, // 인증 정보 허용
  optionsSuccessStatus: 200, // preflight 요청에 대한 응답 상태 코드
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Total-Count',
    'X-Page',
    'X-Limit',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit', 'Authorization'],
};

// 개발 환경에서는 모든 도메인 허용 (안전하지 않음 - 실제 배포 시 수정 필요)
if (process.env.NODE_ENV === 'development') {
  corsOptions.origin = '*';
}

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
