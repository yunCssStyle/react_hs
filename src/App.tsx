import AppRouter from '@/routes/AppRouter';
import useAxios from '@/hooks/useAxios';
import { getUserInfo } from './api/userAuth';

import './global.scss';
import 'mac-scrollbar/dist/mac-scrollbar.css';
import { useCallback, useEffect } from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import { isLoginAtom, userInfoAtom } from './atoms/userAuthAtoms';
import { foldersWithStorageAtom } from '@/atoms/folderAtoms';
import { getArchiveFolderList } from './api/archive/archive';

function App() {
  const isLogin = useAtomValue(isLoginAtom);
  const setUserInfo = useSetAtom(userInfoAtom);
  const setFolderList = useSetAtom(foldersWithStorageAtom);

  // 로그인 정보
  const syncUserAuth = useCallback(async () => {
    const { data: userInfo } = await getUserInfo();
    setUserInfo(userInfo);
  }, [setUserInfo]);

  // 폴더 가져오기
  const getFolders = useCallback(async () => {
    const data = await getArchiveFolderList();
    setFolderList(data.data);
  }, [setFolderList]);

  useEffect(() => {
    if (isLogin) {
      syncUserAuth();
      getFolders();
    }
  }, [isLogin, syncUserAuth, getFolders]);

  useAxios();
  return <AppRouter />;
}

export default App;
