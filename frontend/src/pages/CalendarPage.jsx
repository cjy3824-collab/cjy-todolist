import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { toast } from 'sonner';
import { MainLayout } from '../components/layout';
import { Button, Loading, ErrorMessage } from '../components/common';
import Calendar from '../components/Calendar';
import CalendarDayDetail from '../components/CalendarDayDetail';
import TodoForm from '../components/TodoForm';
import { createTodo, updateTodo, deleteTodo, toggleComplete as toggleCompleteApi } from '../services/todoApi';
import useTodoStore from '../store/todoStore';
import useCalendarStore from '../store/calendarStore';

const CalendarPage = () => {
  const { addTodo, updateTodo: updateTodoStore, deleteTodo: deleteTodoStore } = useTodoStore();
  const { calendarData, isLoading: isCalendarLoading, error: calendarError, fetchCalendarData } = useCalendarStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 캘린더 데이터 조회
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const startDate = format(monthStart, 'yyyy-MM-dd');
        const endDate = format(monthEnd, 'yyyy-MM-dd');

        await fetchCalendarData(startDate, endDate);
      } catch (err) {
        console.error('캘린더 데이터 조회 실패:', err);
        toast.error('캘린더를 불러오는데 실패했습니다.');
      }
    };

    loadCalendarData();
  }, [currentDate, fetchCalendarData]);

  // 캘린더 데이터가 변경되면 todos 상태 업데이트
  useEffect(() => {
    // calendarData를 배열로 변환
    const allTodos = Object.values(calendarData).flat();
    setTodos(allTodos);
  }, [calendarData]);

  // 콜백 함수들
  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleCreateTodo = useCallback(async (todoData) => {
    setIsSubmitting(true);
    try {
      const newTodo = await createTodo(todoData);
      addTodo(newTodo);
      toast.success('할 일이 추가되었습니다.');
      setIsFormOpen(false);
    } catch (err) {
      console.error('할 일 생성 실패:', err);
      toast.error(err.message || '할 일 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [addTodo]);

  const handleUpdateTodo = useCallback(async (todoData) => {
    if (!editingTodo) return;

    setIsSubmitting(true);
    try {
      const updatedTodo = await updateTodo(editingTodo.todoId, todoData);
      updateTodoStore(editingTodo.todoId, updatedTodo);
      toast.success('할 일이 수정되었습니다.');
      setIsFormOpen(false);
      setEditingTodo(null);
    } catch (err) {
      console.error('할 일 수정 실패:', err);
      toast.error(err.message || '할 일 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingTodo, updateTodo, updateTodoStore]);

  const handleDeleteTodo = useCallback(async (todoId) => {
    if (!window.confirm('이 할 일을 삭제하시겠습니까? (휴지통으로 이동됩니다)')) {
      return;
    }

    try {
      await deleteTodo(todoId);
      deleteTodoStore(todoId);
      toast.success('할 일이 휴지통으로 이동되었습니다.');
    } catch (err) {
      console.error('할 일 삭제 실패:', err);
      toast.error(err.message || '할 일 삭제에 실패했습니다.');
    }
  }, [deleteTodo, deleteTodoStore]);

  const handleToggleComplete = useCallback(async (todoId, isCompleted) => {
    try {
      await toggleCompleteApi(todoId, isCompleted);
      toast.success(isCompleted ? '할 일을 완료했습니다.' : '할 일을 미완료로 변경했습니다.');
    } catch (err) {
      console.error('완료 상태 변경 실패:', err);
      toast.error(err.message || '완료 상태 변경에 실패했습니다.');
    }
  }, []);

  const handleAddTodoForDate = useCallback(() => {
    setEditingTodo({
      dueDate: format(selectedDate, 'yyyy-MM-dd'),
    });
    setIsFormOpen(true);
  }, [selectedDate]);

  const handleEditClick = useCallback((todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTodo(null);
  }, []);

  const handleFormSubmit = useCallback((todoData) => {
    if (editingTodo?.todoId) {
      handleUpdateTodo(todoData);
    } else {
      handleCreateTodo(todoData);
    }
  }, [editingTodo, handleUpdateTodo, handleCreateTodo]);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">캘린더</h1>

          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
            <Button variant="secondary" onClick={handlePrevMonth}>
              ◀
            </Button>
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'yyyy년 M월')}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleToday}>
                오늘
              </Button>
            </div>
            <Button variant="secondary" onClick={handleNextMonth}>
              ▶
            </Button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isCalendarLoading && (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        )}

        {/* 에러 상태 */}
        {calendarError && !isCalendarLoading && (
          <ErrorMessage
            message={calendarError}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* 캘린더 및 상세 */}
        {!isCalendarLoading && !calendarError && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 캘린더 */}
            <div className="lg:col-span-2">
              <Calendar
                currentDate={currentDate}
                todos={todos}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
              />
            </div>

            {/* 날짜별 상세 */}
            <div className="lg:col-span-1">
              <CalendarDayDetail
                selectedDate={selectedDate}
                todos={todos}
                onAddTodo={handleAddTodoForDate}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditClick}
                onDelete={handleDeleteTodo}
              />
            </div>
          </div>
        )}

        {/* 할 일 폼 모달 */}
        <TodoForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initialData={editingTodo}
          isLoading={isSubmitting}
        />
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
