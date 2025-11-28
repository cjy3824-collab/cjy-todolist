// src/routes/holidayRoutes.js
import express from 'express';
import { authenticateToken, authenticateAdmin } from '../middlewares/authMiddleware.js';
import HolidayController from '../controllers/HolidayController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Holidays
 *   description: 공휴일 관련 API
 */

/**
 * @swagger
 * /api/holidays:
 *   get:
 *     summary: 공휴일 목록 조회
 *     description: 등록된 공휴일 목록을 조회합니다 (인증 불필요)
 *     tags: [Holidays]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2025
 *         description: 조회할 연도 (선택사항)
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 1
 *         description: 조회할 월 (선택사항)
 *     responses:
 *       200:
 *         description: 공휴일 목록 조회 성공
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
 *                         example: 신정
 *                       dueDate:
 *                         type: string
 *                         format: date
 *                         example: 2025-01-01
 *                       isPublicHoliday:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: 서버 오류
 */
// 공휴일 목록 조회 (모든 사용자 접근 가능)
router.get('/', HolidayController.getPublicHolidays);

/**
 * @swagger
 * /api/holidays:
 *   post:
 *     summary: 공휴일 추가 (관리자 전용)
 *     description: 새로운 공휴일을 등록합니다
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: 임시 공휴일
 *               description:
 *                 type: string
 *                 example: 특별 공휴일입니다
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-25
 *     responses:
 *       201:
 *         description: 공휴일 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     todoId:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     isPublicHoliday:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 권한 없음 (관리자만 가능)
 *       500:
 *         description: 서버 오류
 */
// 공휴일 추가 (관리자 전용)
router.post('/', authenticateToken, authenticateAdmin, HolidayController.addPublicHoliday);

export default router;