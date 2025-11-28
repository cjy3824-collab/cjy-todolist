import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Input } from '../components/common';
import useAuthStore from '../store/authStore';

const SignInPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
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
      // 로그인 API 호출 (authStore의 signIn 사용)
      await signIn({
        email: formData.email,
        password: formData.password,
      });

      // 성공 메시지
      toast.success('로그인되었습니다.');

      // /todos 페이지로 리다이렉트
      navigate('/todos');
    } catch (error) {
      console.error('로그인 실패:', error);

      // 에러 메시지 처리
      if (error.message) {
        if (
          error.message.includes('credentials') ||
          error.message.includes('인증') ||
          error.message.includes('사용자') ||
          error.message.includes('비밀번호')
        ) {
          setErrors({
            email: '이메일 또는 비밀번호가 올바르지 않습니다.',
          });
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
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
            Don't be lazy
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            할 일 관리의 새로운 기준
          </p>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
            로그인
          </h2>
        </div>

        {/* 로그인 폼 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 이메일 입력 */}
            <Input
              label="이메일"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="이메일을 입력하세요"
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
              placeholder="비밀번호를 입력하세요"
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
              로그인하기
            </Button>
          </div>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
