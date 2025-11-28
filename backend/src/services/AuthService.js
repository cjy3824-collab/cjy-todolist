// src/services/AuthService.js
import UserModel from '../models/UserModel.js';
import { hashPassword, validatePassword } from '../utils/passwordUtils.js';
import { generateAccessToken, generateRefreshToken, storeRefreshToken } from '../utils/jwtUtils.js';
import { successResponse, tokenResponse } from '../utils/responseFormatter.js';

class AuthService {
  async signUp(userData) {
    const { username, email, password } = userData;

    // 비밀번호 유효성 검사
    validatePassword(password);

    // 비밀번호 해시
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword
    });

    // 토큰 생성
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Refresh token 저장
    await storeRefreshToken(newUser.userid, refreshToken);

    return tokenResponse(accessToken, refreshToken, newUser);
  }

  async signIn(userData) {
    const { email, password } = userData;

    // 이메일로 사용자 찾기
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 비밀번호 비교
    const isPasswordValid = await UserModel.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 토큰 생성
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Refresh token 저장
    await storeRefreshToken(user.userid, refreshToken);

    return tokenResponse(accessToken, refreshToken, user);
  }

  async signOut(refreshToken) {
    // Refresh token 폐기 (refreshToken이 없어도 성공 처리)
    if (refreshToken) {
      try {
        await revokeRefreshToken(refreshToken);
      } catch (error) {
        // refreshToken이 이미 만료되었거나 없는 경우에도 성공 처리
        console.log('RefreshToken revocation failed:', error.message);
      }
    }

    return successResponse(null, 'Successfully signed out');
  }

  async refreshAccessToken(refreshToken) {
    // 토큰 갱신 로직
    const newAccessToken = await refreshAccessToken(refreshToken);
    
    return successResponse({ accessToken: newAccessToken });
  }
}

// JWT 유틸리티 함수들을 import하여 사용
import { refreshAccessToken, revokeRefreshToken, revokeAllRefreshTokens } from '../utils/jwtUtils.js';

export default new AuthService();