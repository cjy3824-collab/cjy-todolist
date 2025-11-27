// tests/integration/calendar/calendar.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';
import UserModel from '../../../src/models/UserModel.js';
import TodoModel from '../../../src/models/TodoModel.js';
import { generateAccessToken } from '../../../src/utils/jwtUtils.js';

// 모킹
jest.mock('../../../src/models/UserModel.js', () => ({
  findById: jest.fn(),
}));

jest.mock('../../../src/models/TodoModel.js', () => ({
  findByUserId: jest.fn(),
  findPublicHolidays: jest.fn(),
}));

jest.mock('../../../src/utils/jwtUtils.js', () => ({
  verifyAccessToken: jest.fn(),
}));

describe('Calendar API Endpoints', () => {
  const mockUser = {
    userId: '123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockTodo = {
    todoId: '456',
    userId: '123',
    title: 'Test Todo',
    dueDate: '2025-01-15',
    isCompleted: false,
    isPublicHoliday: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockHoliday = {
    todoId: '789',
    userId: null,
    title: 'New Year',
    dueDate: '2025-01-01',
    isCompleted: false,
    isPublicHoliday: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockAccessToken = 'mock-access-token';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // JWT 생성 함수 모킹
    generateAccessToken.mockReturnValue(mockAccessToken);
    
    // 인증 미들웨어를 우회하기 위해 사용자 정보를 직접 설정
    UserModel.findById.mockResolvedValue(mockUser);
  });

  describe('GET /api/calendar', () => {
    it('should return calendar data for authenticated user', async () => {
      TodoModel.findByUserId.mockResolvedValue([mockTodo]);
      TodoModel.findPublicHolidays.mockResolvedValue([mockHoliday]);

      const response = await request(app)
        .get('/api/calendar?start=2025-01-01&end=2025-01-31')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // 두 날짜에 각각 항목이 있음
      
      // 결과 검증
      const dateKeys = response.body.data.map(item => item.date);
      expect(dateKeys).toContain('2025-01-15'); // 사용자 할 일 날짜
      expect(dateKeys).toContain('2025-01-01'); // 공휴일 날짜
    });

    it('should return calendar data with default dates when no query params provided', async () => {
      TodoModel.findByUserId.mockResolvedValue([]);
      TodoModel.findPublicHolidays.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/calendar')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});