import { UserInfo } from '@/types/userAuth';
import { accessTokenAtom, userInfoAtom } from '@/atoms/userAuthAtoms';
import { useAtom, useSetAtom } from 'jotai';

const useUserAuth = () => {
  const [, setUserInfo] = useAtom(userInfoAtom);
  const setToken = useSetAtom(accessTokenAtom);
  const login = (userInfo: UserInfo, accessToken: string) => {
    setUserInfo(userInfo);
    setToken(accessToken);
  };

  const logout = () => {
    setUserInfo(null);
    setToken(null);
    window.localStorage.removeItem('access_token');
  };

  return { login, logout };
};

export default useUserAuth;
