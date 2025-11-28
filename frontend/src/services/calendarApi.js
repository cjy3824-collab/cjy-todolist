import apiClient from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * 캘린더 관련 API 함수들
 */

/**
 * 캘린더 데이터 조회 (날짜 범위)
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns {Promise<Array>} 할 일 및 국경일 목록
 */
export const getCalendarData = async (startDate, endDate) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CALENDAR.BASE, {
      params: { start: startDate, end: endDate },
    });
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 특정 날짜의 할 일 조회
 * @param {string} date - 날짜 (YYYY-MM-DD)
 * @returns {Promise<Array>} 해당 날짜의 할 일 목록
 */
export const getTodosByDate = async (date) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CALENDAR.BY_DATE(date));
    return response.data.data;  // 백엔드는 실제 데이터를 data.data에 담아서 반환함
  } catch (error) {
    throw error.response?.data || error;
  }
};
