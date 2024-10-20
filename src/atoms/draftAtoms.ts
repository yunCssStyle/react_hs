import { DraftContentItem } from '@/types/draft/draft';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 드래프트 날짜 리스트
export const draftDatesWithStorageAtom = atomWithStorage<string[] | null>('draftDates', null);

// 선택한 날짜 데이터 리스트
export const selectedDateContentItem = atom<DraftContentItem[] | null>(null);
