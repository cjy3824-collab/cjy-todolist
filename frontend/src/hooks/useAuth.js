import { useMemo } from 'react';
import useAuthStore from '../store/authStore';

const useAuth = () => {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    logout,
    checkAuth,
    clearError,
    setUser,
    setToken,
  } = useAuthStore();

  return useMemo(() => ({
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    logout,
    checkAuth,
    clearError,
    setUser,
    setToken,
  }), [
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    logout,
    checkAuth,
    clearError,
    setUser,
    setToken,
  ]);
};

export default useAuth;