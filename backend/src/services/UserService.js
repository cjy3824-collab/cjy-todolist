// src/services/UserService.js
import UserModel from '../models/UserModel.js';
import TodoModel from '../models/TodoModel.js';
import { successResponse } from '../utils/responseFormatter.js';

class UserService {
  async getProfile(userId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 필드명이 일관되지 않아서 오류가 날 수 있으므로, 올바르게 매핑
      return successResponse({
        userId: user.userid,
        username: user.username,
        email: user.email,
        createdAt: user.createdat,
      }, 'User profile retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId, profileData) {
    try {
      // 업데이트 가능한 필드: username, email
      const allowedUpdates = ['username', 'email'];
      const updates = {};

      for (const key in profileData) {
        if (allowedUpdates.includes(key)) {
          updates[key] = profileData[key];
        }
      }

      const updatedUser = await UserModel.update(userId, updates);
      return successResponse({
        userId: updatedUser.userid,
        username: updatedUser.username,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedat,
      }, 'Profile updated successfully');
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // 현재 비밀번호 확인
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await UserModel.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // 새 비밀번호로 업데이트
    await UserModel.updatePassword(userId, newPassword);

    return successResponse(null, 'Password changed successfully');
  }

  async getUserStats(userId) {
    try {
      // 사용자의 모든 할 일 조회
      const allTodos = await TodoModel.findByUserId(userId);

      // 통계 계산
      const totalTodos = allTodos.length;
      const completedTodos = allTodos.filter(todo => todo.iscompleted).length;
      const pendingTodos = totalTodos - completedTodos;

      const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

      return successResponse({
        total: totalTodos,
        completed: completedTodos,
        pending: pendingTodos,
        completionRate: completionRate,
      }, 'User stats retrieved successfully');
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();