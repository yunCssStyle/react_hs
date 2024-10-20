import { PropsWithChildren } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { RoutePaths } from '@/routes/RoutePaths';

const PrivateRoute: React.FC<PropsWithChildren<{ authentication: boolean }>> = ({ authentication }) => {
  const isLogin = window.localStorage.getItem('access_token');

  if (authentication) {
    return !isLogin ? <Navigate replace to={RoutePaths.Login} /> : <Outlet />;
  } else {
    return !isLogin ? <Outlet /> : <Navigate replace to={RoutePaths.Home} />;
  }
};

export default PrivateRoute;
