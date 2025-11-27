// src/models/UserModel.js
import db from './db.js';
import BaseModel from './BaseModel.js';
import { hashPassword } from '../utils/passwordUtils.js';

class UserModel extends BaseModel {
  constructor() {
    super('users', 'userId');
  }

  async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await db.query(query, [username]);
    return rows[0] || null;
  }

  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const query = 'SELECT * FROM users WHERE userId = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async create(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await hashPassword(password);
    
    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING userId, username, email, createdAt, updatedAt
    `;
    const { rows } = await db.query(query, [username, email, hashedPassword]);
    return rows[0];
  }

  async update(id, userData) {
    const { email, password } = userData;
    let query, params;

    if (password) {
      const hashedPassword = await hashPassword(password);
      query = `
        UPDATE users
        SET email = $1, password = $2, updatedAt = NOW()
        WHERE userId = $3
        RETURNING userId, username, email, createdAt, updatedAt
      `;
      params = [email, hashedPassword, id];
    } else {
      query = `
        UPDATE users
        SET email = $1, updatedAt = NOW()
        WHERE userId = $2
        RETURNING userId, username, email, createdAt, updatedAt
      `;
      params = [email, id];
    }

    const { rows } = await db.query(query, params);
    return rows[0];
  }
}

export default new UserModel();