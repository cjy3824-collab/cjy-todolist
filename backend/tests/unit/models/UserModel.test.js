// tests/unit/models/UserModel.test.js
import { jest } from '@jest/globals';
import UserModel from '../../../src/models/UserModel.js';

// Mock the database module
jest.mock('../../../src/models/db.js');
import db from '../../../src/models/db.js';

// Setup mock implementation for db.query
db.query = jest.fn();

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      db.query.mockResolvedValue({ rows: [mockUser] });

      const result = await UserModel.findByUsername('testuser');
      
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = $1',
        ['testuser']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await UserModel.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      db.query.mockResolvedValue({ rows: [mockUser] });

      const result = await UserModel.findByEmail('test@example.com');
      
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await UserModel.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      db.query.mockResolvedValue({ rows: [mockUser] });

      const result = await UserModel.findById('123');
      
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE userId = $1',
        ['123']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await UserModel.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const expectedUser = {
        userId: '456',
        username: 'newuser',
        email: 'new@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.query.mockResolvedValue({ rows: [expectedUser] });

      const result = await UserModel.create(userData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([userData.username, userData.email])
      );
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update user email', async () => {
      const userId = '123';
      const userData = { email: 'updated@example.com' };

      const expectedUser = {
        userId: '123',
        username: 'testuser',
        email: 'updated@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.query.mockResolvedValue({ rows: [expectedUser] });

      const result = await UserModel.update(userId, userData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET email = $1'),
        expect.arrayContaining([userData.email, userId])
      );
      expect(result).toEqual(expectedUser);
    });

    it('should update user email and password', async () => {
      const userId = '123';
      const userData = { 
        email: 'updated@example.com',
        password: 'newpassword123'
      };

      const expectedUser = {
        userId: '123',
        username: 'testuser',
        email: 'updated@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.query.mockResolvedValue({ rows: [expectedUser] });

      const result = await UserModel.update(userId, userData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET email = $1, password = $2'),
        expect.arrayContaining([userData.email, expect.any(String), userId])
      );
      expect(result).toEqual(expectedUser);
    });
  });
});