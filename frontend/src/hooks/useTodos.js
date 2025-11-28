import { useMemo } from 'react';
import useTodoStore from '../store/todoStore';

const useTodos = () => {
  const {
    todos,
    isLoading,
    error,
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
  } = useTodoStore();

  return useMemo(() => ({
    todos,
    isLoading,
    error,
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
  }), [
    todos,
    isLoading,
    error,
    setTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
  ]);
};

export default useTodos;