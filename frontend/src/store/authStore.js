import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { signIn as signInApi, signOut as signOutApi } from '../services/authApi';

const useAuthStore = create(
  devtools(
    (set) => ({
      // 상태
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 액션: 사용자 정보 설정
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }, false, 'setUser'),

      // 액션: 토큰 설정
      setToken: (accessToken) =>
        set({ accessToken, isAuthenticated: !!accessToken }, false, 'setToken'),

      // 액션: 로그인
      signIn: async (credentials) => {
        set({ isLoading: true, error: null }, false, 'signIn/start');
        try {
          const { user, accessToken } = await signInApi(credentials);
          set(
            {
              user,
              accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            },
            false,
            'signIn/success'
          );
          return { user, accessToken };
        } catch (error) {
          set(
            {
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || '로그인에 실패했습니다.',
            },
            false,
            'signIn/error'
          );
          throw error;
        }
      },

      // 액션: 로그아웃
      logout: async () => {
        set({ isLoading: true }, false, 'logout/start');
        try {
          await signOutApi();
          set(
            {
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            },
            false,
            'logout/success'
          );
        } catch (error) {
          console.error('로그아웃 중 오류:', error);
          // 로그아웃은 실패해도 상태를 초기화
          set(
            {
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            },
            false,
            'logout/error'
          );
        }
      },

      // 액션: 인증 상태 확인
      checkAuth: () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          set(
            { accessToken, isAuthenticated: true },
            false,
            'checkAuth/authenticated'
          );
        } else {
          set(
            {
              user: null,
              accessToken: null,
              isAuthenticated: false,
            },
            false,
            'checkAuth/unauthenticated'
          );
        }
      },

      // 액션: 에러 초기화
      clearError: () => set({ error: null }, false, 'clearError'),
    }),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;
