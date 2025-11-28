// src/controllers/CalendarController.js
import CalendarService from '../services/CalendarService.js';

class CalendarController {
  async getCalendar(req, res, next) {
    try {
      const userId = req.user.userid; // 데이터베이스 컬럼명과 일치하도록 수정
      const { start, end } = req.query;

      // 쿼리 파라미터가 없을 경우 기본값 설정
      const startDate = start || new Date().toISOString().split('T')[0];
      const endDate = end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30일 후

      const result = await CalendarService.getCalendarData(userId, startDate, endDate);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new CalendarController();