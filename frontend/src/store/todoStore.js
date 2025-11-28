import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useTodoStore = create(
  devtools(
    (set) => ({
      // 상태
      todos: [],
      isLoading: false,
      error: null,

      // 액션: 할 일 목록 설정
      setTodos: (todos) => set({ todos }, false, 'setTodos'),

      // 액션: 할 일 추가
      addTodo: (todo) =>
        set((state) => ({ todos: [...state.todos, todo] }), false, 'addTodo'),

      // 액션: 할 일 수정
      updateTodo: (todoId, updates) =>
        set(
          (state) => ({
            todos: state.todos.map((todo) =>
              todo.todoId === todoId ? { ...todo, ...updates } : todo
            ),
          }),
          false,
          'updateTodo'
        ),

      // 액션: 할 일 삭제 (휴지통으로 이동)
      deleteTodo: (todoId) =>
        set(
          (state) => ({
            todos: state.todos.filter((todo) => todo.todoId !== todoId),
          }),
          false,
          'deleteTodo'
        ),

      // 액션: 할 일 완료 상태 토글
      toggleComplete: (todoId) =>
        set(
          (state) => ({
            todos: state.todos.map((todo) =>
              todo.todoId === todoId
                ? { ...todo, isCompleted: !todo.isCompleted }
                : todo
            ),
          }),
          false,
          'toggleComplete'
        ),

      // 액션: 로딩 상태 설정
      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

      // 액션: 에러 설정
      setError: (error) => set({ error }, false, 'setError'),

      // 액션: 에러 초기화
      clearError: () => set({ error: null }, false, 'clearError'),

      // 액션: 모든 상태 초기화
      reset: () =>
        set({ todos: [], isLoading: false, error: null }, false, 'reset'),
    }),
    { name: 'TodoStore' }
  )
);

export default useTodoStore;
