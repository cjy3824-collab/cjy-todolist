// src/validators/todoValidator.js
import { body, query, validationResult } from 'express-validator';
import { validateTitle, validateDescription, validateDate, validateDateRangeQuery } from '../utils/inputValidation.js';

// 할 일 생성 검증 규칙
const createTodoValidationRules = [
  validateTitle('title'),
  validateDescription('description'),
  validateDate('startDate'),
  validateDate('dueDate'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date in ISO 8601 format (YYYY-MM-DD)')
    .isAfter(new Date().toISOString().split('T')[0])
    .withMessage('Due date must be after today')
];

// 할 일 수정 검증 규칙
const updateTodoValidationRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .escape(), // XSS 방지
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters')
    .escape(), // XSS 방지
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO 8601 format (YYYY-MM-DD)'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date in ISO 8601 format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      // 시작일이 존재하고, 마감일이 시작일보다 이전인 경우 에러
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('Due date must be after start date');
      }
      return true;
    })
    .withMessage('Due date must be after start date'),
  body('isCompleted')
    .optional()
    .isBoolean()
    .withMessage('isCompleted must be a boolean value')
];

// 할 일 목록 조회 검증 규칙
const getTodosValidationRules = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO 8601 format (YYYY-MM-DD)'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date in ISO 8601 format (YYYY-MM-DD)'),
  query('isCompleted')
    .optional()
    .isIn(['true', 'false', 'all'])
    .withMessage('isCompleted must be true, false, or all'),
  query('keyword')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Keyword must be less than 100 characters')
    .escape() // XSS 방지
];

// 완료 상태 토글 검증 규칙
const toggleCompleteValidationRules = [
  body('isCompleted')
    .isBoolean()
    .withMessage('isCompleted must be a boolean value')
];

// 입력 검증 결과 확인
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'ValidationError',
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};

export {
  createTodoValidationRules,
  updateTodoValidationRules,
  getTodosValidationRules,
  toggleCompleteValidationRules,
  validate
};