import Header from './Header';

/**
 * MainLayout 컴포넌트
 * Header + Content 영역으로 구성
 * @param {Object} props
 * @param {ReactNode} props.children - 페이지 내용
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
