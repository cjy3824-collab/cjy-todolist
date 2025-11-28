import { forwardRef } from 'react';

/**
 * Checkbox 컴포넌트
 * @param {Object} props
 * @param {string} props.label - 체크박스 레이블
 * @param {boolean} props.checked - 체크 상태
 * @param {function} props.onChange - 변경 핸들러
 * @param {boolean} props.disabled - 비활성화 상태
 */
const Checkbox = forwardRef(
  ({ label, checked = false, onChange, disabled = false, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer group">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
            w-5 h-5 border-2 rounded
            transition-all duration-150
            ${
              checked
                ? 'bg-primary-500 border-primary-500'
                : 'bg-white border-gray-300 group-hover:border-primary-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2
          `}
          >
            {checked && (
              <svg
                className="w-full h-full text-white p-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <span
            className={`ml-2 text-sm ${
              disabled ? 'text-gray-400' : 'text-gray-700'
            }`}
          >
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
