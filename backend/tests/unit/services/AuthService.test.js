// tests/unit/services/AuthService.test.js
import { jest } from '@jest/globals';
import AuthService from '../../../src/services/AuthService.js';
import UserModel from '../../../src/models/UserModel.js';
import { hashPassword, validatePassword } from '../../../src/utils/passwordUtils.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken, revokeRefreshToken, refreshAccessToken } from '../../../src/utils/jwtUtils.js';

// 모킹
jest.mock('../../../src/models/UserModel.js');
jest.mock('../../../src/utils/passwordUtils.js');
jest.mock('../../../src/utils/jwtUtils.js');

// 모킹된 함수들에 대한 mock implementation 설정
beforeEach(() => {
  // UserModel 함수들에 대한 mock implementation
  UserModel.findByEmail = jest.fn();
  UserModel.create = jest.fn();
  UserModel.comparePassword = jest.fn();

  // passwordUtils 함수들에 대한 mock implementation
  hashPassword = jest.fn();
  validatePassword = jest.fn();

  // jwtUtils 함수들에 대한 mock implementation
  generateAccessToken = jest.fn();
  generateRefreshToken = jest.fn();
  storeRefreshToken = jest.fn();
  revokeRefreshToken = jest.fn();
  refreshAccessToken = jest.fn();
});

describe('AuthService', () => {
  const mockUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPass123!'
  };
  
  const mockUser = {
    userId: '123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user and return token response', async () => {
      // 모킹 설정
      hashPassword.mockResolvedValue('hashedPassword');
      UserModel.create.mockResolvedValue(mockUser);
      validatePassword.mockReturnValue(true);
      generateAccessToken.mockReturnValue('access-token');
      generateRefreshToken.mockReturnValue('refresh-token');
      storeRefreshToken.mockResolvedValue({});

      // 테스트 실행
      const result = await AuthService.signUp(mockUserData);

      // 검증
      expect(validatePassword).toHaveBeenCalledWith(mockUserData.password);
      expect(hashPassword).toHaveBeenCalledWith(mockUserData.password);
      expect(UserModel.create).toHaveBeenCalledWith({
        username: mockUserData.username,
        email: mockUserData.email,
        password: 'hashedPassword'
      });
      expect(generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUser);
      expect(storeRefreshToken).toHaveBeenCalledWith(mockUser.userId, 'refresh-token');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Authentication successful');
    });

    it('should throw an error if password validation fails', async () => {
      // 모킹 설정
      validatePassword.mockImplementation(() => {
        throw new Error('Password validation failed');
      });

      // 테스트 실행 및 검증
      await expect(AuthService.signUp(mockUserData)).rejects.toThrow('Password validation failed');
      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should sign in the user and return token response', async () => {
      // 모킹 설정
      UserModel.findByEmail.mockResolvedValue(mockUser);
      UserModel.comparePassword.mockResolvedValue(true);
      generateAccessToken.mockReturnValue('access-token');
      generateRefreshToken.mockReturnValue('refresh-token');
      storeRefreshToken.mockResolvedValue({});

      // 테스트 실행
      const result = await AuthService.signIn({
        email: mockUser.email,
        password: mockUserData.password
      });

      // 검증
      expect(UserModel.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(UserModel.comparePassword).toHaveBeenCalledWith(mockUserData.password, mockUser.password);
      expect(generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(generateRefreshToken).toHaveBeenCalledWith(mockUser);
      expect(storeRefreshToken).toHaveBeenCalledWith(mockUser.userId, 'refresh-token');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Authentication successful');
    });

    it('should throw an error if user not found', async () => {
      // 모킹 설정
      UserModel.findByEmail.mockResolvedValue(null);

      // 테스트 실행 및 검증
      await expect(AuthService.signIn({
        email: 'nonexistent@example.com',
        password: mockUserData.password
      })).rejects.toThrow('Invalid email or password');

      expect(UserModel.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw an error if password is invalid', async () => {
      // 모킹 설정
      UserModel.findByEmail.mockResolvedValue(mockUser);
      UserModel.comparePassword.mockResolvedValue(false);

      // 테스트 실행 및 검증
      await expect(AuthService.signIn({
        email: mockUser.email,
        password: 'wrong-password'
      })).rejects.toThrow('Invalid email or password');
    });
  });

  describe('signOut', () => {
    it('should sign out the user and return success response', async () => {
      // 모킹 설정
      const userId = '123';
      const refreshToken = 'refresh-token';
      const revokeRefreshToken = jest.fn().mockResolvedValue({});
      AuthService.revokeRefreshToken = revokeRefreshToken;

      // 테스트 실행
      const result = await AuthService.signOut(userId, refreshToken);

      // 검증
      expect(revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Successfully signed out');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token and return new token', async () => {
      // 모킹 설정
      const refreshToken = 'refresh-token';
      const newAccessToken = 'new-access-token';
      const refreshAccessToken = jest.fn().mockResolvedValue(newAccessToken);
      AuthService.refreshAccessToken = refreshAccessToken;

      // 테스트 실행
      const result = await AuthService.refreshAccessToken(refreshToken);

      // 검증
      expect(refreshAccessToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toHaveProperty('success', true);
      expect(result.data).toHaveProperty('accessToken', newAccessToken);
    });
  });
});