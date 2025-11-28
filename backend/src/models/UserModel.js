// src/models/UserModel.js
import db from './db.js';
import BaseModel from './BaseModel.js';
import { hashPassword, comparePassword } from '../utils/passwordUtils.js';

class UserModel extends BaseModel {
  constructor() {
    super('users', 'userid');
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
    const query = 'SELECT * FROM users WHERE userid = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async create(userData) {
    const { username, email, password } = userData;
    // password는 이미 AuthService에서 해싱되어 전달됨
    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING userid, username, email, createdat, updatedat
    `;
    const { rows } = await db.query(query, [username, email, password]);
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
        WHERE userid = $3
        RETURNING userid, username, email, createdat, updatedat
      `;
      params = [email, hashedPassword, id];
    } else {
      query = `
        UPDATE users
        SET email = $1, updatedAt = NOW()
        WHERE userid = $2
        RETURNING userid, username, email, createdat, updatedat
      `;
      params = [email, id];
    }

    const { rows } = await db.query(query, params);
    return rows[0];
  }

  async comparePassword(password, hashedPassword) {
    return await comparePassword(password, hashedPassword);
  }

  async updatePassword(id, newPassword) {
    const hashedPassword = await hashPassword(newPassword);
    const query = `
      UPDATE users
      SET password = $1, updatedat = NOW()
      WHERE userid = $2
      RETURNING userid
    `;
    const { rows } = await db.query(query, [hashedPassword, id]);
    return rows[0];
  }
}

export default new UserModel();