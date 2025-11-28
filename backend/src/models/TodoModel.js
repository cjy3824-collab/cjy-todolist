// src/models/TodoModel.js
import db from './db.js';
import BaseModel from './BaseModel.js';

class TodoModel extends BaseModel {
  constructor() {
    super('todos', 'todoid');
  }

  async findById(id, userId = null) {
    let query = 'SELECT * FROM todos WHERE todoid = $1';
    let params = [id];

    // If userId is provided, ensure the todo belongs to the user
    if (userId) {
      query += ' AND (userid = $2 OR ispublicholiday = true)';
      params = [id, userId];
    }

    const { rows } = await db.query(query, params);
    return rows[0] || null;
  }

  async findByUserId(userId, includeDeleted = false) {
    let query = 'SELECT * FROM todos WHERE userid = $1 AND ispublicholiday = false';
    if (!includeDeleted) {
      query += ' AND isdeleted = false';
    }
    query += ' ORDER BY createdat DESC';

    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  async create(todoData) {
    const { userId, title, description, startDate, dueDate } = todoData;

    const query = `
      INSERT INTO todos (userid, title, description, startdate, duedate, iscompleted, ispublicholiday, isdeleted)
      VALUES ($1, $2, $3, $4, $5, false, false, false)
      RETURNING *
    `;
    const { rows } = await db.query(query, [userId, title, description, startDate, dueDate]);
    return rows[0];
  }

  async update(id, userId, todoData) {
    const { title, description, startDate, dueDate, isCompleted } = todoData;

    // First check if todo belongs to user
    const checkQuery = 'SELECT iscompleted FROM todos WHERE todoid = $1 AND userid = $2';
    const checkResult = await db.query(checkQuery, [id, userId]);

    if (!checkResult.rows[0]) {
      throw new Error('Todo not found or does not belong to user');
    }

    // isCompleted 업데이트가 아닌 경우에만 완료된 할 일 수정 금지
    if (isCompleted === undefined && checkResult.rows[0].iscompleted) {
      throw new Error('Cannot update completed todo');
    }

    // 동적으로 업데이트할 필드 구성
    const updates = [];
    const values = [id, userId];
    let paramIndex = 3;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (startDate !== undefined) {
      updates.push(`startdate = $${paramIndex++}`);
      values.push(startDate);
    }
    if (dueDate !== undefined) {
      updates.push(`duedate = $${paramIndex++}`);
      values.push(dueDate);
    }
    if (isCompleted !== undefined) {
      updates.push(`iscompleted = $${paramIndex++}`);
      values.push(isCompleted);
    }

    updates.push('updatedat = NOW()');

    const query = `
      UPDATE todos
      SET ${updates.join(', ')}
      WHERE todoid = $1 AND userid = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async softDelete(id, userId) {
    // Check if todo belongs to user and is not completed
    const checkQuery = 'SELECT iscompleted FROM todos WHERE todoid = $1 AND userid = $2 AND isdeleted = false';
    const checkResult = await db.query(checkQuery, [id, userId]);

    if (!checkResult.rows[0]) {
      throw new Error('Todo not found, does not belong to user, or is already deleted');
    }

    if (checkResult.rows[0].iscompleted) {
      throw new Error('Cannot delete completed todo');
    }

    const query = `
      UPDATE todos
      SET isdeleted = true, deletedat = NOW(), updatedat = NOW()
      WHERE todoid = $1 AND userid = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  }

  async hardDelete(id, userId) {
    const query = 'DELETE FROM todos WHERE todoid = $1 AND userid = $2 RETURNING *';
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  }

  async findDeletedByUserId(userId) {
    const query = `
      SELECT * FROM todos
      WHERE userid = $1 AND isdeleted = true
      ORDER BY deletedat DESC
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  async restore(id, userId) {
    const query = `
      UPDATE todos
      SET isdeleted = false, deletedat = NULL, updatedat = NOW()
      WHERE todoid = $1 AND userid = $2 AND isdeleted = true
      RETURNING *
    `;
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  }

  async findByDateRange(startDate, endDate, userId) {
    const query = `
      SELECT * FROM todos
      WHERE userid = $1
        AND isdeleted = false
        AND (
          (startdate BETWEEN $2 AND $3) OR
          (duedate BETWEEN $2 AND $3) OR
          (startdate <= $2 AND duedate >= $3)
        )
      ORDER BY createdat DESC
    `;
    const { rows } = await db.query(query, [userId, startDate, endDate]);
    return rows;
  }

  async findPublicHolidays(year = null) {
    let query = 'SELECT * FROM todos WHERE ispublicholiday = true';
    const params = [];

    if (year) {
      query += ` AND EXTRACT(YEAR FROM duedate) = $1`;
      params.push(year);
    }

    query += ' ORDER BY duedate';

    const { rows } = await db.query(query, params);
    return rows;
  }
}

export default new TodoModel();