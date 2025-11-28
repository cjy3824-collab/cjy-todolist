import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

/**
 * Header 컴포넌트
 * 로고, 네비게이션 메뉴, 로그아웃 버튼 포함
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('로그아웃되었습니다.');
      navigate('/signin');
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const navLinks = [
    { to: '/todos', label: 'Todos', icon: '📝' },
    { to: '/calendar', label: 'Calendar', icon: '📅' },
    { to: '/trash', label: 'Trash', icon: '🗑️' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link
            to="/todos"
            className="flex items-center space-x-2 text-xl font-bold text-primary-500 hover:text-primary-600 transition-colors"
          >
            <span>📋</span>
            <span className="hidden sm:inline">할 일을 미루지 말자</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* 사용자 정보 및 로그아웃 */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-600">
                {user.username || user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-error-500 transition-colors"
            >
              로그아웃
            </button>
          </div>

          {/* 모바일 햄버거 메뉴 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {user && (
                <div className="px-4 py-2 text-sm text-gray-600">
                  {user.username || user.email}
                </div>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:text-error-500 font-medium transition-colors"
              >
                🚪 로그아웃
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
