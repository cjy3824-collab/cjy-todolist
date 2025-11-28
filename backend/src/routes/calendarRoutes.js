// src/routes/calendarRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import CalendarController from '../controllers/CalendarController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Calendar
 *   description: 캘린더 관련 API
 */

// 미들웨어: 인증 필요
router.use(authenticateToken);

/**
 * @swagger
 * /api/calendar:
 *   get:
 *     summary: 캘린더 데이터 조회
 *     description: 지정된 기간의 할 일과 공휴일을 함께 조회합니다
 *     tags: [Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-01-01
 *         description: 조회 시작 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-01-31
 *         description: 조회 종료 날짜 (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: 캘린더 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       todoId:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                       isCompleted:
 *                         type: boolean
 *                       isPublicHoliday:
 *                         type: boolean
 *       400:
 *         description: 잘못된 요청 (날짜 형식 오류 등)
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
// 캘린더 데이터 조회
router.get('/', CalendarController.getCalendar);

export default router;