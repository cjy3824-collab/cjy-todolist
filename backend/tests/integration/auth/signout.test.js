// tests/integration/auth/signout.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import RefreshTokenModel from '../../../src/models/RefreshTokenModel.js';
import { authenticateToken } from '../../../src/middlewares/authMiddleware.js';

// 모킹
jest.mock('../../../src/models/RefreshTokenModel.js');
jest.mock('../../../src/middlewares/authMiddleware.js');

describe('POST /api/auth/signout', () => {
  const validSignOutData = {
    refreshToken: 'valid-refresh-token'
  };

  const mockUser = {
    userId: '123',
    username: 'testuser',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign out the user and invalidate refresh token', async () => {
    // 모킹 설정 - 인증 미들웨어 통과
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = mockUser;
      next();
    });
    RefreshTokenModel.deleteByToken.mockResolvedValue(validSignOutData.refreshToken);

    const response = await request(app)
      .post('/api/auth/signout')
      .send(validSignOutData)
      .set('Authorization', 'Bearer access-token') // 인증 토큰
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Successfully signed out');
    expect(RefreshTokenModel.deleteByToken).toHaveBeenCalledWith(validSignOutData.refreshToken);
  });

  it('should return 401 if user is not authenticated', async () => {
    // 모킹 설정 - 인증 실패
    authenticateToken.mockImplementation((req, res, next) => {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      next(error);
    });

    const response = await request(app)
      .post('/api/auth/signout')
      .send(validSignOutData)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Authentication required');
  });
});