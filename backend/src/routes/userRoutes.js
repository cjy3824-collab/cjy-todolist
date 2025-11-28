// src/routes/userRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import UserController from '../controllers/UserController.js';

const router = express.Router();

// 사용자 인증이 필요한 라우트
router.get('/profile', authenticateToken, UserController.getProfile);
router.put('/profile', authenticateToken, UserController.updateProfile);
router.put('/profile/password', authenticateToken, UserController.changePassword);
router.get('/profile/stats', authenticateToken, UserController.getUserStats);

export default router;