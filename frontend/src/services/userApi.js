import apiClient from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * 사용자 관련 API 함수들
 */

/**
 * 사용자 프로필 조회
 * @returns {Promise<Object>} 사용자 정보
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE);
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 사용자 통계 조회
 * @returns {Promise<Object>} 사용자 통계 정보
 */
export const getUserStats = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS.PROFILE}/stats`);
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 사용자 프로필 수정
 * @param {Object} profileData - 수정할 프로필 데이터
 * @returns {Promise<Object>} 수정된 사용자 정보
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.USERS.PROFILE, profileData);
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 비밀번호 변경
 * @param {Object} passwordData - 현재 비밀번호, 새 비밀번호
 * @returns {Promise<Object>} 변경 결과
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.put(`${API_ENDPOINTS.USERS.PROFILE}/password`, passwordData);
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};