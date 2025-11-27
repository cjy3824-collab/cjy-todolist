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

// 단일 항목의 응답 포맷
const formatSingleItem = (item, options = {}) => {
  if (!item) return null;
  
  // 응답에서 제외할 필드들
  const excludeFields = options.exclude || ['password', 'deletedAt'];
  
  const formattedItem = {};
  
  for (const [key, value] of Object.entries(item)) {
    if (!excludeFields.includes(key)) {
      formattedItem[key] = value;
    }
  }
  
  return formattedItem;
};