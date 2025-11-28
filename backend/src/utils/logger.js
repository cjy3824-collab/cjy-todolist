// src/utils/logger.js
import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Vercel 서버리스 환경 감지
const isVercel = () => {
  return process.env.VERCEL === '1';
};

// 로그 디렉토리 생성 (Vercel이 아닐 때만)
if (!isVercel()) {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 로거 인스턴스 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'todo-api' },
  transports: [
    // 콘솔 로그 (Vercel 환경에서도 사용 가능)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level} [${info.service}]: ${info.message}`
        )
      )
    })
  ]
});

// Vercel이 아닌 환경에서는 파일 로그도 추가
if (!isVercel()) {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));

  // 예외 처리를 위한 핸들러
  logger.exceptions.handle(
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  );

  logger.rejections.handle(
    new winston.transports.File({ filename: 'logs/rejections.log' })
  );
}

export default logger;