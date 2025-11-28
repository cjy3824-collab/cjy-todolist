// src/utils/jwtUtils.js
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import RefreshTokenModel from '../models/RefreshTokenModel.js';

// Access Token 생성
export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.userid, email: user.email },
    jwtConfig.access.secret,
    { expiresIn: jwtConfig.access.expiresIn }
  );
};

// Refresh Token 생성
export const generateRefreshToken = (user) => {
  // Refresh token을 위한 고유한 ID 생성
  const refreshTokenId = jwt.sign(
    { userId: user.userid },
    jwtConfig.refresh.secret,
    { expiresIn: jwtConfig.refresh.expiresIn }
  );

  return refreshTokenId;
};

// Access Token 검증
export const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.access.secret);
};

// Refresh Token 검증
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refresh.secret);
};

// Refresh Token을 데이터베이스에 저장
export const storeRefreshToken = async (userId, token) => {
  // JWT의 만료 시간을 사용하여 DB에 저장
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000); // Unix timestamp를 Date 객체로 변환
  
  return await RefreshTokenModel.create(userId, token, expiresAt);
};

// Refresh Token으로 Access Token 갱신
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Refresh Token 검증
    const decoded = verifyRefreshToken(refreshToken);
    
    // DB에서 토큰 확인
    const storedToken = await RefreshTokenModel.findByToken(refreshToken);
    if (!storedToken) {
      throw new Error('Refresh token not found');
    }
    
    // 새 Access Token 생성
    const newAccessToken = generateAccessToken({ userId: decoded.userId });
    
    return newAccessToken;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Refresh Token 폐기
export const revokeRefreshToken = async (refreshToken) => {
  return await RefreshTokenModel.deleteByToken(refreshToken);
};

// 사용자의 모든 Refresh Token 폐기
export const revokeAllRefreshTokens = async (userId) => {
  return await RefreshTokenModel.deleteByUserId(userId);
};