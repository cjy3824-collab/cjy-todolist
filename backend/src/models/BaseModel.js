// src/models/BaseModel.js
import db from './db.js';

class BaseModel {
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async findAll(whereClause = '', params = []) {
    let query = `SELECT * FROM ${this.tableName}`;
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    const { rows } = await db.query(query, params);
    return rows;
  }

  async create(data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async update(id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    if (columns.length === 0) {
      throw new Error('No fields to update');
    }
    
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.primaryKey} = $${columns.length + 1} RETURNING *`;
    const params = [...values, id];
    
    const { rows } = await db.query(query, params);
    return rows[0];
  }

  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

export default BaseModel;