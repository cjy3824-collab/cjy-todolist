import apiClient from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * 할 일 관련 API 함수들
 */

/**
 * 할 일 목록 조회
 * @param {Object} params - { filter, sort, search }
 * @returns {Promise<Array>} 할 일 목록
 */
export const getTodos = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.TODOS.BASE, { params });
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 할 일 상세 조회
 * @param {string} todoId
 * @returns {Promise<Object>} 할 일 상세 정보
 */
export const getTodoById = async (todoId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.TODOS.BY_ID(todoId));
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 할 일 생성
 * @param {Object} todoData - { title, description, startDate, dueDate }
 * @returns {Promise<Object>} 생성된 할 일
 */
export const createTodo = async (todoData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.TODOS.BASE, todoData);
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 할 일 수정
 * @param {string} todoId
 * @param {Object} updates - { title, description, startDate, dueDate }
 * @returns {Promise<Object>} 수정된 할 일
 */
export const updateTodo = async (todoId, updates) => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.TODOS.BY_ID(todoId), updates);
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 할 일 삭제 (휴지통으로 이동)
 * @param {string} todoId
 * @returns {Promise<void>}
 */
export const deleteTodo = async (todoId) => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.TODOS.BY_ID(todoId));
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 할 일 완료 상태 토글
 * @param {string} todoId
 * @param {boolean} isCompleted
 * @returns {Promise<Object>} 업데이트된 할 일
 */
export const toggleComplete = async (todoId, isCompleted) => {
  try {
    const response = await apiClient.patch(API_ENDPOINTS.TODOS.COMPLETE(todoId), {
      isCompleted,
    });
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};
