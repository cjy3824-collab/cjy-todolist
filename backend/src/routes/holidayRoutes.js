// src/routes/holidayRoutes.js
import express from 'express';
import { authenticateToken, authenticateAdmin } from '../middlewares/authMiddleware.js';
import HolidayController from '../controllers/HolidayController.js';

const router = express.Router();

// 공휴일 목록 조회 (모든 사용자 접근 가능)
router.get('/', HolidayController.getPublicHolidays);

// 공휴일 추가 (관리자 전용)
router.post('/', authenticateToken, authenticateAdmin, HolidayController.addPublicHoliday);

export default router;