/**
 * 입력값 검증 유틸리티
 */

/**
 * 이메일 형식 검증
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 검증 (최소 8자)
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

/**
 * 사용자명 검증 (3-50자, 영문/한글/숫자/언더스코어)
 * @param {string} username
 * @returns {boolean}
 */
export const isValidUsername = (username) => {
  // 영문(a-zA-Z), 숫자(0-9), 언더스코어(_), 한글(완성형+자모) 허용
  // 백엔드와 동일한 검증 규칙 적용
  const usernameRegex = /^[a-zA-Z0-9_\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uACF0-\uD7AF]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * 할 일 제목 검증 (1-200자)
 * @param {string} title
 * @returns {boolean}
 */
export const isValidTodoTitle = (title) => {
  return title && title.trim().length > 0 && title.length <= 200;
};

/**
 * 할 일 설명 검증 (최대 2000자)
 * @param {string} description
 * @returns {boolean}
 */
export const isValidTodoDescription = (description) => {
  return !description || description.length <= 2000;
};

/**
 * 날짜 순서 검증 (시작일 <= 마감일)
 * @param {string|Date} startDate
 * @param {string|Date} dueDate
 * @returns {boolean}
 */
export const isValidDateRange = (startDate, dueDate) => {
  if (!startDate || !dueDate) return true;
  const start = new Date(startDate);
  const due = new Date(dueDate);
  return start <= due;
};
