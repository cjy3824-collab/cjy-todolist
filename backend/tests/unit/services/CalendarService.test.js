// tests/unit/services/CalendarService.test.js
import { jest } from '@jest/globals';
import CalendarService from '../../../src/services/CalendarService.js';
import TodoModel from '../../../src/models/TodoModel.js';

// 모킹
jest.mock('../../../src/models/TodoModel.js', () => ({
  findByUserId: jest.fn(),
  findPublicHolidays: jest.fn(),
}));

describe('CalendarService', () => {
  const mockUserId = '123';
  const mockTodo = {
    todoId: '456',
    userId: mockUserId,
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCalendarData', () => {
    it('should return calendar data with user todos and public holidays', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      // 모킹 설정
      TodoModel.findByUserId.mockResolvedValue([mockTodo]);
      TodoModel.findPublicHolidays.mockResolvedValue([mockHoliday]);

      const result = await CalendarService.getCalendarData(mockUserId, startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2); // 두 날짜에 각각 항목이 있음
      
      // 결과 검증
      const dateKeys = result.data.map(item => item.date);
      expect(dateKeys).toContain('2025-01-15'); // 사용자 할 일 날짜
      expect(dateKeys).toContain('2025-01-01'); // 공휴일 날짜
      
      const userTodoDate = result.data.find(item => item.date === '2025-01-15');
      expect(userTodoDate.todos).toHaveLength(1);
      expect(userTodoDate.todos[0].title).toBe('Test Todo');
      
      const holidayDate = result.data.find(item => item.date === '2025-01-01');
      expect(holidayDate.holidays).toHaveLength(1);
      expect(holidayDate.holidays[0].title).toBe('New Year');
    });

    it('should return empty calendar data when no todos or holidays exist', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      // 모킹 설정 - 빈 배열 반환
      TodoModel.findByUserId.mockResolvedValue([]);
      TodoModel.findPublicHolidays.mockResolvedValue([]);

      const result = await CalendarService.getCalendarData(mockUserId, startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});