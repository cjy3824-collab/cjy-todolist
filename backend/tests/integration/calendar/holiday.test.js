// tests/integration/calendar/holiday.test.js
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
  findPublicHolidays: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../../src/utils/jwtUtils.js', () => ({
  verifyAccessToken: jest.fn(),
}));

describe('Holiday API Endpoints', () => {
  const mockUser = {
    userId: '123',
    username: 'testuser',
    email: 'admin@example.com' // 관리자 이메일로 설정
  };

  const mockHoliday = {
    todoId: '789',
    userId: null,
    title: 'New Year Holiday',
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
    
    // 관리자 사용자 정보 설정
    UserModel.findById.mockResolvedValue(mockUser);
  });

  describe('GET /api/holidays', () => {
    it('should return public holidays', async () => {
      TodoModel.findPublicHolidays.mockResolvedValue([mockHoliday]);

      const response = await request(app)
        .get('/api/holidays')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('New Year Holiday');
    });

    it('should return public holidays for a specific year', async () => {
      TodoModel.findPublicHolidays.mockResolvedValue([mockHoliday]);

      const response = await request(app)
        .get('/api/holidays?year=2025')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(TodoModel.findPublicHolidays).toHaveBeenCalledWith('2025');
    });
  });

  describe('POST /api/holidays', () => {
    const newHolidayData = {
      title: 'New Year Holiday',
      dueDate: '2025-01-01',
      description: 'Official new year holiday'
    };

    it('should add a new public holiday for admin user', async () => {
      TodoModel.create.mockResolvedValue(mockHoliday);

      const response = await request(app)
        .post('/api/holidays')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send(newHolidayData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Public holiday added successfully');
      expect(response.body.data.title).toBe('New Year Holiday');
      expect(TodoModel.create).toHaveBeenCalledWith({
        userId: null,
        title: newHolidayData.title,
        dueDate: newHolidayData.dueDate,
        description: newHolidayData.description,
        isPublicHoliday: true
      });
    });

    it('should return 403 for non-admin user', async () => {
      // 일반 사용자로 설정
      UserModel.findById.mockResolvedValue({
        userId: '456',
        username: 'normaluser',
        email: 'user@example.com'
      });

      const response = await request(app)
        .post('/api/holidays')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send(newHolidayData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Insufficient permissions');
    });
  });
});