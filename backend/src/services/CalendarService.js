// src/services/CalendarService.js
import TodoModel from '../models/TodoModel.js';
import { successResponse, formatResponseData } from '../utils/responseFormatter.js';

class CalendarService {
  async getCalendarData(userId, startDate, endDate) {
    // 사용자의 할 일 가져오기 (삭제된 할일은 제외)
    const userTodos = await TodoModel.findByUserId(userId, false);

    // 지정된 기간에 해당하는 사용자 할 일 필터링
    const filteredUserTodos = userTodos.filter(todo => {
      // dueDate가 없는 경우 제외
      if (!todo.duedate) return false;

      const dueDate = new Date(todo.duedate);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return dueDate >= start && dueDate <= end;
    });

    // 지정된 기간에 해당하는 공휴일 가져오기
    const publicHolidays = await TodoModel.findPublicHolidays();
    const filteredHolidays = publicHolidays.filter(holiday => {
      if (!holiday.duedate) return false;

      const dueDate = new Date(holiday.duedate);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return dueDate >= start && dueDate <= end;
    });

    // 날짜별로 그룹화
    const calendarData = {};

    // 사용자 할 일 추가
    filteredUserTodos.forEach(todo => {
      if (!todo.duedate) return;

      // YYYY-MM-DD 형식으로 변환
      const dateKey = new Date(todo.duedate).toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = { todos: [], holidays: [] };
      }
      calendarData[dateKey].todos.push(todo);
    });

    // 공휴일 추가
    filteredHolidays.forEach(holiday => {
      if (!holiday.duedate) return;

      // YYYY-MM-DD 형식으로 변환
      const dateKey = new Date(holiday.duedate).toISOString().split('T')[0];
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