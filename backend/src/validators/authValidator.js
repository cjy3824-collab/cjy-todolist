// src/validators/authValidator.js
import { body, validationResult } from 'express-validator';
import UserModel from '../models/UserModel.js';
import { validateUsername, validateEmail, validatePassword } from '../utils/inputValidation.js';

// 회원가입 검증 규칙
const signUpValidationRules = [
  validateUsername(),
  validateEmail(),
  validatePassword(),
  body('username')
    .custom(async (username) => {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      return true;
    }),

  body('email')
    .custom(async (email) => {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already exists');
      }
      return true;
    })
];

// 로그인 검증 규칙
const signInValidationRules = [
  validateEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

export { signUpValidationRules, signInValidationRules, validate };