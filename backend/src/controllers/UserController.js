// src/controllers/UserController.js
import UserService from '../services/UserService.js';

class UserController {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userid;
      const result = await UserService.getProfile(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.userid;
      const profileData = req.body;
      const result = await UserService.updateProfile(userId, profileData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.userid;
      const passwordData = req.body;
      const result = await UserService.changePassword(userId, passwordData);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const userId = req.user.userid;
      const result = await UserService.getUserStats(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();