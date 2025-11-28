import { useMemo } from 'react';
import useTrashStore from '../store/trashStore';

const useTrash = () => {
  const {
    trashedTodos,
    isLoading,
    error,
    setTrash,
    restoreTodo,
    permanentlyDelete,
    emptyTrash,
    setLoading,
    setError,
    clearError,
    reset,
  } = useTrashStore();

  return useMemo(() => ({
    trashedTodos,
    isLoading,
    error,
    setTrash,
    restoreTodo,
    permanentlyDelete,
    emptyTrash,
    setLoading,
    setError,
    clearError,
    reset,
  }), [
    trashedTodos,
    isLoading,
    error,
    setTrash,
    restoreTodo,
    permanentlyDelete,
    emptyTrash,
    setLoading,
    setError,
    clearError,
    reset,
  ]);
};

export default useTrash;