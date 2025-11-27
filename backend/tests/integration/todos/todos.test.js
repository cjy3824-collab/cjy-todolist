// tests/integration/todos/todos.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/app.js';

// 모킹
jest.mock('../../../src/models/UserModel.js');
jest.mock('../../../src/models/TodoModel.js');
jest.mock('../../../src/utils/jwtUtils.js');

// 실제 모델과 유틸리티 함수들을 import (mocking 후에 import)
import UserModel from '../../../src/models/UserModel.js';
import TodoModel from '../../../src/models/TodoModel.js';
import { generateAccessToken, verifyAccessToken } from '../../../src/utils/jwtUtils.js';

// 모킹된 함수들에 대한 mock implementation 설정
UserModel.findById = jest.fn();
TodoModel.findById = jest.fn();
TodoModel.findByUserId = jest.fn();
TodoModel.create = jest.fn();
TodoModel.update = jest.fn();
TodoModel.softDelete = jest.fn();
verifyAccessToken = jest.fn();
generateAccessToken.mockReturnValue('mock-access-token');

describe('Todo API Endpoints', () => {
  const mockUser = {
    userId: '123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockTodo = {
    todoId: '456',
    userId: '123',
    title: 'Test Todo',
    description: 'Test Description',
    isCompleted: false,
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

  describe('GET /api/todos', () => {
    it('should return todos for authenticated user', async () => {
      TodoModel.findByUserId.mockResolvedValue([mockTodo]);

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].todoId).toBe(mockTodo.todoId);
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a specific todo', async () => {
      TodoModel.findById.mockResolvedValue(mockTodo);

      const response = await request(app)
        .get(`/api/todos/${mockTodo.todoId}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.todoId).toBe(mockTodo.todoId);
    });
  });

  describe('POST /api/todos', () => {
    const newTodoData = {
      title: 'New Todo',
      description: 'New Description',
      dueDate: '2025-12-31'
    };

    it('should create a new todo', async () => {
      TodoModel.create.mockResolvedValue({ ...mockTodo, ...newTodoData });

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send(newTodoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.data.title).toBe(newTodoData.title);
    });

    it('should return 400 for invalid todo data', async () => {
      const invalidData = { title: '' }; // 제목이 빠짐

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
    });
  });

  describe('PUT /api/todos/:id', () => {
    const updateData = {
      title: 'Updated Todo',
      description: 'Updated Description'
    };

    it('should update an existing todo', async () => {
      TodoModel.update.mockResolvedValue({ ...mockTodo, ...updateData });

      const response = await request(app)
        .put(`/api/todos/${mockTodo.todoId}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should soft delete a todo', async () => {
      TodoModel.softDelete.mockResolvedValue(mockTodo);

      const response = await request(app)
        .delete(`/api/todos/${mockTodo.todoId}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo deleted successfully');
    });
  });

  describe('PATCH /api/todos/:id/complete', () => {
    it('should toggle todo completion status', async () => {
      TodoModel.findById.mockResolvedValue(mockTodo);
      TodoModel.update.mockResolvedValue({ ...mockTodo, isCompleted: true });

      const response = await request(app)
        .patch(`/api/todos/${mockTodo.todoId}/complete`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ isCompleted: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo marked as completed successfully');
      expect(response.body.data.isCompleted).toBe(true);
    });

    it('should return 400 for invalid completion status', async () => {
      const response = await request(app)
        .patch(`/api/todos/${mockTodo.todoId}/complete`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ isCompleted: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.type).toBe('ValidationError');
    });
  });
});