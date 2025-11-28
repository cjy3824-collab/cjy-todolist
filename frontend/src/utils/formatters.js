import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜 포맷팅 유틸리티
 */

/**
 * 날짜를 "YYYY-MM-DD" 형식으로 포맷
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * 날짜를 "YYYY년 MM월 DD일" 형식으로 포맷
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateKorean = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy년 MM월 dd일', { locale: ko });
};

/**
 * 날짜와 시간을 "YYYY-MM-DD HH:mm" 형식으로 포맷
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd HH:mm');
};

/**
 * 상대적 날짜 표시 ("오늘", "내일", "MM/DD" 등)
 * @param {Date|string} date
 * @returns {string}
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateStr = formatDate(dateObj);
  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  if (dateStr === todayStr) return '오늘';
  if (dateStr === tomorrowStr) return '내일';

  return format(dateObj, 'MM/dd');
};
