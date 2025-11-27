// tests/unit/services/TodoService.test.js
import { jest } from '@jest/globals';
import TodoService from '../../../src/services/TodoService.js';
import TodoModel from '../../../src/models/TodoModel.js';

// TodoModel 모킹
jest.mock('../../../src/models/TodoModel.js');
import TodoModel from '../../../src/models/TodoModel.js';

// 모킹된 함수들에 대한 mock implementation 설정
beforeEach(() => {
  TodoModel.findById = jest.fn();
  TodoModel.findByUserId = jest.fn();
  TodoModel.create = jest.fn();
  TodoModel.update = jest.fn();
  TodoModel.softDelete = jest.fn();
  TodoModel.findDeletedByUserId = jest.fn();
  TodoModel.restore = jest.fn();
  TodoModel.hardDelete = jest.fn();
});

describe('TodoService', () => {
  const mockUserId = '123';
  const mockTodo = {
    todoId: '456',
    userId: mockUserId,
    title: 'Test Todo',
    description: 'Test Description',
    startDate: '2025-01-01',
    dueDate: '2025-01-31',
    isCompleted: false,
    isPublicHoliday: false,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodosByUserId', () => {
    it('should return todos for a user with filters applied', async () => {
      const mockTodos = [mockTodo, { ...mockTodo, todoId: '457', title: 'Second Todo' }];
      TodoModel.findByUserId.mockResolvedValue(mockTodos);

      const filters = { isCompleted: 'false' };
      const result = await TodoService.getTodosByUserId(mockUserId, filters);

      expect(TodoModel.findByUserId).toHaveBeenCalledWith(mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when no todos found', async () => {
      TodoModel.findByUserId.mockResolvedValue([]);

      const result = await TodoService.getTodosByUserId(mockUserId);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getTodoById', () => {
    it('should return a specific todo by id', async () => {
      TodoModel.findById.mockResolvedValue(mockTodo);

      const result = await TodoService.getTodoById(mockTodo.todoId, mockUserId);

      expect(TodoModel.findById).toHaveBeenCalledWith(mockTodo.todoId, mockUserId);
      expect(result.success).toBe(true);
      expect(result.data.todoId).toBe(mockTodo.todoId);
    });

    it('should throw error when todo not found', async () => {
      TodoModel.findById.mockResolvedValue(null);

      await expect(TodoService.getTodoById('nonexistent', mockUserId))
        .rejects
        .toThrow('Todo not found');
    });
  });

  describe('createTodo', () => {
    it('should create a new todo successfully', async () => {
      const newTodoData = {
        title: 'New Todo',
        description: 'New Description'
      };
      TodoModel.create.mockResolvedValue(mockTodo);

      const result = await TodoService.createTodo(newTodoData, mockUserId);

      expect(TodoModel.create).toHaveBeenCalledWith({
        ...newTodoData,
        userId: mockUserId
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Todo created successfully');
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      const updateData = { title: 'Updated Todo' };
      TodoModel.update.mockResolvedValue({ ...mockTodo, title: 'Updated Todo' });

      const result = await TodoService.updateTodo(mockTodo.todoId, updateData, mockUserId);

      expect(TodoModel.update).toHaveBeenCalledWith(mockTodo.todoId, mockUserId, updateData);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Updated Todo');
    });

    it('should throw error when todo not found', async () => {
      TodoModel.update.mockResolvedValue(null);

      await expect(TodoService.updateTodo(mockTodo.todoId, {}, mockUserId))
        .rejects
        .toThrow('Todo not found or update failed');
    });
  });

  describe('deleteTodo', () => {
    it('should soft delete a todo', async () => {
      TodoModel.softDelete.mockResolvedValue(mockTodo);

      const result = await TodoService.deleteTodo(mockTodo.todoId, mockUserId);

      expect(TodoModel.softDelete).toHaveBeenCalledWith(mockTodo.todoId, mockUserId);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Todo deleted successfully');
    });

    it('should throw error when todo not found', async () => {
      TodoModel.softDelete.mockResolvedValue(null);

      await expect(TodoService.deleteTodo(mockTodo.todoId, mockUserId))
        .rejects
        .toThrow('Todo not found or delete failed');
    });
  });

  describe('toggleComplete', () => {
    it('should mark todo as completed', async () => {
      TodoModel.findById.mockResolvedValue(mockTodo);
      TodoModel.update.mockResolvedValue({ ...mockTodo, isCompleted: true });

      const result = await TodoService.toggleComplete(mockTodo.todoId, mockUserId, true);

      expect(TodoModel.findById).toHaveBeenCalledWith(mockTodo.todoId, mockUserId);
      expect(TodoModel.update).toHaveBeenCalledWith(mockTodo.todoId, mockUserId, { isCompleted: true });
      expect(result.success).toBe(true);
      expect(result.data.isCompleted).toBe(true);
    });

    it('should mark todo as not completed', async () => {
      const completedTodo = { ...mockTodo, isCompleted: true };
      TodoModel.findById.mockResolvedValue(completedTodo);
      TodoModel.update.mockResolvedValue({ ...mockTodo, isCompleted: false });

      const result = await TodoService.toggleComplete(mockTodo.todoId, mockUserId, false);

      expect(TodoModel.findById).toHaveBeenCalledWith(mockTodo.todoId, mockUserId);
      expect(TodoModel.update).toHaveBeenCalledWith(mockTodo.todoId, mockUserId, { isCompleted: false });
      expect(result.success).toBe(true);
      expect(result.data.isCompleted).toBe(false);
    });

    it('should throw error when trying to complete already completed todo', async () => {
      const completedTodo = { ...mockTodo, isCompleted: true };
      TodoModel.findById.mockResolvedValue(completedTodo);

      await expect(TodoService.toggleComplete(mockTodo.todoId, mockUserId, true))
        .rejects
        .toThrow('Cannot update completed todo to completed again');
    });

    it('should throw error when todo not found', async () => {
      TodoModel.findById.mockResolvedValue(null);

      await expect(TodoService.toggleComplete(mockTodo.todoId, mockUserId, true))
        .rejects
        .toThrow('Todo not found');
    });
  });
});