// src/utils/inputValidation.js
import { body, query, param } from 'express-validator';

// 사용자명 검증
export const validateUsername = () => {
  return body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uACF0-\uD7AF]+$/)
    .withMessage('Username can only contain English letters, Korean characters, numbers, and underscores');
};

// 이메일 검증
export const validateEmail = () => {
  return body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address');
};

// 비밀번호 검증
export const validatePassword = () => {
  return body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
};

// 제목 검증 (XSS 방지 포함)
export const validateTitle = (fieldName = 'title') => {
  return body(fieldName)
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(`${fieldName} is required and must be between 1 and 200 characters`)
    .escape() // XSS 방지: HTML 이스케이프
    .customSanitizer(value => {
      // 추가적인 불필요한 공백 제거
      return value.replace(/\s+/g, ' ').trim();
    });
};

// 설명 검증 (XSS 방지 포함)
export const validateDescription = (fieldName = 'description') => {
  return body(fieldName)
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(`${fieldName} must be less than 2000 characters`)
    .escape() // XSS 방지: HTML 이스케이프
    .customSanitizer(value => {
      // 추가적인 불필요한 공백 제거
      return value ? value.replace(/\s+/g, ' ').trim() : value;
    });
};

// 날짜 검증
export const validateDate = (fieldName) => {
  return body(fieldName)
    .optional()
    .isISO8601()
    .withMessage(`${fieldName} must be a valid date in ISO 8601 format (YYYY-MM-DD)`);
};

// ID 매개변수 검증
export const validateIdParam = (paramName = 'id') => {
  return param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`);
};

// 쿼리 매개변수 검증
export const validateDateRangeQuery = (startDateField = 'startDate', endDateField = 'endDate') => {
  return [
    query(startDateField)
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date in ISO 8601 format'),
    query(endDateField)
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date in ISO 8601 format')
      .isAfter(new Date().toISOString().split('T')[0])
      .withMessage('End date must be after today')
      .custom((value, { req }) => {
        if (req.query[startDateField] && new Date(value) < new Date(req.query[startDateField])) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ];
};