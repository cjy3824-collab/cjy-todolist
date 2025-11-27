// src/services/TodoService.js
import TodoModel from '../models/TodoModel.js';
import { successResponse, formatResponseData } from '../utils/responseFormatter.js';

class TodoService {
  async getTodosByUserId(userId, filters = {}) {
    const { startDate, endDate, isCompleted, keyword } = filters;

    // userId를 기반으로 할 일 목록 조회
    const todos = await TodoModel.findByUserId(userId);

    // 필터링 적용
    let filteredTodos = todos;

    if (startDate && endDate) {
      filteredTodos = todos.filter(todo =>
        new Date(todo.dueDate) >= new Date(startDate) &&
        new Date(todo.dueDate) <= new Date(endDate)
      );
    }

    if (isCompleted !== undefined && isCompleted !== 'all') {
      filteredTodos = filteredTodos.filter(todo =>
        todo.isCompleted === (isCompleted === 'true')
      );
    }

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filteredTodos = filteredTodos.filter(todo =>
        todo.title.toLowerCase().includes(lowerKeyword) ||
        (todo.description && todo.description.toLowerCase().includes(lowerKeyword))
      );
    }

    // 정렬 (최신순으로 정렬)
    filteredTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(formatResponseData(filteredTodos), 'Todos retrieved successfully');
  }

  async getTodoById(todoId, userId) {
    const todo = await TodoModel.findById(todoId, userId);

    if (!todo) {
      throw new Error('Todo not found');
    }

    return successResponse(formatResponseData(todo), 'Todo retrieved successfully');
  }

  async createTodo(todoData, userId) {
    // 사용자 ID를 todoData에 추가
    const newTodoData = {
      ...todoData,
      userId
    };

    const newTodo = await TodoModel.create(newTodoData);

    return successResponse(formatResponseData(newTodo), 'Todo created successfully');
  }

  async updateTodo(todoId, todoData, userId) {
    const updatedTodo = await TodoModel.update(todoId, userId, todoData);

    if (!updatedTodo) {
      throw new Error('Todo not found or update failed');
    }

    return successResponse(formatResponseData(updatedTodo), 'Todo updated successfully');
  }

  async deleteTodo(todoId, userId) {
    const deletedTodo = await TodoModel.softDelete(todoId, userId);

    if (!deletedTodo) {
      throw new Error('Todo not found or delete failed');
    }

    return successResponse(null, 'Todo deleted successfully');
  }

  async toggleComplete(todoId, userId, isCompleted) {
    // 먼저 할 일 조회
    const todo = await TodoModel.findById(todoId, userId);

    if (!todo) {
      throw new Error('Todo not found');
    }

    // 완료 상태가 이미 변경하려는 상태와 같으면 에러
    if (todo.isCompleted === isCompleted) {
      throw new Error(`Todo is already ${isCompleted ? 'completed' : 'not completed'}`);
    }

    // 완료 상태가 true인 경우, 완료된 할 일은 수정/삭제할 수 없음
    if (isCompleted && todo.isCompleted) {
      throw new Error('Cannot update completed todo to completed again');
    }

    // 완료 상태 업데이트
    const updatedTodo = await TodoModel.update(todoId, userId, { isCompleted });

    if (!updatedTodo) {
      throw new Error('Failed to update todo completion status');
    }

    return successResponse(formatResponseData(updatedTodo), `Todo marked as ${isCompleted ? 'completed' : 'not completed'} successfully`);
  }

  async getTrashByUserId(userId) {
    const trashTodos = await TodoModel.findDeletedByUserId(userId);

    return successResponse(formatResponseData(trashTodos), 'Trash todos retrieved successfully');
  }

  async restoreTodo(todoId, userId) {
    const restoredTodo = await TodoModel.restore(todoId, userId);

    if (!restoredTodo) {
      throw new Error('Todo not found or restore failed');
    }

    return successResponse(formatResponseData(restoredTodo), 'Todo restored successfully');
  }

  async permanentlyDeleteTodo(todoId, userId) {
    const deletedTodo = await TodoModel.hardDelete(todoId, userId);

    if (!deletedTodo) {
      throw new Error('Todo not found or permanent deletion failed');
    }

    return successResponse(null, 'Todo permanently deleted successfully');
  }
}

export default new TodoService();