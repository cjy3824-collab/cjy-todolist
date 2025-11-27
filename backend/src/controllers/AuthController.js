// src/controllers/AuthController.js
import AuthService from '../services/AuthService.js';
import { successResponse } from '../utils/responseFormatter.js';

class AuthController {
  async signUp(req, res, next) {
    try {
      const result = await AuthService.signUp(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async signIn(req, res, next) {
    try {
      const result = await AuthService.signIn(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async signOut(req, res, next) {
    try {
      const result = await AuthService.signOut(req.user.userId, req.body.refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await AuthService.refreshAccessToken(req.body.refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();