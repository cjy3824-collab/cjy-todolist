// src/controllers/HolidayController.js
import HolidayService from '../services/HolidayService.js';

class HolidayController {
  async getPublicHolidays(req, res, next) {
    try {
      const { year } = req.query;
      const result = await HolidayService.getPublicHolidays(year);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async addPublicHoliday(req, res, next) {
    try {
      // 관리자만 접근 가능하도록 authenticateAdmin 미들웨어 필요
      // req.user이 관리자인지 확인 후 진행
      
      const holidayData = req.body;
      const result = await HolidayService.addPublicHoliday(holidayData, req.user.userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new HolidayController();