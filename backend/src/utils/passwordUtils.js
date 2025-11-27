// src/utils/passwordUtils.js
import bcrypt from 'bcrypt';

// 비밀번호 해싱
export const hashPassword = async (password) => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return await bcrypt.hash(password, rounds);
};

// 비밀번호 비교
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 비밀번호 유효성 검사
export const validatePassword = (password) => {
  // 최소 8자 이상, 하나 이상의 문자, 숫자, 특수 문자 포함
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  
  if (!passwordRegex.test(password)) {
    throw new Error('Password must be at least 8 characters long and include at least one letter, one number, and one special character');
  }
  
  return true;
};

// 비밀번호가 이전 비밀번호와 동일한지 확인
export const isPasswordSameAsPrevious = async (password, hashedPreviousPassword) => {
  return await comparePassword(password, hashedPreviousPassword);
};