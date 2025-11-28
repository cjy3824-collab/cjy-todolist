// API 엔드포인트 상수
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    SIGNOUT: '/auth/signout',
    REFRESH: '/auth/refresh',
  },
  // 할 일
  TODOS: {
    BASE: '/todos',
    BY_ID: (id) => `/todos/${id}`,
    COMPLETE: (id) => `/todos/${id}/complete`,
  },
  // 휴지통
  TRASH: {
    BASE: '/trash',
    RESTORE: (id) => `/trash/${id}/restore`,
    BY_ID: (id) => `/trash/${id}`,
  },
  // 캘린더
  CALENDAR: {
    BASE: '/calendar',
    BY_DATE: (date) => `/calendar/date/${date}`,
  },
  // 국경일
  HOLIDAYS: {
    BASE: '/holidays',
    BY_ID: (id) => `/holidays/${id}`,
  },
  // 사용자
  USERS: {
    PROFILE: '/users/profile',
  },
};

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};
