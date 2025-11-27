// tests/unit/models/TodoModel.test.js
import { jest } from '@jest/globals';
import TodoModel from '../../../src/models/TodoModel.js';

// Mock the database module
jest.mock('../../../src/models/db.js');

// Import the mocked db instance
import db from '../../../src/models/db.js';

beforeEach(() => {
  // Setup mock implementation for db.query
  db.query = jest.fn();
});

describe('TodoModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find todo by id', async () => {
      const mockTodo = {
        todoId: '123',
        userId: '456',
        title: 'Test Todo',
        description: 'Test Description',
        isCompleted: false,
        isPublicHoliday: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      db.query.mockResolvedValue({ rows: [mockTodo] });

      const result = await TodoModel.findById('123');
      
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM todos WHERE todoId = $1',
        ['123']
      );
      expect(result).toEqual(mockTodo);
    });

    it('should find todo by id for specific user', async () => {
      const mockTodo = {
        todoId: '123',
        userId: '456',
        title: 'Test Todo',
        description: 'Test Description',
        isCompleted: false,
        isPublicHoliday: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      db.query.mockResolvedValue({ rows: [mockTodo] });

      const result = await TodoModel.findById('123', '456');
      
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM todos WHERE todoId = $1 AND (userId = $2 OR isPublicHoliday = true)',
        ['123', '456']
      );
      expect(result).toEqual(mockTodo);
    });

    it('should return null if todo not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await TodoModel.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find todos by user id', async () => {
      const mockTodos = [
        {
          todoId: '123',
          userId: '456',
          title: 'Test Todo 1',
          isCompleted: false,
          isPublicHoliday: false,
          isDeleted: false,
        },
        {
          todoId: '789',
          userId: '456',
          title: 'Test Todo 2',
          isCompleted: false,
          isPublicHoliday: false,
          isDeleted: false,
        }
      ];
      
      db.query.mockResolvedValue({ rows: mockTodos });

      const result = await TodoModel.findByUserId('456');
      
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM todos WHERE userId = $1 AND isPublicHoliday = false AND isDeleted = false ORDER BY createdAt DESC',
        ['456']
      );
      expect(result).toEqual(mockTodos);
    });

    it('should find todos by user id including deleted', async () => {
      const mockTodos = [
        {
          todoId: '123',
          userId: '456',
          title: 'Test Todo 1',
          isCompleted: false,
          isPublicHoliday: false,
          isDeleted: false,
        },
        {
          todoId: '789',
          userId: '456',
          title: 'Test Todo 2',
          isCompleted: false,
          isPublicHoliday: false,
          isDeleted: true,
        }
      ];
      
      db.query.mockResolvedValue({ rows: mockTodos });

      const result = await TodoModel.findByUserId('456', true);
      
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM todos WHERE userId = $1 AND isPublicHoliday = false ORDER BY createdAt DESC',
        ['456']
      );
      expect(result).toEqual(mockTodos);
    });
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const todoData = {
        userId: '456',
        title: 'New Todo',
        description: 'New Description',
        startDate: '2025-01-01',
        dueDate: '2025-01-31',
      };

      const expectedTodo = {
        todoId: '789',
        userId: '456',
        title: 'New Todo',
        description: 'New Description',
        startDate: '2025-01-01',
        dueDate: '2025-01-31',
        isCompleted: false,
        isPublicHoliday: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.query.mockResolvedValue({ rows: [expectedTodo] });

      const result = await TodoModel.create(todoData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO todos'),
        expect.arrayContaining([
          todoData.userId, 
          todoData.title, 
          todoData.description, 
          todoData.startDate, 
          todoData.dueDate
        ])
      );
      expect(result).toEqual(expectedTodo);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const todoId = '123';
      const userId = '456';
      const todoData = {
        title: 'Updated Todo',
        description: 'Updated Description',
        startDate: '2025-01-01',
        dueDate: '2025-01-31',
      };

      const expectedTodo = {
        todoId: '123',
        userId: '456',
        title: 'Updated Todo',
        description: 'Updated Description',
        startDate: '2025-01-01',
        dueDate: '2025-01-31',
        isCompleted: false,
        isPublicHoliday: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the check query to confirm the todo exists and is not completed
      db.query.mockResolvedValueOnce({ rows: [{ isCompleted: false }] });
      // Mock the update query
      db.query.mockResolvedValueOnce({ rows: [expectedTodo] });

      const result = await TodoModel.update(todoId, userId, todoData);

      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'SELECT isCompleted FROM todos WHERE todoId = $1 AND userId = $2',
        [todoId, userId]
      );
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE todos SET title = $3, description = $4'),
        [todoId, userId, todoData.title, todoData.description, todoData.startDate, todoData.dueDate]
      );
      expect(result).toEqual(expectedTodo);
    });

    it('should throw error if trying to update completed todo', async () => {
      const todoId = '123';
      const userId = '456';
      const todoData = {
        title: 'Updated Todo',
        description: 'Updated Description',
        startDate: '2025-01-01',
        dueDate: '2025-01-31',
      };

      // Mock the check query to return completed todo
      db.query.mockResolvedValueOnce({ rows: [{ isCompleted: true }] });

      await expect(TodoModel.update(todoId, userId, todoData)).rejects.toThrow('Cannot update completed todo');
    });

    it('should throw error if todo not found', async () => {
      const todoId = '123';
      const userId = '456';
      const todoData = {
        title: 'Updated Todo',
        description: 'Updated Description',
        startDate: '2025-01-01',
        dueDate: '2025-01-31',
      };

      // Mock the check query to return no results
      db.query.mockResolvedValueOnce({ rows: [] });

      await expect(TodoModel.update(todoId, userId, todoData)).rejects.toThrow('Todo not found or does not belong to user');
    });
  });

  describe('softDelete', () => {
    it('should soft delete a todo', async () => {
      const todoId = '123';
      const userId = '456';

      const expectedTodo = {
        todoId: '123',
        userId: '456',
        title: 'Test Todo',
        isCompleted: false,
        isDeleted: true,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the check query to confirm the todo exists and is not completed
      db.query.mockResolvedValueOnce({ rows: [{ isCompleted: false }] });
      // Mock the delete query
      db.query.mockResolvedValueOnce({ rows: [expectedTodo] });

      const result = await TodoModel.softDelete(todoId, userId);

      expect(db.query).toHaveBeenNthCalledWith(
        1,
        'SELECT isCompleted FROM todos WHERE todoId = $1 AND userId = $2 AND isDeleted = false',
        [todoId, userId]
      );
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('UPDATE todos SET isDeleted = true'),
        [todoId, userId]
      );
      expect(result).toEqual(expectedTodo);
    });

    it('should throw error if trying to delete completed todo', async () => {
      const todoId = '123';
      const userId = '456';

      // Mock the check query to return completed todo
      db.query.mockResolvedValueOnce({ rows: [{ isCompleted: true }] });

      await expect(TodoModel.softDelete(todoId, userId)).rejects.toThrow('Cannot delete completed todo');
    });
  });
});