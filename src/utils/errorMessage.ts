import { AxiosError } from 'axios';

export const getErrorMessage = (err: unknown): string => {
  if (err instanceof AxiosError) {
    // Axios 에러의 경우
    if (err.response) {
      return err.response.data.msg || '알 수 없는 서버 에러';
    } else if (err.request) {
      return '네트워크 에러';
    } else {
      return err.message || '알 수 없는 Axios 에러';
    }
  } else if (err && typeof err === 'object') {
    if ('msg' in err) {
      return err.msg as string;
    } else {
      if ('message' in err) {
        return err.message as string;
      }
    }
  }

  return '알 수 없는 에러';
};
