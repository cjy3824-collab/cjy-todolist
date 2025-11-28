// src/routes/todoRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import TodoController from '../controllers/TodoController.js';
import {
  createTodoValidationRules,
  updateTodoValidationRules,
  getTodosValidationRules,
  toggleCompleteValidationRules,
  validate
} from '../validators/todoValidator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: 할 일 관리 API (인증 필요)
 */

// 미들웨어: 인증 필요
router.use(authenticateToken);

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: 할 일 목록 조회
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 조회할 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, all]
 *         description: 할 일 상태
 *     responses:
 *       200:
 *         description: 할 일 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getTodosValidationRules, validate, TodoController.getTodos);

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: 특정 할 일 조회
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 할 일 ID (UUID)
 *         example: 5db72fa5-ae4b-439e-9e18-d7d382fbbee8
 *     responses:
 *       200:
 *         description: 할 일 조회 성공
 *       404:
 *         description: 할 일을 찾을 수 없음
 */
router.get('/:id', TodoController.getTodoById);

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: 할 일 생성
 *     tags: [Todos]
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: 프로젝트 마감일 확인
 *               description:
 *                 type: string
 *                 example: 상세 내용
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *     responses:
 *       201:
 *         description: 할 일 생성 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/', createTodoValidationRules, validate, TodoController.createTodo);

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: 할 일 수정
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 할 일 ID (UUID)
 *         example: 5db72fa5-ae4b-439e-9e18-d7d382fbbee8
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: 할 일 수정 성공
 *       404:
 *         description: 할 일을 찾을 수 없음
 */
router.put('/:id', updateTodoValidationRules, validate, TodoController.updateTodo);

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: 할 일 삭제 (소프트 삭제)
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 할 일 ID (UUID)
 *         example: 5db72fa5-ae4b-439e-9e18-d7d382fbbee8
 *     responses:
 *       200:
 *         description: 할 일 삭제 성공
 *       404:
 *         description: 할 일을 찾을 수 없음
 */
router.delete('/:id', TodoController.deleteTodo);

/**
 * @swagger
 * /api/todos/{id}/complete:
 *   patch:
 *     summary: 할 일 완료 상태 토글
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 할 일 ID (UUID)
 *         example: 5db72fa5-ae4b-439e-9e18-d7d382fbbee8
 *     responses:
 *       200:
 *         description: 완료 상태 토글 성공
 *       404:
 *         description: 할 일을 찾을 수 없음
 */
router.patch('/:id/complete', toggleCompleteValidationRules, validate, TodoController.toggleComplete);

export default router;