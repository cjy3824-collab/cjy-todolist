// tests/unit/utils/passwordUtils.test.js
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import { hashPassword, comparePassword, validatePassword, isPasswordSameAsPrevious } from '../../../src/utils/passwordUtils.js';

// bcrypt 모킹
jest.mock('bcrypt');

// 각 테스트 전에 mock 구현을 설정
beforeEach(() => {
  // bcrypt 함수들에 대한 mock 구현
  bcrypt.hash.mockImplementation((password, saltOrRounds) => {
    return `${password}_hashed_with_${saltOrRounds}`;
  });
  bcrypt.compare.mockImplementation((plainPassword, hashedPassword) => {
    return plainPassword === `${hashedPassword}_original`;
  });
});

describe('Password Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 환경 변수 설정
    process.env = { ...originalEnv, BCRYPT_ROUNDS: '10' };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('hashPassword', () => {
    test('should hash password with specified rounds', async () => {
      const plainPassword = 'plainPassword123';
      const hashedPassword = 'hashedPassword';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(plainPassword);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
    });

    test('should use default rounds if env var is not set', async () => {
      delete process.env.BCRYPT_ROUNDS;
      const plainPassword = 'plainPassword123';
      const hashedPassword = 'hashedPassword';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      await hashPassword(plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
    });
  });

  describe('comparePassword', () => {
    test('should return true for matching password', async () => {
      const plainPassword = 'plainPassword123';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    test('should return false for non-matching password', async () => {
      const plainPassword = 'plainPassword123';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should return true for valid password', () => {
      const validPassword = 'ValidPass123!';

      expect(() => validatePassword(validPassword)).not.toThrow();
    });

    test('should throw error for password with less than 8 characters', () => {
      const invalidPassword = 'Short1!';

      expect(() => validatePassword(invalidPassword))
        .toThrow('Password must be at least 8 characters long and include at least one letter, one number, and one special character');
    });

    test('should throw error for password without special character', () => {
      const invalidPassword = 'ValidPass123';

      expect(() => validatePassword(invalidPassword))
        .toThrow('Password must be at least 8 characters long and include at least one letter, one number, and one special character');
    });

    test('should throw error for password without number', () => {
      const invalidPassword = 'ValidPassword!';

      expect(() => validatePassword(invalidPassword))
        .toThrow('Password must be at least 8 characters long and include at least one letter, one number, and one special character');
    });

    test('should throw error for password without letter', () => {
      const invalidPassword = '12345678!';

      expect(() => validatePassword(invalidPassword))
        .toThrow('Password must be at least 8 characters long and include at least one letter, one number, and one special character');
    });
  });

  describe('isPasswordSameAsPrevious', () => {
    test('should return true if password is same as previous', async () => {
      const plainPassword = 'plainPassword123';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockResolvedValue(true);

      const result = await isPasswordSameAsPrevious(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    test('should return false if password is different from previous', async () => {
      const plainPassword = 'plainPassword123';
      const hashedPassword = 'hashedPassword';

      bcrypt.compare.mockResolvedValue(false);

      const result = await isPasswordSameAsPrevious(plainPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });
});