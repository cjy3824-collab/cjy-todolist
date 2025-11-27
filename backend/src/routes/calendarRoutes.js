// src/routes/calendarRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import CalendarController from '../controllers/CalendarController.js';

const router = express.Router();

// 미들웨어: 인증 필요
router.use(authenticateToken);

// 캘린더 데이터 조회
router.get('/', CalendarController.getCalendar);

export default router;