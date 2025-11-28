import { forwardRef } from 'react';

/**
 * Button 컴포넌트
 * @param {Object} props
 * @param {string} props.variant - 버튼 스타일: 'primary', 'secondary', 'danger', 'ghost'
 * @param {string} props.size - 버튼 크기: 'sm', 'md', 'lg'
 * @param {boolean} props.loading - 로딩 상태
 * @param {boolean} props.disabled - 비활성화 상태
 * @param {string} props.className - 추가 CSS 클래스
 * @param {ReactNode} props.children - 버튼 내용
 */
const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      className = '',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // 기본 스타일
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';

    // Variant 스타일
    const variantStyles = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500 disabled:bg-gray-300 disabled:text-gray-500',
      secondary:
        'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400',
      danger:
        'bg-error-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-error-500 disabled:bg-gray-300 disabled:text-gray-500',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400 disabled:text-gray-400',
    };

    // Size 스타일
    const sizeStyles = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-12 px-8 text-lg',
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
          isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        } ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
