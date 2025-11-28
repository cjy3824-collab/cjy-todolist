import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, HTTP_STATUS } from '../constants/api';
import useGlobalLoadingStore from '../store/globalLoadingStore';

// Generate a unique ID for requests
const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초
});

// Request Interceptor - Access Token 자동 포함
apiClient.interceptors.request.use(
  (config) => {
    // Generate request ID and add to config
    const requestId = generateRequestId();
    config.requestId = requestId;

    // Start global loading
    useGlobalLoadingStore.getState().startLoading(requestId);

    // localStorage에서 액세스 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - 토큰 만료 시 자동 갱신
apiClient.interceptors.response.use(
  (response) => {
    // End loading for this request
    if (response.config.requestId) {
      useGlobalLoadingStore.getState().endLoading(response.config.requestId);
    }
    return response;
  },
  async (error) => {
    // End loading for this request, even on error
    if (error.config?.requestId) {
      useGlobalLoadingStore.getState().endLoading(error.config.requestId);
    }

    const originalRequest = error.config;

    // 401 Unauthorized - 토큰 만료
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새로운 Access Token 발급
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // Refresh Token이 없으면 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/signin';
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken: newAccessToken } = response.data;

        // 새로운 토큰 저장
        localStorage.setItem('accessToken', newAccessToken);

        // 원래 요청에 새 토큰 적용
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 원래 요청 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료되었거나 갱신 실파
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    // 403 Forbidden - 권한 없음
    if (error.response?.status === HTTP_STATUS.FORBIDDEN) {
      console.error('접근 권한이 없습니다.');
    }

    // 500 Internal Server Error
    if (error.response?.status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      console.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
