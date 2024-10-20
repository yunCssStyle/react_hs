/* eslint-disable no-console */

/** 개발모드에서만 출력되는 log */
const devLog = (message: any, ...args: any[]): void => {
  if (import.meta.env.DEV) {
    console.log(message, ...args);
  }
};

export const devWarn = (message: any, ...args: any[]): void => {
  if (import.meta.env.DEV) {
    console.warn(message, ...args);
  }
};

export const devError = (message: any, ...args: any[]): void => {
  if (import.meta.env.DEV) {
    console.error(message, ...args);
  }
};
export default devLog;
