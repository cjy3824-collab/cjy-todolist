// src/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

// 기본 제한 설정 (일반 API: 100 requests/15분)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 15분당 100회 요청 제한
  message: {
    success: false,
    error: {
      type: 'RateLimitError',
      message: 'Too many requests, please try again later.'
    }
  },
  standardHeaders: true, // `RateLimit-*` 헤더 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 반환 비활성화
  skip: (req, res) => {
    // 관리자 요청은 제한하지 않음
    if (req.user && req.user.email && process.env.ADMIN_EMAILS?.split(',').includes(req.user.email)) {
      return true;
    }
    return false;
  }
});

// 인증 API 제한 설정 (5 requests/15분)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // IP당 15분에 5회로 제한 (기본값 5)
  message: {
    success: false,
    error: {
      type: 'RateLimitError',
      message: 'Too many authentication attempts, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 실패한 인증 시도만 제한
  skipSuccessfulRequests: true,
  skip: (req, res) => {
    // 관리자 요청은 제한하지 않음
    if (req.user && req.user.email && process.env.ADMIN_EMAILS?.split(',').includes(req.user.email)) {
      return true;
    }
    return false;
  }
});

// 휴지통 API 제한 설정 (민감 작업에 대한 추가 보호)
const trashLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: parseInt(process.env.TRASH_RATE_LIMIT_MAX) || 20, // 15분당 20회로 제한 (기본값 20)
  message: {
    success: false,
    error: {
      type: 'RateLimitError',
      message: 'Too many trash operations, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 캘린더 API 제한 설정
const calendarLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: parseInt(process.env.CALENDAR_RATE_LIMIT_MAX) || 50, // 15분당 50회로 제한 (기본값 50)
  message: {
    success: false,
    error: {
      type: 'RateLimitError',
      message: 'Too many calendar requests, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { limiter, authLimiter, trashLimiter, calendarLimiter };