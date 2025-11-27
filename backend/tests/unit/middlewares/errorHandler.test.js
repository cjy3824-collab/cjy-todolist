// tests/unit/middlewares/errorHandler.test.js
import { jest } from '@jest/globals';
import errorHandler, { ApiError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '../../../src/middlewares/errorHandler.js';

// Mock response 객체
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.setHeader = jest.fn(() => res);
  return res;
};

describe('Error Handler and Error Classes', () => {
  describe('Custom Error Classes', () => {
    test('ApiError should create error with status code', () => {
      const error = new ApiError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    test('ValidationError should extend ApiError with 400 status', () => {
      const error = new ValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    test('AuthenticationError should extend ApiError with 401 status', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    test('AuthenticationError should accept custom message', () => {
      const error = new AuthenticationError('Custom auth error');
      expect(error.message).toBe('Custom auth error');
      expect(error.statusCode).toBe(401);
    });

    test('AuthorizationError should extend ApiError with 403 status', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
    });

    test('NotFoundError should extend ApiError with 404 status', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('errorHandler middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = createMockResponse();
      next = jest.fn();
    });

    test('should handle ApiError correctly', () => {
      const apiError = new ValidationError('Invalid input');

      errorHandler(apiError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'ValidationError',
          message: 'Invalid input',
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle generic errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Generic error');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.success).toBe(false);
      expect(callArgs.error.type).toBe('InternalServerError');
      expect(callArgs.error.message).toBe('Generic error');
      expect(callArgs.error.stack).toBeDefined();

      // 환경 변수 복원
      process.env.NODE_ENV = originalEnv;
    });

    test('should handle generic errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Generic error');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'InternalServerError',
          message: 'An unexpected error occurred',
        },
      });

      // 환경 변수 복원
      process.env.NODE_ENV = originalEnv;
    });
  });
});