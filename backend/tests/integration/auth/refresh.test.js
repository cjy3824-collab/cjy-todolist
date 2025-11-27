// tests/integration/auth/refresh.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import RefreshTokenModel from '../../../src/models/RefreshTokenModel.js';
import jwt from 'jsonwebtoken';

// 모킹
jest.mock('../../../src/models/RefreshTokenModel.js');
jest.mock('jsonwebtoken');

// 모킹된 함수들에 대한 mock implementation 설정
beforeEach(() => {
  RefreshTokenModel.findByToken = jest.fn();
  RefreshTokenModel.deleteByToken = jest.fn();
  jwt.sign = jest.fn();
  jwt.verify = jest.fn();
  jwt.decode = jest.fn();
});

describe('POST /api/auth/refresh', () => {
  const validRefreshData = {
    refreshToken: 'valid-refresh-token'
  };

  const mockUser = {
    userId: '123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh access token with valid refresh token', async () => {
    // 모킹 설정
    jwt.verify.mockReturnValue({ userId: mockUser.userId });
    RefreshTokenModel.findByToken.mockResolvedValue(validRefreshData.refreshToken);
    jwt.sign.mockReturnValue('new-access-token');

    const response = await request(app)
      .post('/api/auth/refresh')
      .send(validRefreshData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken', 'new-access-token');
  });

  it('should return 401 if refresh token is missing', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({})
      .expect(400); // validation error

    expect(response.body.success).toBe(false);
  });

  it('should return 401 if refresh token is invalid', async () => {
    // 모킹 설정 - 토큰 검증 실패
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const response = await request(app)
      .post('/api/auth/refresh')
      .send(validRefreshData)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Invalid refresh token');
  });

  it('should return 401 if refresh token does not exist in DB', async () => {
    // 모킹 설정 - DB에 토큰 없음
    jwt.verify.mockReturnValue({ userId: mockUser.userId });
    RefreshTokenModel.findByToken.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/refresh')
      .send(validRefreshData)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Refresh token not found');
  });
});