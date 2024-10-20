import Header from '@/components/layouts/Header';
import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useLayoutEffect, useState } from 'react';
import { CustomChildModal, CustomModal } from './modal';
import Spinner from '../spinner/spinner';
import { RoutePaths } from '@/routes/RoutePaths';
import ErrorBoundary from './ErrorBoundary';

const MainLayout = () => {
  const [showHeader, setShowHeader] = useState(false);
  const location = useLocation();
  const currentURL = location.pathname;

  useLayoutEffect(() => {
    if (currentURL == RoutePaths.Login) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
  }, [currentURL]);

  return (
    <div className="layout">
      {showHeader && <Header />}
      {/* 컨텐츠 영역 */}
      <ErrorBoundary>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
      <CustomModal />
      <CustomChildModal />
    </div>
  );
};

export default MainLayout;
