// src/services/CalendarService.js
import TodoModel from '../models/TodoModel.js';
import { successResponse, formatResponseData } from '../utils/responseFormatter.js';

class CalendarService {
  async getCalendarData(userId, startDate, endDate) {
    // 사용자의 할 일 가져오기 (삭제된 할일은 제외)
    const userTodos = await TodoModel.findByUserId(userId, false);
    
    // 지정된 기간에 해당하는 사용자 할 일 필터링
    const filteredUserTodos = userTodos.filter(todo => {
      const dueDate = new Date(todo.dueDate);
      return dueDate >= new Date(startDate) && dueDate <= new Date(endDate);
    });
    
    // 지정된 기간에 해당하는 공휴일 가져오기
    const publicHolidays = await TodoModel.findPublicHolidays();
    const filteredHolidays = publicHolidays.filter(holiday => {
      const dueDate = new Date(holiday.dueDate);
      return dueDate >= new Date(startDate) && dueDate <= new Date(endDate);
    });

    // 날짜별로 그룹화
    const calendarData = {};
    
    // 사용자 할 일 추가
    filteredUserTodos.forEach(todo => {
      const dateKey = todo.dueDate;
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = { todos: [], holidays: [] };
      }
      calendarData[dateKey].todos.push(todo);
    });
    
    // 공휴일 추가
    filteredHolidays.forEach(holiday => {
      const dateKey = holiday.dueDate;
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = { todos: [], holidays: [] };
      }
      calendarData[dateKey].holidays.push(holiday);
    });

    // 결과를 날짜 순서로 정렬
    const sortedDates = Object.keys(calendarData).sort((a, b) => new Date(a) - new Date(b));
    const result = sortedDates.map(date => ({
      date,
      todos: formatResponseData(calendarData[date].todos),
      holidays: formatResponseData(calendarData[date].holidays)
    }));

    return successResponse(result, 'Calendar data retrieved successfully');
  }
}

export default new CalendarService();