import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MainLayout } from '../components/layout';
import { Button, Loading, ErrorMessage, Modal } from '../components/common';
import { getUserProfile, getUserStats, changePassword } from '../services/userApi';
import useAuthStore from '../store/authStore';
import useTodoStore from '../store/todoStore';

const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const { todos } = useTodoStore();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  // 초기 설정 로드
  useEffect(() => {
    // 다크모드 상태 초기화
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // 알림 상태 초기화
    const savedNotifications = localStorage.getItem('notifications');
    setIsNotificationsEnabled(savedNotifications === 'enabled');
  }, []);

  // 사용자 프로필 및 통계 조회
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 프로필 데이터 조회
        const profileData = await getUserProfile();
        setProfile(profileData);

        // 통계 데이터 조회
        const statsData = await getUserStats();
        setStats(statsData);
      } catch (err) {
        console.error('프로필 데이터 조회 실패:', err);
        setError('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
    }
  };

  // 다크 모드 토글 (로컬 스토리지 기반)
  const handleDarkModeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast.success('다크 모드가 활성화되었습니다.');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast.success('라이트 모드가 활성화되었습니다.');
    }
  };

  // 알림 토글
  const handleNotificationsToggle = async () => {
    const newEnabled = !isNotificationsEnabled;

    if (newEnabled) {
      // 브라우저 알림 권한 요청
      if ('Notification' in window) {
        try {
          // 현재 권한 상태 확인
          const currentPermission = Notification.permission;

          if (currentPermission === 'granted') {
            // 이미 허용된 경우
            setIsNotificationsEnabled(true);
            localStorage.setItem('notifications', 'enabled');
            toast.success('알림이 활성화되었습니다.');
          } else if (currentPermission === 'denied') {
            // 이미 거부된 경우 - 브라우저 설정에서 수동으로 허용해야 함
            toast.error('알림 권한이 차단되어 있습니다. 브라우저 설정에서 알림 권한을 허용해주세요.', {
              duration: 5000,
            });
          } else {
            // 아직 요청하지 않은 경우 - 권한 요청
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              setIsNotificationsEnabled(true);
              localStorage.setItem('notifications', 'enabled');
              toast.success('알림이 활성화되었습니다.');
            } else {
              toast.error('알림 권한이 거부되었습니다.');
            }
          }
        } catch (err) {
          console.error('알림 권한 요청 실패:', err);
          toast.error('알림 설정에 실패했습니다.');
        }
      } else {
        toast.error('이 브라우저는 알림을 지원하지 않습니다.');
      }
    } else {
      setIsNotificationsEnabled(false);
      localStorage.setItem('notifications', 'disabled');
      toast.success('알림이 비활성화되었습니다.');
    }
  };

  // 비밀번호 변경 폼 핸들러
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('비밀번호가 변경되었습니다.');
      setIsPasswordModalOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('비밀번호 변경 실패:', err);
      toast.error(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 비밀번호 변경 모달 닫기
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  // 계산된 통계
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.isCompleted).length;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">프로필</h1>
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

        {/* 프로필 내용 */}
        {!isLoading && !error && profile && (
          <div className="space-y-8">
            {/* 사용자 정보 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">사용자 정보</h2>
              
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl text-primary-600 font-semibold">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">사용자명</label>
                  <p className="text-gray-900 dark:text-white">{profile.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
                  <p className="text-gray-900 dark:text-white">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">가입일</label>
                  <p className="text-gray-900 dark:text-white">
                    {profile.createdAt ? format(new Date(profile.createdAt), 'yyyy년 M월 d일') : '알 수 없음'}
                  </p>
                </div>

                <Button 
                  variant="secondary" 
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  비밀번호 변경
                </Button>
              </div>
            </div>

            {/* 통계 정보 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">이번 달 통계</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center transition-colors duration-200">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || totalTodos}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">전체</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center transition-colors duration-200">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.completed || completedTodos}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">완료</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center transition-colors duration-200">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pending || (totalTodos - completedTodos)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">미완료</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>완료율</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats?.completed || completedTodos} / {stats?.total || totalTodos}
              </div>
            </div>

            {/* 설정 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">설정</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">다크 모드</span>
                  <button
                    onClick={handleDarkModeToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      isDarkMode ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                    aria-label="다크 모드 토글"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">알림 활성화</span>
                  <button
                    onClick={handleNotificationsToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      isNotificationsEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                    aria-label="알림 토글"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 로그아웃 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <Button
                variant="danger"
                onClick={handleLogout}
                className="w-full"
              >
                로그아웃
              </Button>
            </div>
          </div>
        )}

        {/* 비밀번호 변경 모달 */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={handleClosePasswordModal}
          title="비밀번호 변경"
        >
          <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">최소 8자 이상이어야 합니다.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClosePasswordModal}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
              >
                변경하기
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;