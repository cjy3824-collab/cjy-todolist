import { memo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from './common';

const TrashItem = memo(({ todo, onRestore, onPermanentDelete }) => {
  const originalDueDate = todo.dueDate ? format(new Date(todo.dueDate), 'MM/dd') : '미정';
  const deletedDate = todo.deletedAt ? format(new Date(todo.deletedAt), 'MM/dd HH:mm') : '알 수 없음';

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      role="article"
      aria-label={`삭제된 할 일: ${todo.title}`}
    >
      {/* 할 일 제목 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2" id={`trash-title-${todo.todoId}`}>
        {todo.title}
      </h3>

      {/* 할 일 설명 */}
      {todo.description && (
        <p
          className="text-gray-600 text-sm mb-3"
          id={`trash-desc-${todo.todoId}`}
        >
          {todo.description}
        </p>
      )}

      {/* 메타 정보 */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4" aria-label="할 일 정보">
        <div className="flex space-x-4">
          <span>원래 마감일: {originalDueDate}</span>
          <span>삭제일: {deletedDate}</span>
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex justify-end space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onRestore(todo.todoId, todo.title)}
          aria-label={`"${todo.title}" 복구하기`}
          aria-describedby={todo.description ? `trash-desc-${todo.todoId}` : `trash-title-${todo.todoId}`}
        >
          복구하기
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onPermanentDelete(todo.todoId, todo.title)}
          aria-label={`"${todo.title}" 영구 삭제`}
          aria-describedby={todo.description ? `trash-desc-${todo.todoId}` : `trash-title-${todo.todoId}`}
        >
          영구 삭제
        </Button>
      </div>
    </div>
  );
});

TrashItem.propTypes = {
  todo: PropTypes.shape({
    todoId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    dueDate: PropTypes.string,
    deletedAt: PropTypes.string,
  }).isRequired,
  onRestore: PropTypes.func.isRequired,
  onPermanentDelete: PropTypes.func.isRequired,
};

export default TrashItem;