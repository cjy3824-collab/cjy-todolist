import { forwardRef, useState } from 'react';

/**
 * Input 컴포넌트
 * @param {Object} props
 * @param {string} props.type - input 타입: 'text', 'email', 'password', 'date', 'textarea'
 * @param {string} props.label - 레이블
 * @param {string} props.placeholder - 플레이스홀더
 * @param {string} props.error - 에러 메시지
 * @param {boolean} props.disabled - 비활성화 상태
 * @param {string} props.className - 추가 CSS 클래스
 */
const Input = forwardRef(
  (
    {
      type = 'text',
      label,
      placeholder,
      error,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isTextarea = type === 'textarea';
    const inputType =
      type === 'password' ? (showPassword ? 'text' : 'password') : type;

    // 기본 스타일
    const baseStyles =
      'w-full px-4 py-3 rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2';

    // 상태별 스타일
    const stateStyles = error
      ? 'border-error-500 bg-error-50 focus:ring-error-500 focus:border-error-500'
      : 'border-gray-300 bg-white focus:ring-primary-500 focus:border-primary-500';

    const disabledStyles = disabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : '';

    const inputStyles = `${baseStyles} ${stateStyles} ${disabledStyles} ${className}`;

    const InputComponent = isTextarea ? 'textarea' : 'input';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <InputComponent
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            className={inputStyles}
            rows={isTextarea ? 4 : undefined}
            {...props}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-error-500 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
