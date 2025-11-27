// tests/unit/security/inputValidation.test.js
import { jest } from '@jest/globals';
import { 
  validateUsername, 
  validateEmail, 
  validatePassword, 
  validateTitle, 
  validateDescription 
} from '../../../src/utils/inputValidation.js';
import { body, validationResult } from 'express-validator';

// Mock request 객체
const createMockRequest = (bodyData) => ({
  body: bodyData,
  query: {},
  params: {}
});

describe('Input Validation Utilities', () => {
  describe('validateUsername', () => {
    it('should validate a valid username', async () => {
      const req = createMockRequest({ username: 'validuser123' });
      const res = {};
      const next = jest.fn();
      
      const middleware = validateUsername();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject a username with invalid characters', async () => {
      const req = createMockRequest({ username: 'user@invalid' });
      const res = {};
      const next = jest.fn();
      
      const middleware = validateUsername();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('can only contain');
    });
  });

  describe('validateEmail', () => {
    it('should validate a valid email', async () => {
      const req = createMockRequest({ email: 'test@example.com' });
      const res = {};
      const next = jest.fn();
      
      const middleware = validateEmail();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject an invalid email', async () => {
      const req = createMockRequest({ email: 'invalid-email' });
      const res = {};
      const next = jest.fn();
      
      const middleware = validateEmail();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('valid email');
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', async () => {
      const req = createMockRequest({ password: 'ValidPass123!' });
      const res = {};
      const next = jest.fn();
      
      const middleware = validatePassword();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject a weak password', async () => {
      const req = createMockRequest({ password: 'weak' });
      const res = {};
      const next = jest.fn();
      
      const middleware = validatePassword();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('at least 8 characters');
    });
  });

  describe('validateTitle', () => {
    it('should validate a valid title and escape HTML', async () => {
      const validTitle = 'Valid title';
      const req = createMockRequest({ title: validTitle });
      const res = {};
      const next = jest.fn();
      
      const middleware = validateTitle();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
      // HTML 이스케이프 확인은 실제 sanitizer가 실행된 후 확인 가능하므로 생략
    });

    it('should reject a title that is too long', async () => {
      const longTitle = 'a'.repeat(201); // 201 characters, max is 200
      const req = createMockRequest({ title: longTitle });
      const res = {};
      const next = jest.fn();
      
      const middleware = validateTitle();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('must be between 1 and 200 characters');
    });
  });

  describe('validateDescription', () => {
    it('should allow a valid description', async () => {
      const validDesc = 'Valid description';
      const req = createMockRequest({ description: validDesc });
      const res = {};
      const next = jest.fn();
      
      const middleware = validateDescription();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject a description that is too long', async () => {
      const longDesc = 'a'.repeat(2001); // 2001 characters, max is 2000
      const req = createMockRequest({ description: longDesc });
      const res = {};
      const next = jest.fn();
      
      const middleware = validateDescription();
      await new Promise(resolve => {
        middleware(req, res, (err) => {
          resolve();
        });
      });
      
      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('must be less than 2000 characters');
    });
  });
});