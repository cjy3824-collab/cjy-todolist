import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Input, ErrorMessage } from '../components/common';
import { signUp } from '../services/authApi';
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from '../utils/validators';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드의 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 클라이언트 측 입력 검증
  const validateForm = () => {
    const newErrors = {};

    // 사용자명 검증
    if (!formData.username.trim()) {
      newErrors.username = '사용자명은 필수 입력 항목입니다.';
    } else if (!isValidUsername(formData.username)) {
      newErrors.username =
        '사용자명은 3-50자의 영문, 한글, 숫자, 언더스코어만 사용 가능합니다.';
    }

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일은 필수 입력 항목입니다.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호는 필수 입력 항목입니다.';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인은 필수 입력 항목입니다.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 클라이언트 측 검증
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 회원가입 API 호출
      await signUp({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // 성공 메시지
      toast.success('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');

      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
    } catch (error) {
      console.error('회원가입 실패:', error);

      // 서버 에러 메시지 처리
      if (error.message) {
        // 중복 사용자명/이메일 등의 에러 메시지
        if (
          error.message.includes('username') ||
          error.message.includes('사용자명')
        ) {
          setErrors((prev) => ({
            ...prev,
            username: '이미 사용 중인 사용자명입니다.',
          }));
        } else if (
          error.message.includes('email') ||
          error.message.includes('이메일')
        ) {
          setErrors((prev) => ({
            ...prev,
            email: '이미 등록된 이메일입니다.',
          }));
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            할 일을 미루지 말자
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            계정을 만들어 시작하세요
          </p>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            회원가입
          </h2>
        </div>

        {/* 회원가입 폼 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 사용자명 입력 */}
            <Input
              label="사용자명"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="영문, 한글, 숫자, 언더스코어 사용 가능"
              required
              disabled={isLoading}
            />

            {/* 이메일 입력 */}
            <Input
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="example@email.com"
              required
              disabled={isLoading}
            />

            {/* 비밀번호 입력 */}
            <Input
              label="비밀번호"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="최소 8자 이상"
              required
              disabled={isLoading}
            />

            {/* 비밀번호 확인 입력 */}
            <Input
              label="비밀번호 확인"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="비밀번호를 다시 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          {/* 제출 버튼 */}
          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              회원가입하기
            </Button>
          </div>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/signin"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
