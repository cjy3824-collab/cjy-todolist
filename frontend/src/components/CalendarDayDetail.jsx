import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from './common';
import TodoItem from './TodoItem';

const CalendarDayDetail = ({ selectedDate, todos = [], onAddTodo, onToggleComplete, onEdit, onDelete }) => {
  if (!selectedDate) {
    return null;
  }

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const displayDate = format(selectedDate, 'M월 d일 (E)', { locale: ko });

  // 선택된 날짜의 할 일 필터링
  const todosForDate = todos.filter((todo) => {
    if (!todo.dueDate) return false;
    const todoDate = format(new Date(todo.dueDate), 'yyyy-MM-dd');
    return todoDate === dateStr;
  });

  // 국경일과 일반 할 일 분리
  const holidays = todosForDate.filter(todo => todo.isPublicHoliday);
  const regularTodos = todosForDate.filter(todo => !todo.isPublicHoliday);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{displayDate}</h3>
        <Button variant="primary" size="sm" onClick={onAddTodo}>
          + 할 일 추가
        </Button>
      </div>

      {/* 국경일 표시 */}
      {holidays.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">🏛️ 국경일</h4>
          <div className="space-y-2">
            {holidays.map((holiday) => (
              <div
                key={holiday.todoId}
                className="bg-error-50 border border-error-200 rounded-lg p-3"
              >
                <h5 className="text-sm font-semibold text-error-700">{holiday.title}</h5>
                {holiday.description && (
                  <p className="text-xs text-error-600 mt-1">{holiday.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 할 일 목록 */}
      {regularTodos.length === 0 ? (
        // 빈 상태
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-500 text-sm">
            {holidays.length > 0
              ? '이 날짜에는 일반 할 일이 없습니다.'
              : '이 날짜에는 할 일이 없습니다.'
            }
          </p>
        </div>
      ) : (
        // 할 일 목록
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 할 일</h4>
          <div className="space-y-3">
            {regularTodos.map((todo) => (
              <TodoItem
                key={todo.todoId}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

CalendarDayDetail.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  todos: PropTypes.array,
  onAddTodo: PropTypes.func.isRequired,
  onToggleComplete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CalendarDayDetail;
