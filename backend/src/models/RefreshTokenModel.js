// src/models/RefreshTokenModel.js
import db from './db.js';

class RefreshTokenModel {
  async create(userId, token, expiresAt) {
    const query = `
      INSERT INTO refresh_tokens (userid, token, expiresat)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await db.query(query, [userId, token, expiresAt]);
    return rows[0];
  }

  async findByToken(token) {
    const query = 'SELECT * FROM refresh_tokens WHERE token = $1';
    const { rows } = await db.query(query, [token]);
    return rows[0] || null;
  }

  async deleteByToken(token) {
    const query = 'DELETE FROM refresh_tokens WHERE token = $1 RETURNING *';
    const { rows } = await db.query(query, [token]);
    return rows[0] || null;
  }

  async deleteByUserId(userId) {
    const query = 'DELETE FROM refresh_tokens WHERE userid = $1 RETURNING *';
    const { rows } = await db.query(query, [userId]);
    return rows[0] || null;
  }
}

export default new RefreshTokenModel();