import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useTrashStore = create(
  devtools(
    (set) => ({
      // 상태
      trashedTodos: [],
      isLoading: false,
      error: null,

      // 액션: 휴지통 할 일 목록 설정
      setTrash: (trashedTodos) => set({ trashedTodos }, false, 'setTrash'),

      // 액션: 할 일 복구
      restoreTodo: (todoId) =>
        set(
          (state) => ({
            trashedTodos: state.trashedTodos.filter(
              (todo) => todo.todoId !== todoId
            ),
          }),
          false,
          'restoreTodo'
        ),

      // 액션: 할 일 영구 삭제
      permanentlyDelete: (todoId) =>
        set(
          (state) => ({
            trashedTodos: state.trashedTodos.filter(
              (todo) => todo.todoId !== todoId
            ),
          }),
          false,
          'permanentlyDelete'
        ),

      // 액션: 휴지통 비우기
      emptyTrash: () => set({ trashedTodos: [] }, false, 'emptyTrash'),

      // 액션: 로딩 상태 설정
      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      // 액션: 에러 설정
      setError: (error) => set({ error }, false, 'setError'),

      // 액션: 에러 초기화
      clearError: () => set({ error: null }, false, 'clearError'),

      // 액션: 모든 상태 초기화
      reset: () =>
        set(
          { trashedTodos: [], isLoading: false, error: null },
          false,
          'reset'
        ),
    }),
    { name: 'TrashStore' }
  )
);

export default useTrashStore;
