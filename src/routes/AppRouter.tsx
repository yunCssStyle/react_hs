import { Route, Routes } from 'react-router-dom';

/** 공통 레이아웃 */
import MainLayout from '@/components/layouts/MainLayout';

/** path enum */
import { RoutePaths } from './RoutePaths';
import { lazy } from 'react';

import PrivateRoute from './PrivateRoute';

const Home = lazy(() => import('@/pages/Home'));
const Studio = lazy(() => import('@/pages/Studio'));
const Login = lazy(() => import('@/pages/Login'));
const Library = lazy(() => import('@/pages/Library'));
const Draft = lazy(() => import('@/pages/Draft'));

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={RoutePaths.Home} element={<Home />} />

        <Route element={<PrivateRoute authentication={true} />}>
          <Route path={RoutePaths.Library} element={<Library />} />
          <Route path={RoutePaths.Draft} element={<Draft />} />
          <Route path={RoutePaths.Studio} element={<Studio />} />
        </Route>

        <Route element={<PrivateRoute authentication={false} />}>
          <Route path={RoutePaths.Login} element={<Login />} />
        </Route>

        <Route path="/*" element={<h1>페이지를 찾을 수 없습니다.</h1>} />
      </Route>
    </Routes>
  );
};
export default AppRouter;
