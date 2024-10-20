import { ContentItem, Folder } from '@/types/archive/archive';
import { atomWithStorage } from 'jotai/utils';

// 폴더 데이터를 저장할 상태를 생성합니다.
export const foldersWithStorageAtom = atomWithStorage<Folder[] | null>('folders', null);

/**
 * @description Folders 사이드바에서 선택된 폴더
 */
export const selectedFolderAtom = atomWithStorage<Folder | null>('selectedFolder', null);

/**
 * @description location_box에서 선택된 이동 위치 폴더
 */
export const selectedFolderLocationAtom = atomWithStorage<Folder | null>('destination_folder', null);

/**
 * @description Untitled Folder 명 개수
 */
export const untitledFolderCount = atomWithStorage<number | null>('untitledFolderCount', null);

/**
 * @description 아카이브 리스트
 */
export const contentAndFolder = atomWithStorage<ContentItem[] | null>('contentList', null);
