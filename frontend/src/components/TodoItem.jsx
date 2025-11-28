import { memo } from 'react';
import PropTypes from 'prop-types';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Checkbox, Button } from './common';

const TodoItem = memo(({ todo, onToggleComplete, onEdit, onDelete }) => {
  // 마감일 포맷팅 및 스타일링
  const getDueDateInfo = () => {
    if (!todo.dueDate) return null;

    const dueDate = parseISO(todo.dueDate);
    const isPastDue = isPast(dueDate) && !isToday(dueDate);
    const isUrgent = isToday(dueDate) || isTomorrow(dueDate);

    let label = '';
    let className = 'text-gray-600';

    if (isToday(dueDate)) {
      label = '오늘';
      className = 'text-error-500 font-medium';
    } else if (isTomorrow(dueDate)) {
      label = '내일';
      className = 'text-warning-500 font-medium';
    } else if (isPastDue) {
      label = `${format(dueDate, 'MM/dd', { locale: ko })} (지남)`;
      className = 'text-error-500 font-medium';
    } else {
      label = format(dueDate, 'MM/dd', { locale: ko });
    }

    return {
      label,
      className,
      isPastDue,
      isUrgent,
    };
  };

  const dueDateInfo = getDueDateInfo();

  // 카드 스타일 (마감 임박/지남에 따라 변경)
  const cardClassName = `
    bg-white rounded-lg border p-4 transition-all
    ${todo.isCompleted ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
    ${dueDateInfo?.isPastDue && !todo.isCompleted ? 'border-error-200 bg-error-50' : ''}
    ${dueDateInfo?.isUrgent && !todo.isCompleted && !dueDateInfo.isPastDue ? 'border-warning-200' : ''}
  `.trim();

  // 제목 스타일
  const titleClassName = `
    text-lg font-semibold
    ${todo.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}
  `.trim();

  // 설명 스타일
  const descriptionClassName = `
    text-sm mt-1
    ${todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-500'}
  `.trim();

  return (
    <div className={cardClassName}>
      <div className="flex items-start gap-3">
        {/* 체크박스 */}
        <div className="pt-1">
          <Checkbox
            checked={todo.isCompleted}
            onChange={() => onToggleComplete(todo.todoId, !todo.isCompleted)}
            aria-label={`${todo.title} 완료 상태 토글`}
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 min-w-0">
          {/* 제목과 마감일 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={titleClassName} id={`todo-title-${todo.todoId}`}>
              {todo.title}
            </h3>
            {dueDateInfo && (
              <div className="flex items-center gap-1 flex-shrink-0" aria-label={`마감일: ${dueDateInfo.label}`}>
                {dueDateInfo.isPastDue && !todo.isCompleted && (
                  <span className="text-error-500" aria-label="기한 지남">⚠️</span>
                )}
                <span className={`text-sm ${dueDateInfo.className}`} aria-hidden="true">
                  📅 {dueDateInfo.label}
                </span>
              </div>
            )}
          </div>

          {/* 설명 */}
          {todo.description && (
            <p className={descriptionClassName} id={`todo-desc-${todo.todoId}`}>
              {todo.description}
            </p>
          )}

          {/* 버튼 그룹 */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(todo)}
              disabled={todo.isCompleted}
              aria-label={`"${todo.title}" 수정`}
              aria-describedby={todo.description ? `todo-desc-${todo.todoId}` : undefined}
            >
              수정
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo.todoId)}
              disabled={todo.isCompleted}
              className="text-error-500 hover:text-error-600 hover:bg-error-50"
              aria-label={`"${todo.title}" 삭제`}
              aria-describedby={`todo-title-${todo.todoId}`}
            >
              삭제
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

TodoItem.propTypes = {
  todo: PropTypes.shape({
    todoId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    dueDate: PropTypes.string,
    isCompleted: PropTypes.bool.isRequired,
  }).isRequired,
  onToggleComplete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TodoItem;
