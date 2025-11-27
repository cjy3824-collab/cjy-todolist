// tests/unit/services/HolidayService.test.js
import { jest } from '@jest/globals';
import HolidayService from '../../../src/services/HolidayService.js';
import TodoModel from '../../../src/models/TodoModel.js';

// 모킹
jest.mock('../../../src/models/TodoModel.js', () => ({
  findPublicHolidays: jest.fn(),
  create: jest.fn(),
}));

describe('HolidayService', () => {
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

  describe('getPublicHolidays', () => {
    it('should return public holidays for a given year', async () => {
      const year = '2025';
      TodoModel.findPublicHolidays.mockResolvedValue([mockHoliday]);

      const result = await HolidayService.getPublicHolidays(year);

      expect(TodoModel.findPublicHolidays).toHaveBeenCalledWith(year);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('New Year');
    });

    it('should return all public holidays when year is not specified', async () => {
      TodoModel.findPublicHolidays.mockResolvedValue([mockHoliday]);

      const result = await HolidayService.getPublicHolidays();

      expect(TodoModel.findPublicHolidays).toHaveBeenCalledWith(undefined);
      expect(result.success).toBe(true);
    });
  });

  describe('addPublicHoliday', () => {
    const holidayData = {
      title: 'New Year Holiday',
      dueDate: '2025-01-01',
      description: 'Official new year holiday'
    };

    it('should add a new public holiday', async () => {
      TodoModel.create.mockResolvedValue(mockHoliday);

      const result = await HolidayService.addPublicHoliday(holidayData, 'adminId');

      expect(TodoModel.create).toHaveBeenCalledWith({
        userId: null,
        title: holidayData.title,
        dueDate: holidayData.dueDate,
        description: holidayData.description,
        isPublicHoliday: true
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Public holiday added successfully');
    });
  });
});