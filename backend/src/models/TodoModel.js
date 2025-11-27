// src/models/TodoModel.js
import db from './db.js';
import BaseModel from './BaseModel.js';

class TodoModel extends BaseModel {
  constructor() {
    super('todos', 'todoId');
  }

  async findById(id, userId = null) {
    let query = 'SELECT * FROM todos WHERE todoId = $1';
    let params = [id];

    // If userId is provided, ensure the todo belongs to the user
    if (userId) {
      query += ' AND (userId = $2 OR isPublicHoliday = true)';
      params = [id, userId];
    }

    const { rows } = await db.query(query, params);
    return rows[0] || null;
  }

  async findByUserId(userId, includeDeleted = false) {
    let query = 'SELECT * FROM todos WHERE userId = $1 AND isPublicHoliday = false';
    if (!includeDeleted) {
      query += ' AND isDeleted = false';
    }
    query += ' ORDER BY createdAt DESC';

    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  async create(todoData) {
    const { userId, title, description, startDate, dueDate } = todoData;
    
    const query = `
      INSERT INTO todos (userId, title, description, startDate, dueDate, isCompleted, isPublicHoliday, isDeleted)
      VALUES ($1, $2, $3, $4, $5, false, false, false)
      RETURNING *
    `;
    const { rows } = await db.query(query, [userId, title, description, startDate, dueDate]);
    return rows[0];
  }

  async update(id, userId, todoData) {
    const { title, description, startDate, dueDate } = todoData;
    
    // First check if todo belongs to user and is not completed
    const checkQuery = 'SELECT isCompleted FROM todos WHERE todoId = $1 AND userId = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (!checkResult.rows[0]) {
      throw new Error('Todo not found or does not belong to user');
    }
    
    if (checkResult.rows[0].isCompleted) {
      throw new Error('Cannot update completed todo');
    }
    
    const query = `
      UPDATE todos
      SET title = $3, description = $4, startDate = $5, dueDate = $6, updatedAt = NOW()
      WHERE todoId = $1 AND userId = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [id, userId, title, description, startDate, dueDate]);
    return rows[0];
  }

  async softDelete(id, userId) {
    // Check if todo belongs to user and is not completed
    const checkQuery = 'SELECT isCompleted FROM todos WHERE todoId = $1 AND userId = $2 AND isDeleted = false';
    const checkResult = await db.query(checkQuery, [id, userId]);
    
    if (!checkResult.rows[0]) {
      throw new Error('Todo not found, does not belong to user, or is already deleted');
    }
    
    if (checkResult.rows[0].isCompleted) {
      throw new Error('Cannot delete completed todo');
    }
    
    const query = `
      UPDATE todos
      SET isDeleted = true, deletedAt = NOW(), updatedAt = NOW()
      WHERE todoId = $1 AND userId = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  }

  async hardDelete(id, userId) {
    const query = 'DELETE FROM todos WHERE todoId = $1 AND userId = $2 RETURNING *';
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  }

  async findDeletedByUserId(userId) {
    const query = `
      SELECT * FROM todos
      WHERE userId = $1 AND isDeleted = true
      ORDER BY deletedAt DESC
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  async restore(id, userId) {
    const query = `
      UPDATE todos
      SET isDeleted = false, deletedAt = NULL, updatedAt = NOW()
      WHERE todoId = $1 AND userId = $2 AND isDeleted = true
      RETURNING *
    `;
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  }

  async findByDateRange(startDate, endDate, userId) {
    const query = `
      SELECT * FROM todos
      WHERE userId = $1
        AND isDeleted = false
        AND (
          (startDate BETWEEN $2 AND $3) OR
          (dueDate BETWEEN $2 AND $3) OR
          (startDate <= $2 AND dueDate >= $3)
        )
      ORDER BY createdAt DESC
    `;
    const { rows } = await db.query(query, [userId, startDate, endDate]);
    return rows;
  }

  async findPublicHolidays(year = null) {
    let query = 'SELECT * FROM todos WHERE isPublicHoliday = true';
    const params = [];
    
    if (year) {
      query += ` AND EXTRACT(YEAR FROM dueDate) = $1`;
      params.push(year);
    }
    
    query += ' ORDER BY dueDate';
    
    const { rows } = await db.query(query, params);
    return rows;
  }
}

export default new TodoModel();