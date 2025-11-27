// tests/integration/auth/signin.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import UserModel from '../../../src/models/UserModel.js';
import { comparePassword } from '../../../src/utils/passwordUtils.js';

// 모킹
jest.mock('../../../src/models/UserModel.js');
jest.mock('../../../src/utils/passwordUtils.js');

// 모킹된 함수들에 대한 mock implementation 설정
beforeEach(() => {
  UserModel.findByEmail = jest.fn();
  UserModel.comparePassword = jest.fn();
  comparePassword = jest.fn();
});

describe('POST /api/auth/signin', () => {
  const validSignInData = {
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

  it('should sign in the user and return token response with valid credentials', async () => {
    // 모킹 설정
    hashPassword.mockResolvedValue('hashedPassword');
    UserModel.findByEmail.mockResolvedValue(mockUser);
    UserModel.comparePassword.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/signin')
      .send(validSignInData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Authentication successful');
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.user).toHaveProperty('userId');
    expect(response.body.data.user.username).toBe(mockUser.username);
    expect(response.body.data.user.email).toBe(mockUser.email);
  });

  it('should return 400 if email is invalid', async () => {
    const invalidSignInData = {
      email: 'invalid-email',
      password: 'TestPass123!'
    };

    const response = await request(app)
      .post('/api/auth/signin')
      .send(invalidSignInData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Validation failed');
  });

  it('should return 400 if password is missing', async () => {
    const invalidSignInData = {
      email: 'test@example.com'
    };

    const response = await request(app)
      .post('/api/auth/signin')
      .send(invalidSignInData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Validation failed');
  });

  it('should return 401 if user not found', async () => {
    // 모킹 설정 - 사용자 찾지 못함
    UserModel.findByEmail.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/signin')
      .send(validSignInData)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Invalid email or password');
  });

  it('should return 401 if password is incorrect', async () => {
    // 모킹 설정 - 비밀번호 불일치
    UserModel.findByEmail.mockResolvedValue(mockUser);
    UserModel.comparePassword.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/signin')
      .send(validSignInData)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Invalid email or password');
  });
});