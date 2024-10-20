import FabricCanvas, { TextOptions } from '@/components/studio/fabricCanvas';
import { allFontValues } from '@/constants/studioFonts';
import { atom } from 'jotai';
import FontFaceObserver from 'fontfaceobserver';
import { CopyItem } from '@/types/studio/copy';
import { BannerForm, CurrentStudioInfo, HistoryItemProps } from '@/types/studio';
import { atomWithReset, RESET } from 'jotai/utils';
import { Folder } from '@/types/archive/archive';
import { CancelTokenSource } from 'axios';
import { deleteDraftByReset } from '@/api/draft/draft';

export const fabricCanvasAtom = atom<FabricCanvas | null>(null);

export const studioImageAtom = atom<string | null>(null);

// tool
export const textOptionsAtom = atomWithReset<TextOptions>({
  fontFamily: 'Pretendard',
  fill: '#000',
  fontSize: 24,
  fontStyle: '',
  underline: false,
  linethrough: false,
  textBackgroundColor: '',
  fontWeight: '',
  textAlign: 'left',
});

export const resetCanvasAtom = atom(null, (get, set) => {
  const studioId = get(currentStudioInfoAtom).studioId;
  if (studioId) {
    deleteDraftByReset({ id: studioId });
  }

  const canvas = get(fabricCanvasAtom);
  if (canvas) {
    canvas.resetCanvas();
  }

  set(studioImageAtom, null);
  set(isFabricCanvasReadyAtom, false);
  const resetForm = get(currentStudioInfoAtom).resetFn;
  if (resetForm) {
    resetForm({
      filename: '',
      detail: '',
      product: undefined,
      brand: undefined,
    });
  }

  if (get(isCopyLoadingAtom)) {
    get(copyCancelToken)?.cancel('카피 생성을 취소했습니다');
  }
  set(textOptionsAtom, RESET);
  set(currentStudioInfoAtom, RESET);
  set(copyListAtom, []);
  set(historyListAtom, []);
  set(isFirstImageAtom, true);
  set(isAttributeModifiedAtom, false);
});

export const isRightOpenAtom = atom(true);

export const fontStatusAtom = atom(async () => {
  const observers = allFontValues.map((font) => new FontFaceObserver(font));
  try {
    await Promise.all(observers.map((observer) => observer.load()));
    return 'SUCESS';
  } catch (err) {
    return 'ERROR';
  }
});

export const scaleFactorAtom = atom(1);

export const isFabricCanvasReadyAtom = atom(false);
export const isFirstImageAtom = atom(true);
export const currentStudioInfoAtom = atomWithReset<CurrentStudioInfo<BannerForm>>({
  studioId: '',
  filename: '',
  detail: '',
  copy: null,
  copyPId: '',
  prompts: [],
  copyCount: 0,
  imageId: '',
  resetFn: null,
  history: [],
  keywords: [],
  attribute: '',
  temperature: 1,
});

// details
export const temperatureAtom = atom(
  (get) => get(currentStudioInfoAtom).temperature,
  (get, set, newTemperature: number | string) => {
    const currentStudioInfo = get(currentStudioInfoAtom);
    set(currentStudioInfoAtom, { ...currentStudioInfo, temperature: Number(newTemperature) });
  },
);

export const keywordsAtom = atom(
  (get) => get(currentStudioInfoAtom).keywords,
  (get, set, newKeywords: string[]) => {
    const currentStudioInfo = get(currentStudioInfoAtom);
    set(currentStudioInfoAtom, { ...currentStudioInfo, keywords: newKeywords });
  },
);

// 소구점
export const attributeAtom = atom(
  (get) => get(currentStudioInfoAtom).attribute,
  (get, set, newAttribute: string) => {
    const currentStudioInfo = get(currentStudioInfoAtom);
    set(currentStudioInfoAtom, { ...currentStudioInfo, attribute: newAttribute });
  },
);

export const isAttributeModifiedAtom = atom(false);

export const isOpenDetailSettingsAtom = atom(false); //front only

export const hasStudioIdAtom = atom<boolean>((get) => !!get(currentStudioInfoAtom).studioId);
export const hasCopyAtom = atom<boolean>((get) => get(copyListAtom)?.length >= 5);
export const isGeneratedCopyAtom = atom<boolean>(false);
// copy
export const copyListAtom = atom<CopyItem[]>([]);
export const isCopyLoadingAtom = atom(false);

// copy 생성 요청 취소를 위한 캔슬 토큰
export const copyCancelToken = atom<CancelTokenSource | null>(null);

// history
export const historyListAtom = atom<HistoryItemProps[]>([]);
export const isHistoryLoadingAtom = atom(false);
export const isHistoryAllDataLoadedAtom = atom(false);

export const selectedFolderAtom = atom<Folder | null>(null);
export const folderListAtom = atom<Folder[]>([]);
