import apiClient from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * 인증 관련 API 함수들
 */

/**
 * 회원가입
 * @param {Object} userData - { username, email, password }
 * @returns {Promise<Object>} 생성된 사용자 정보
 */
export const signUp = async (userData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 로그인
 * @param {Object} credentials - { username, password } 또는 { email, password }
 * @returns {Promise<Object>} { accessToken, refreshToken, user }
 */
export const signIn = async (credentials) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNIN, credentials);

    // 백엔드는 토큰 정보를 data.data에 담아서 반환함
    const { accessToken, refreshToken, user } = response.data.data;

    // 토큰 저장
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return { accessToken, refreshToken, user };
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 로그아웃
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.SIGNOUT);
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
  } finally {
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Access Token 갱신
 * @returns {Promise<Object>} { accessToken }
 */
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('Refresh Token이 없습니다.');
    }

    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });

    // 백엔드는 갱신된 토큰 정보를 data.data에 담아서 반환함
    const { accessToken } = response.data.data;

    // 새로운 Access Token 저장
    localStorage.setItem('accessToken', accessToken);

    return { accessToken };
  } catch (error) {
    // Refresh Token도 만료된 경우
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error.response?.data || error;
  }
};

/**
 * 현재 로그인 상태 확인
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const accessToken = localStorage.getItem('accessToken');
  return !!accessToken;
};
