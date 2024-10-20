import instance from '../api/axios';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types/common/api';
import { devWarn } from '@/utils/devLog';
import { useAtomValue } from 'jotai';
import { accessTokenAtom } from '@/atoms/userAuthAtoms';
import { useEffect } from 'react';
import useUserAuth from './useUserAuth';
import useErrorModal from './useErrorModal';
import { CommonErrors } from '@/constants/errorMessages';

const useAxios = () => {
  const token = useAtomValue(accessTokenAtom);
  const userAuth = useUserAuth();
  const { showAxiosErrorModal } = useErrorModal();

  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      if (response.data.code >= 200 && response.data.code < 300) {
        return response;
      } else {
        const code = response.data.code;
        devWarn('에러 코드:', code);
        if (code === 401 || code === 1104) {
          userAuth.logout();
          if (code === 1104) showAxiosErrorModal(new Error(CommonErrors.EXPIRED_TOKEN));
          return new Promise(() => {});
        }
        showAxiosErrorModal(response.data);
        return Promise.reject({ ...response.data, axiosError: true });
      }
    },
    (error: AxiosError) => {
      showAxiosErrorModal(error);
      return Promise.reject(error);
    },
  );

  const requestInterceptor = instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    return () => {
      instance.interceptors.request.eject(requestInterceptor);
    };
  }, [requestInterceptor, token]);
};

export default useAxios;
