// tests/integration/todos/trash.test.js
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
  findDeletedByUserId: jest.fn(),
  restore: jest.fn(),
  hardDelete: jest.fn(),
}));

jest.mock('../../../src/utils/jwtUtils.js', () => ({
  verifyAccessToken: jest.fn(),
}));

describe('Trash API Endpoints', () => {
  const mockUser = {
    userId: '123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockDeletedTodo = {
    todoId: '456',
    userId: '123',
    title: 'Deleted Todo',
    description: 'A deleted todo item',
    isCompleted: false,
    isDeleted: true,
    deletedAt: new Date(),
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

  describe('GET /api/trash', () => {
    it('should return deleted todos for authenticated user', async () => {
      TodoModel.findDeletedByUserId.mockResolvedValue([mockDeletedTodo]);

      const response = await request(app)
        .get('/api/trash')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].todoId).toBe(mockDeletedTodo.todoId);
      expect(response.body.data[0].isDeleted).toBe(true);
    });
  });

  describe('POST /api/trash/:id/restore', () => {
    it('should restore a deleted todo', async () => {
      TodoModel.restore.mockResolvedValue({ ...mockDeletedTodo, isDeleted: false });

      const response = await request(app)
        .post(`/api/trash/${mockDeletedTodo.todoId}/restore`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo restored successfully');
      expect(TodoModel.restore).toHaveBeenCalledWith(mockDeletedTodo.todoId, mockUser.userId);
    });

    it('should return 404 if todo to restore is not found', async () => {
      TodoModel.restore.mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/trash/${mockDeletedTodo.todoId}/restore`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/trash/:id', () => {
    it('should permanently delete a todo', async () => {
      TodoModel.hardDelete.mockResolvedValue(mockDeletedTodo);

      const response = await request(app)
        .delete(`/api/trash/${mockDeletedTodo.todoId}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo permanently deleted successfully');
      expect(TodoModel.hardDelete).toHaveBeenCalledWith(mockDeletedTodo.todoId, mockUser.userId);
    });

    it('should return 404 if todo to permanently delete is not found', async () => {
      TodoModel.hardDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/trash/${mockDeletedTodo.todoId}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});