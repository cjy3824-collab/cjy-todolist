// src/app.js
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import cors from './middlewares/corsConfig.js';
import { limiter } from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import trashRoutes from './routes/trashRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';

const app = express();

// 보안 미들웨어 - 커스터마이징
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.example.com"], // 실제 API 도메인으로 변경 필요
    },
  },
  hsts: {
    maxAge: 31536000, // 1년
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'no-referrer'
  },
  dnsPrefetchControl: {
    allow: false
  },
  frameguard: {
    action: 'deny'
  },
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  },
  ieNoOpen: false, // 일부 브라우저에서는 필요 없음
}));

// CORS 설정
app.use(cors);

// 요청 로그 미들웨어
import requestLogger from './middlewares/requestLogger.js';
app.use(requestLogger);

// Rate limiting
app.use(limiter);

// 요청 본문 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CJY TodoList API Docs',
}));

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/holidays', holidayRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'NotFoundError',
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// 전역 에러 핸들러 (가장 마지막에 등록)
app.use(errorHandler);

export default app;