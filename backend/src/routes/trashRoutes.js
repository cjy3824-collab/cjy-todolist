// src/routes/trashRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import TodoController from '../controllers/TodoController.js';

const router = express.Router();

// 미들웨어: 인증 필요
router.use(authenticateToken);

// 휴지통에 있는 할 일 목록 조회
router.get('/', TodoController.getTrash);

// 휴지통에서 할 일 복원
router.post('/:id/restore', TodoController.restoreTodo);

// 휴지통에서 할 일 영구 삭제
router.delete('/:id', TodoController.permanentlyDelete);

export default router;