// src/services/HolidayService.js
import TodoModel from '../models/TodoModel.js';
import { successResponse, formatResponseData } from '../utils/responseFormatter.js';

class HolidayService {
  async getPublicHolidays(year) {
    const holidays = await TodoModel.findPublicHolidays(year);
    return successResponse(formatResponseData(holidays), 'Public holidays retrieved successfully');
  }

  async addPublicHoliday(holidayData, userId) {
    // 공휴일은 관리자만 추가할 수 있으므로 관리자 확인 로직이 필요합니다.
    // 이 예시에서는 간단히 userId를 확인하고, 실제 구현에서는 역할 기반 접근 제어(RBAC)가 필요합니다.
    
    // 공휴일 데이터 생성 (userId는 null로 설정)
    const holiday = {
      userId: null, // 공휴일은 특정 사용자에게 속하지 않음
      title: holidayData.title,
      description: holidayData.description,
      dueDate: holidayData.dueDate,
      isPublicHoliday: true
    };
    
    const newHoliday = await TodoModel.create(holiday);
    return successResponse(formatResponseData(newHoliday), 'Public holiday added successfully');
  }
}

export default new HolidayService();