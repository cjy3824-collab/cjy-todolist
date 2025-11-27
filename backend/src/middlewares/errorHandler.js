// src/middlewares/errorHandler.js
import logger from '../utils/logger.js';

// 커스텀 에러 클래스 정의
export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// 전역 에러 핸들러 미들웨어
const errorHandler = (err, req, res, next) => {
  // 에러 로깅
  logger.error('Error occurred', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers ? req.headers['user-agent'] : undefined
    }
  });

  // ApiError 인스턴스인 경우 상태 코드와 메시지를 사용
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        type: err.name,
        message: err.message,
      },
    });
  }

  // 개발 환경에서는 스택 트레이스를 포함
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      success: false,
      error: {
        type: 'InternalServerError',
        message: err.message,
        stack: err.stack,
      },
    });
  }

  // 운영 환경에서는 일반적인 서버 오류 메시지 반환
  return res.status(500).json({
    success: false,
    error: {
      type: 'InternalServerError',
      message: 'An unexpected error occurred',
    },
  });
};

export default errorHandler;