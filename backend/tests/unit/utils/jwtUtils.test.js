// tests/unit/utils/jwtUtils.test.js
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  storeRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllRefreshTokens
} from '../../../src/utils/jwtUtils.js';
import RefreshTokenModel from '../../../src/models/RefreshTokenModel.js';

// JSONWebToken 모킹
jest.mock('jsonwebtoken');

// RefreshTokenModel 모킹
jest.mock('../../../src/models/RefreshTokenModel.js');

// 테스트 전에 모킹된 함수들의 mock implementation 설정
beforeEach(() => {
  // JWT 함수들에 대한 mock implementation
  jwt.sign = jest.fn(() => 'mock-signed-token');
  jwt.verify = jest.fn(() => ({ userId: '123' }));
  jwt.decode = jest.fn(() => ({ exp: Date.now() / 1000 + 3600 })); // 1 hour from now

  // RefreshTokenModel 메서드에 대한 mock implementation
  RefreshTokenModel.create = jest.fn().mockResolvedValue({ token: 'mock-refresh-token' });
  RefreshTokenModel.findByToken = jest.fn().mockResolvedValue({ token: 'mock-refresh-token' });
  RefreshTokenModel.deleteByToken = jest.fn().mockResolvedValue({ token: 'mock-refresh-token' });
  RefreshTokenModel.deleteByUserId = jest.fn().mockResolvedValue([{ userId: '123' }]);
});

describe('JWT Utilities', () => {
  const mockUser = { userId: '123', email: 'test@example.com' };
  const mockToken = 'mocked-jwt-token';
  const mockRefreshToken = 'mocked-refresh-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    test('should generate access token with user info', () => {
      jwt.sign.mockReturnValue(mockToken);

      const token = generateAccessToken(mockUser);

      expect(token).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.userId, email: mockUser.email },
        expect.any(String), // secret
        { expiresIn: expect.any(String) } // expiresIn
      );
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate refresh token', () => {
      jwt.sign.mockReturnValue(mockRefreshToken);
      jwt.decode.mockReturnValue({ exp: Date.now() / 1000 + 3600 }); // 1 hour from now

      const token = generateRefreshToken(mockUser);

      expect(token).toBe(mockRefreshToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.userId },
        expect.any(String), // secret
        { expiresIn: expect.any(String) } // expiresIn
      );
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify access token', () => {
      jwt.verify.mockReturnValue(mockUser);

      const result = verifyAccessToken(mockToken);

      expect(result).toEqual(mockUser);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify refresh token', () => {
      jwt.verify.mockReturnValue(mockUser);

      const result = verifyRefreshToken(mockToken);

      expect(result).toEqual(mockUser);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    });
  });

  describe('storeRefreshToken', () => {
    test('should store refresh token in database', async () => {
      const mockExpiresAt = new Date();
      jwt.decode.mockReturnValue({ exp: mockExpiresAt.getTime() / 1000 });
      RefreshTokenModel.create.mockResolvedValue({ token: mockRefreshToken });

      const result = await storeRefreshToken(mockUser.userId, mockRefreshToken);

      expect(RefreshTokenModel.create).toHaveBeenCalledWith(
        mockUser.userId,
        mockRefreshToken,
        expect.any(Date)
      );
      expect(result).toEqual({ token: mockRefreshToken });
    });
  });

  describe('refreshAccessToken', () => {
    test('should refresh access token', async () => {
      const mockDecoded = { userId: mockUser.userId };
      const newAccessToken = 'new-access-token';
      
      jwt.verify.mockReturnValue(mockDecoded);
      jwt.decode.mockReturnValue({ exp: Date.now() / 1000 + 3600 });
      RefreshTokenModel.findByToken.mockResolvedValue({ token: mockRefreshToken });
      jwt.sign.mockReturnValue(newAccessToken);

      const result = await refreshAccessToken(mockRefreshToken);

      expect(result).toBe(newAccessToken);
      expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, expect.any(String));
      expect(RefreshTokenModel.findByToken).toHaveBeenCalledWith(mockRefreshToken);
    });

    test('should throw error if refresh token not found', async () => {
      jwt.verify.mockReturnValue({ userId: mockUser.userId });
      RefreshTokenModel.findByToken.mockResolvedValue(null);

      await expect(refreshAccessToken(mockRefreshToken)).rejects.toThrow('Refresh token not found');
    });

    test('should throw error for invalid refresh token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(refreshAccessToken(mockRefreshToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('revokeRefreshToken', () => {
    test('should revoke refresh token', async () => {
      RefreshTokenModel.deleteByToken.mockResolvedValue({ token: mockRefreshToken });

      const result = await revokeRefreshToken(mockRefreshToken);

      expect(RefreshTokenModel.deleteByToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(result).toEqual({ token: mockRefreshToken });
    });
  });

  describe('revokeAllRefreshTokens', () => {
    test('should revoke all refresh tokens for user', async () => {
      RefreshTokenModel.deleteByUserId.mockResolvedValue([{ userId: mockUser.userId }]);

      const result = await revokeAllRefreshTokens(mockUser.userId);

      expect(RefreshTokenModel.deleteByUserId).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual([{ userId: mockUser.userId }]);
    });
  });
});