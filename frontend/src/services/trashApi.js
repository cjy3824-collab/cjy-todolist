import apiClient from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * 휴지통 관련 API 함수들
 */

/**
 * 휴지통 목록 조회
 * @returns {Promise<Array>} 삭제된 할 일 목록
 */
export const getTrash = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.TRASH.BASE);
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 할 일 복구
 * @param {string} id - 할 일 ID
 * @returns {Promise<Object>} 복구된 할 일 정보
 */
export const restoreTodo = async (id) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.TRASH.RESTORE(id));
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 할 일 영구 삭제
 * @param {string} id - 할 일 ID
 * @returns {Promise<Object>} 삭제 결과
 */
export const permanentlyDeleteTodo = async (id) => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.TRASH.BY_ID(id));
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 휴지통 전체 비우기
 * @returns {Promise<Object>} 전체 비우기 결과
 */
export const emptyTrash = async () => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.TRASH.BASE);
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};