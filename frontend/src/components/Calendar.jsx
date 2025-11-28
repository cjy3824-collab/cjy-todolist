import { memo } from 'react';
import PropTypes from 'prop-types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

const Calendar = memo(({ currentDate, todos = [], onDateClick, selectedDate }) => {
  // 캘린더 그리드 생성
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  // 특정 날짜의 할 일 개수 계산
  const getTodoCountForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return todos.filter((todo) => {
      if (!todo.dueDate) return false;
      const todoDate = format(parseISO(todo.dueDate), 'yyyy-MM-dd');
      return todoDate === dateStr;
    }).length;
  };

  // 특정 날짜에 국경일이 있는지 확인
  const getHolidayForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return todos.find((todo) => {
      if (!todo.isPublicHoliday || !todo.dueDate) return false;
      const todoDate = format(parseISO(todo.dueDate), 'yyyy-MM-dd');
      return todoDate === dateStr;
    });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200" role="rowgroup">
        <div className="sr-only">요일</div>
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-semibold ${
              index === 0 ? 'text-error-500' : index === 6 ? 'text-primary-500' : 'text-gray-700'
            }`}
            role="columnheader"
            aria-label={`${day}요일`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div
        className="grid grid-cols-7"
        role="grid"
        aria-label={`${format(currentDate, 'yyyy년 M월')} 달력`}
        tabIndex="0"
      >
        {calendarDays.map((day, index) => {
          const todoCount = getTodoCountForDate(day);
          const holiday = getHolidayForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const dayOfWeek = day.getDay();

          // Determine button label
          let dayLabel = `${format(day, 'yyyy-MM-dd')} (${['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}요일)`;
          if (isTodayDate) {
            dayLabel += ' (오늘)';
          }
          if (holiday) {
            dayLabel += ` - 공휴일: ${holiday.title}`;
          }
          if (todoCount > 0) {
            dayLabel += ` - 할 일 ${todoCount}개`;
          }

          return (
            <button
              key={index}
              onClick={() => onDateClick(day)}
              className={`
                min-h-[80px] sm:min-h-[100px] p-2 border-b border-r border-gray-100
                hover:bg-gray-50 transition-colors text-left relative
                ${!isCurrentMonth ? 'bg-gray-50' : ''}
                ${isSelected ? 'bg-primary-50 bg-opacity-20 ring-2 ring-primary-500 ring-inset' : ''}
                ${index % 7 === 6 ? 'border-r-0' : ''}
              `}
              role="gridcell"
              aria-label={dayLabel}
              aria-selected={isSelected}
              aria-current={isTodayDate ? 'date' : undefined}
            >
              {/* 날짜 숫자 */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                    ${isTodayDate ? 'bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                    ${holiday && !isTodayDate ? 'text-error-500' : ''}
                    ${dayOfWeek === 0 && !holiday && !isTodayDate && isCurrentMonth ? 'text-error-500' : ''}
                    ${dayOfWeek === 6 && !holiday && !isTodayDate && isCurrentMonth ? 'text-primary-500' : ''}
                  `}
                  aria-hidden="true"
                >
                  {format(day, 'd')}
                </span>
                {isSelected && (
                  <span className="text-xs text-primary-600" aria-label="선택됨">📌</span>
                )}
              </div>

              {/* 국경일 표시 */}
              {holiday && (
                <div className="text-xs text-error-500 mb-1 truncate" aria-label={`공휴일: ${holiday.title}`}>
                  🏛️ {holiday.title}
                </div>
              )}

              {/* 할 일 인디케이터 */}
              {todoCount > 0 && (
                <div
                  className="flex gap-0.5"
                  aria-label={`${todoCount}개의 할 일`}
                >
                  {Array.from({ length: Math.min(todoCount, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary-500"
                      aria-hidden="true"
                    />
                  ))}
                  {todoCount > 3 && (
                    <span className="text-xs text-gray-500 ml-1" aria-label={`총 ${todoCount}개의 할 일`}>+{todoCount - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

Calendar.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  todos: PropTypes.array,
  onDateClick: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
};

export default Calendar;