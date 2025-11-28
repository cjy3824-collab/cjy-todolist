import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { MainLayout } from '../components/layout';
import { Button, Input, Loading, ErrorMessage } from '../components/common';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';
import useTodoStore from '../store/todoStore';
import { getTodos, createTodo, updateTodo, deleteTodo, toggleComplete as toggleCompleteApi } from '../services/todoApi';

const TodosPage = () => {
  const { todos, setTodos, addTodo, updateTodo: updateTodoStore, deleteTodo: deleteTodoStore, toggleComplete } = useTodoStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 필터 및 정렬 상태
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'dueDate', 'title'
  const [searchQuery, setSearchQuery] = useState('');

  // 할 일 목록 조회
  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTodos();
        setTodos(data);
      } catch (err) {
        console.error('할 일 조회 실패:', err);
        setError('할 일을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [setTodos]);

  // 필터링 및 정렬된 할 일 목록
  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          (todo.description && todo.description.toLowerCase().includes(query))
      );
    }

    // 상태 필터
    if (filter === 'active') {
      result = result.filter((todo) => !todo.isCompleted);
    } else if (filter === 'completed') {
      result = result.filter((todo) => todo.isCompleted);
    }

    // 정렬
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [todos, filter, sortBy, searchQuery]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.isCompleted).length;
    const active = total - completed;
    return { total, completed, active };
  }, [todos]);

  // 할 일 생성 핸들러
  const handleCreateTodo = async (todoData) => {
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
  };

  // 할 일 수정 핸들러
  const handleUpdateTodo = async (todoData) => {
    if (!editingTodo || !(editingTodo.todoId || editingTodo.todoid)) {
      console.error('수정할 할 일 ID가 없습니다.');
      toast.error('할 일 ID가 없어 수정할 수 없습니다.');
      return;
    }

    const todoId = editingTodo.todoId || editingTodo.todoid;

    setIsSubmitting(true);
    try {
      const updatedTodo = await updateTodo(todoId, todoData);
      updateTodoStore(todoId, updatedTodo);
      toast.success('할 일이 수정되었습니다.');
      setIsFormOpen(false);
      setEditingTodo(null);
    } catch (err) {
      console.error('할 일 수정 실패:', err);
      toast.error(err.message || '할 일 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 할 일 삭제 핸들러
  const handleDeleteTodo = async (todoId) => {
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
  };

  // 할 일 완료 상태 토글 핸들러
  const handleToggleComplete = async (todoId, isCompleted) => {
    if (!todoId) {
      console.error('할 일 ID가 없습니다.');
      toast.error('할 일 ID가 없어 완료 상태를 변경할 수 없습니다.');
      return;
    }

    try {
      await toggleCompleteApi(todoId, isCompleted);
      toggleComplete(todoId);
      toast.success(isCompleted ? '할 일을 완료했습니다.' : '할 일을 미완료로 변경했습니다.');
    } catch (err) {
      console.error('완료 상태 변경 실패:', err);
      toast.error(err.message || '완료 상태 변경에 실패했습니다.');
    }
  };

  // 할 일 수정 모달 열기
  const handleEditClick = (todo) => {
    if (!todo || !(todo.todoId || todo.todoid)) {
      console.error('할 일 ID가 없어 수정할 수 없습니다.', todo);
      toast.error('할 일 정보가 올바르지 않아 수정할 수 없습니다.');
      return;
    }

    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  // 새 할 일 추가 모달 열기
  const handleAddClick = () => {
    setEditingTodo(null);
    setIsFormOpen(true);
  };

  // 모달 닫기
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };

  // 폼 제출 핸들러
  const handleFormSubmit = (todoData) => {
    if (editingTodo) {
      handleUpdateTodo(todoData);
    } else {
      handleCreateTodo(todoData);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">내 할 일</h1>
          <Button variant="primary" onClick={handleAddClick}>
            + 새 할 일 추가
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="🔍 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 필터 */}
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">전체</option>
                <option value="active">미완료</option>
                <option value="completed">완료</option>
              </select>

              {/* 정렬 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="recent">최신순</option>
                <option value="dueDate">마감일순</option>
                <option value="title">제목순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* 할 일 목록 */}
        {!isLoading && !error && (
          <>
            {filteredAndSortedTodos.length === 0 ? (
              // 빈 상태
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 mb-4">
                  {searchQuery || filter !== 'all'
                    ? '검색 결과가 없습니다.'
                    : '아직 할 일이 없습니다.'}
                </p>
                {!searchQuery && filter === 'all' && (
                  <Button variant="primary" onClick={handleAddClick}>
                    + 첫 번째 할 일 추가하기
                  </Button>
                )}
              </div>
            ) : (
              // 할 일 목록
              <div className="space-y-3">
                {filteredAndSortedTodos.map((todo) => (
                  <TodoItem
                    key={todo.todoId}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </div>
            )}

            {/* 통계 */}
            {filteredAndSortedTodos.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-600">
                총 {stats.total}개 할 일 | 완료: {stats.completed}개 | 미완료: {stats.active}개
              </div>
            )}
          </>
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

export default TodosPage;
