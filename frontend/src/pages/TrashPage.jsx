import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { MainLayout } from '../components/layout';
import { Button, Loading, ErrorMessage } from '../components/common';
import TrashItem from '../components/TrashItem';
import { getTrash, restoreTodo, permanentlyDeleteTodo, emptyTrash } from '../services/trashApi';
import useTodoStore from '../store/todoStore';

const TrashPage = () => {
  const { addTodo, deleteTodo } = useTodoStore();
  const [trashedTodos, setTrashedTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 휴지통 데이터 조회
  useEffect(() => {
    const fetchTrash = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTrash();
        setTrashedTodos(data);
      } catch (err) {
        console.error('휴지통 조회 실패:', err);
        setError('휴지통을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrash();
  }, []);

  // 할 일 복구
  const handleRestore = async (todoId, title) => {
    if (!window.confirm(`${title} 할 일을 복구하시겠습니까?`)) {
      return;
    }

    try {
      const restoredTodo = await restoreTodo(todoId);
      // 복구된 할 일을 todoStore에 올바르게 추가
      // 백엔드에서 isdeleted가 false로 업데이트된 상태로 반환되어야 함
      addTodo({...restoredTodo, isDeleted: false});
      // 휴지통 목록에서 해당 할 일 제거
      setTrashedTodos(prev => prev.filter(todo => todo.todoId !== todoId));
      toast.success('할 일이 복구되었습니다.');
    } catch (err) {
      console.error('할 일 복구 실패:', err);
      toast.error(err.message || '할 일 복구에 실패했습니다.');
    }
  };

  // 할 일 영구 삭제
  const handlePermanentDelete = async (todoId, title) => {
    if (!window.confirm(`⚠️ "${title}" 할 일을 영구 삭제하시겠습니까?\n영구 삭제된 할 일은 복구할 수 없습니다.`)) {
      return;
    }

    try {
      await permanentlyDeleteTodo(todoId);
      deleteTodo(todoId);
      setTrashedTodos(prev => prev.filter(todo => todo.todoId !== todoId));
      toast.success('할 일이 영구 삭제되었습니다.');
    } catch (err) {
      console.error('할 일 영구 삭제 실패:', err);
      toast.error(err.message || '할 일 영구 삭제에 실패했습니다.');
    }
  };

  // 전체 비우기
  const handleEmptyTrash = async () => {
    if (trashedTodos.length === 0) {
      toast.info('휴지통이 이미 비어 있습니다.');
      return;
    }

    if (!window.confirm('⚠️ 휴지통의 모든 할 일을 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await emptyTrash();
      trashedTodos.forEach(todo => deleteTodo(todo.todoId));
      setTrashedTodos([]);
      toast.success('휴지통이 비워졌습니다.');
    } catch (err) {
      console.error('휴지통 비우기 실패:', err);
      toast.error(err.message || '휴지통 비우기에 실패했습니다.');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">휴지통</h1>
            <Button 
              variant="danger" 
              onClick={handleEmptyTrash}
              disabled={trashedTodos.length === 0 || isLoading}
            >
              전체 비우기
            </Button>
          </div>
          
          {/* 경고 메시지 */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-amber-500 mr-2">⚠️</span>
              <p className="text-amber-700 text-sm">
                삭제된 할 일은 30일 후 자동으로 영구 삭제됩니다.
              </p>
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

        {/* 휴지통 목록 */}
        {!isLoading && !error && (
          <>
            {trashedTodos.length === 0 ? (
              // 빈 상태
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🗑️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">휴지통이 비어 있습니다</h3>
                <p className="text-gray-500">삭제된 할 일이 여기에 표시됩니다</p>
              </div>
            ) : (
              // 할 일 목록
              <div className="space-y-4">
                {trashedTodos.map((todo) => (
                  <TrashItem
                    key={todo.todoId}
                    todo={todo}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                  />
                ))}
              </div>
            )}

            {/* 통계 */}
            {trashedTodos.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-500">
                총 {trashedTodos.length}개의 삭제된 할 일
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default TrashPage;