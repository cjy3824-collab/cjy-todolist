// src/utils/responseFormatter.js

// 성공 응답 포맷
export const successResponse = (data = null, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

// 에러 응답 포맷
export const errorResponse = (error, message = 'Error occurred', statusCode = 500) => {
  return {
    success: false,
    statusCode,
    message,
    error: error instanceof Error ? error.message : error,
  };
};

// 페이징 응답 포맷
export const paginatedResponse = (data, pagination) => {
  return {
    success: true,
    message: 'Success',
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 0,
    },
    statusCode: 200,
  };
};

// JWT 토큰 응답 포맷
export const tokenResponse = (accessToken, refreshToken, user) => {
  return {
    success: true,
    message: 'Authentication successful',
    data: {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
      },
    },
    statusCode: 200,
  };
};

// 모델에서 반환된 데이터를 응답 포맷으로 변환
export const formatResponseData = (data, options = {}) => {
  if (Array.isArray(data)) {
    return data.map(item => formatSingleItem(item, options));
  }
  return formatSingleItem(data, options);
};

// PostgreSQL 필드명을 camelCase로 변환하는 매핑
const fieldNameMapping = {
  todoid: 'todoId',
  userid: 'userId',
  createdat: 'createdAt',
  updatedat: 'updatedAt',
  deletedat: 'deletedAt',
  startdate: 'startDate',
  duedate: 'dueDate',
  iscompleted: 'isCompleted',
  isdeleted: 'isDeleted',
  ispublicholiday: 'isPublicHoliday',
};

// snake_case와 PostgreSQL 소문자 필드명을 camelCase로 변환하는 헬퍼 함수
const toCamelCase = (str) => {
  // 먼저 매핑 테이블에서 확인
  if (fieldNameMapping[str.toLowerCase()]) {
    return fieldNameMapping[str.toLowerCase()];
  }
  // snake_case 변환
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

// 단일 항목의 응답 포맷
const formatSingleItem = (item, options = {}) => {
  if (!item) return null;

  // 응답에서 제외할 필드들 (camelCase로 변환된 후 비교)
  const excludeFields = options.exclude || ['password', 'deletedAt'];

  const formattedItem = {};

  for (const [key, value] of Object.entries(item)) {
    // PostgreSQL 소문자 필드명 또는 snake_case를 camelCase로 변환
    const camelKey = toCamelCase(key);

    if (!excludeFields.includes(camelKey)) {
      formattedItem[camelKey] = value;
    }
  }

  return formattedItem;
};