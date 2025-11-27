// tests/integration/auth/signup.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
// 모킹
jest.mock('../../../src/models/UserModel.js');
jest.mock('../../../src/utils/passwordUtils.js');

// 실제 모델과 유틸리티 함수들을 import
import UserModel from '../../../src/models/UserModel.js';
import { hashPassword, validatePassword } from '../../../src/utils/passwordUtils.js';

// 모킹된 함수들에 대한 mock implementation 설정
beforeEach(() => {
  UserModel.findByUsername = jest.fn();
  UserModel.findByEmail = jest.fn();
  UserModel.create = jest.fn();
  hashPassword.mockResolvedValue('hashedPassword');
  validatePassword.mockImplementation(() => {}); // 예시: 유효성 검사가 통과되도록 설정
});

describe('POST /api/auth/signup', () => {
  const validUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPass123!'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user and return token response with valid data', async () => {
    // 모킹 설정
    hashPassword.mockResolvedValue('hashedPassword');
    UserModel.findByUsername.mockResolvedValue(null); // 사용자명 중복 없음
    UserModel.findByEmail.mockResolvedValue(null); // 이메일 중복 없음
    UserModel.create.mockResolvedValue({
      userId: '123',
      username: validUserData.username,
      email: validUserData.email
    });

    const response = await request(app)
      .post('/api/auth/signup')
      .send(validUserData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Authentication successful');
    expect(response.body.data).toHaveProperty('accessToken');
    expect(response.body.data).toHaveProperty('refreshToken');
    expect(response.body.data.user).toHaveProperty('userId');
    expect(response.body.data.user.username).toBe(validUserData.username);
    expect(response.body.data.user.email).toBe(validUserData.email);
  });

  it('should return 400 if username already exists', async () => {
    // 모킹 설정 - 사용자명 중복
    UserModel.findByUsername.mockResolvedValue({ userId: '123' });

    const response = await request(app)
      .post('/api/auth/signup')
      .send(validUserData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Validation failed');
  });

  it('should return 400 if email already exists', async () => {
    // 모킹 설정 - 이메일 중복 (사용자명 중복은 없음)
    UserModel.findByUsername.mockResolvedValue(null);
    UserModel.findByEmail.mockResolvedValue({ userId: '123' });

    const response = await request(app)
      .post('/api/auth/signup')
      .send(validUserData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Validation failed');
  });

  it('should return 400 if validation fails', async () => {
    const invalidUserData = {
      username: 'ab', // 너무 짧음
      email: 'invalid-email', // 잘못된 이메일 형식
      password: '123' // 너무 약한 비밀번호
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(invalidUserData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe('Validation failed');
  });

  it('should implement rate limiting', async () => {
    // 동일한 IP에서 여러 요청 시도
    const promises = Array(6).fill().map(() => 
      request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'TestPass123!'
        })
    );

    const responses = await Promise.all(promises);
    
    // 6번째 요청은 rate limit로 인해 실패해야 함
    const rateLimitedResponse = responses[5];
    expect(rateLimitedResponse.status).toBe(429);
    expect(rateLimitedResponse.body.error.type).toBe('RateLimitError');
  });
});