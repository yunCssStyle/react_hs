import { atom } from 'jotai';
import { UserInfo } from '@/types/userAuth';
import { atomWithStorage } from 'jotai/utils';

export const userInfoAtom = atom<UserInfo | null>(null);

export const accessTokenAtom = atomWithStorage<string | null>('access_token', null);

export const rememberedEmailAtom = atomWithStorage<string | null>('remembered_email', null);

export const isLoginAtom = atom((get) => {
  return !!get(accessTokenAtom);
});
