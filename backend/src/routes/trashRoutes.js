// src/routes/trashRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import TodoController from '../controllers/TodoController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trash
 *   description: 휴지통 관련 API
 */

// 미들웨어: 인증 필요
router.use(authenticateToken);

/**
 * @swagger
 * /api/trash:
 *   get:
 *     summary: 휴지통 목록 조회
 *     description: 삭제된 할 일 목록을 조회합니다
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 휴지통 목록 조회 성공
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
 *                       deletedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
// 휴지통에 있는 할 일 목록 조회
router.get('/', TodoController.getTrash);

/**
 * @swagger
 * /api/trash/{id}/restore:
 *   post:
 *     summary: 할 일 복원
 *     description: 휴지통에서 할 일을 복원합니다
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 복원할 할 일 ID
 *     responses:
 *       200:
 *         description: 할 일 복원 성공
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
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 할 일을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 휴지통에서 할 일 복원
router.post('/:id/restore', TodoController.restoreTodo);

/**
 * @swagger
 * /api/trash/{id}:
 *   delete:
 *     summary: 할 일 영구 삭제
 *     description: 휴지통에서 할 일을 영구적으로 삭제합니다 (복구 불가능)
 *     tags: [Trash]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 영구 삭제할 할 일 ID
 *     responses:
 *       200:
 *         description: 할 일 영구 삭제 성공
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
 *                     message:
 *                       type: string
 *                       example: 할 일이 영구적으로 삭제되었습니다
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 할 일을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 휴지통에서 할 일 영구 삭제
router.delete('/:id', TodoController.permanentlyDelete);

export default router;