// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import { ApiError } from './errorHandler.js';
import UserModel from '../models/UserModel.js';

const authenticateToken = (req, res, next) => {
  try {
    // 헤더에서 토큰 추출
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new ApiError('Access token is required', 401);
    }

    // 토큰 검증
    jwt.verify(token, jwtConfig.access.secret, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw new ApiError('Access token expired', 401);
        }
        throw new ApiError('Invalid access token', 403);
      }

      // 사용자 정보 확인
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new ApiError('User not found', 401);
      }

      // 사용자 정보를 요청 객체에 추가
      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    // 먼저 일반 토큰 인증 수행
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 관리자 권한 확인 (예: 사용자의 역할 확인)
    // 실제 구현에서는 사용자 역할을 데이터베이스에서 확인해야 합니다
    // 여기서는 간단히 특정 이메일을 가진 사용자를 관리자로 간주
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@example.com'];
    if (!adminEmails.includes(req.user.email)) {
      throw new ApiError('Insufficient permissions', 403);
    }

    // 관리자 권한이 있는 경우 다음 미들웨어로 진행
    next();
  } catch (error) {
    next(error);
  }
};

export { authenticateToken, authenticateAdmin };