/**
 * ErrorMessage 컴포넌트
 * @param {Object} props
 * @param {string} props.message - 에러 메시지
 * @param {function} props.onRetry - 재시도 핸들러
 */
const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <svg
        className="w-16 h-16 text-error-500 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        오류가 발생했습니다
      </h3>
      <p className="text-gray-600 text-center mb-4">
        {message || '알 수 없는 오류가 발생했습니다.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
