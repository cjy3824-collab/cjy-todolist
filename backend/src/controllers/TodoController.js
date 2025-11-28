// src/controllers/TodoController.js
import TodoService from '../services/TodoService.js';
import { successResponse } from '../utils/responseFormatter.js';

class TodoController {
  async getTodos(req, res, next) {
    try {
      const userId = req.user.userid;
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        isCompleted: req.query.isCompleted,
        keyword: req.query.keyword
      };

      const result = await TodoService.getTodosByUserId(userId, filters);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTodoById(req, res, next) {
    try {
      const userId = req.user.userid;
      const todoId = req.params.id;

      const result = await TodoService.getTodoById(todoId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createTodo(req, res, next) {
    try {
      const userId = req.user.userid;
      const todoData = req.body;

      const result = await TodoService.createTodo(todoData, userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateTodo(req, res, next) {
    try {
      const userId = req.user.userid;
      const todoId = req.params.id;
      const todoData = req.body;

      const result = await TodoService.updateTodo(todoId, todoData, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteTodo(req, res, next) {
    try {
      const userId = req.user.userid;
      const todoId = req.params.id;

      const result = await TodoService.deleteTodo(todoId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleComplete(req, res, next) {
    try {
      const userId = req.user.userid;
      const todoId = req.params.id;
      const { isCompleted } = req.body;

      const result = await TodoService.toggleComplete(todoId, userId, isCompleted);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTrash(req, res, next) {
    try {
      const userId = req.user.userid;

      const result = await TodoService.getTrashByUserId(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async restoreTodo(req, res, next) {
    try {
      const userId = req.user.userid;
      const todoId = req.params.id;

      const result = await TodoService.restoreTodo(todoId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async permanentlyDelete(req, res, next) {
    try {
      const userId = req.user.userid;
      const todoId = req.params.id;

      const result = await TodoService.permanentlyDeleteTodo(todoId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new TodoController();