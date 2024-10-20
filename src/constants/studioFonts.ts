export type FontFamily = 'LG Smart' | 'Pretendard' | 'Arial' | 'Arial Narrow' | 'Arial Italic' | 'Arial Narrow Italic';

interface FontStyle {
  Regular: FontFamily;
  Light?: string;
  SemiBold?: string;
  Bold?: string;
  ExtraBold?: string;
  ExtraLight?: string;
  Medium?: string;
  Thin?: string;
  Black?: string;
}
type FontStyleMap = Record<FontFamily, FontStyle>;

const fontStyles: FontStyleMap = {
  Pretendard: {
    Regular: 'Pretendard',
    Thin: 'Pretendard Thin',
    ExtraLight: 'Pretendard Extra Light',
    Light: 'Pretendard Light',
    Medium: 'Pretendard Medium',
    SemiBold: 'Pretendard SemiBold',
    Bold: 'Pretendard Bold',
    ExtraBold: 'Pretendard Extra Bold',
    Black: 'Pretendard Black',
  },
  'LG Smart': {
    Regular: 'LG Smart',
    Light: 'LG Smart Light',
    SemiBold: 'LG Smart SemiBold',
    Bold: 'LG Smart Bold',
  },
  Arial: {
    Regular: 'Arial',
    Bold: 'Arial Bold',
  },
  'Arial Italic': {
    Regular: 'Arial Italic',
    Bold: 'Arial Italic Bold',
  },
  'Arial Narrow': {
    Regular: 'Arial Narrow',
    Black: 'Arial Narrow Black',
  },
  'Arial Narrow Italic': {
    Regular: 'Arial Narrow Italic',
    Bold: 'Arial Narrow Italic Bold',
  },
};

export type FontSelectItem = { value: FontFamily; label: string };
export type FontStyleSelectItem = { value: string; label: string };
export type FontSizeSelectItem = { value: number; label: number };

export const fontList: Record<FontFamily, FontSelectItem> = {
  Pretendard: { value: 'Pretendard', label: 'Pretendard' },
  'LG Smart': { value: 'LG Smart', label: 'LG Smart' },
  Arial: { value: 'Arial', label: 'Arial' },
  'Arial Italic': { value: 'Arial Italic', label: 'Arial Italic' },
  'Arial Narrow': { value: 'Arial Narrow', label: 'Arial Narrow' },
  'Arial Narrow Italic': { value: 'Arial Narrow Italic', label: 'Arial Narrow Italic' },
};

const fontSelectOptions: FontSelectItem[] = Object.values(fontList);

const getStyles = (font: FontFamily) => {
  const styles: FontStyle = fontStyles[font];
  if (styles) {
    const styleEntries = Object.entries(styles);

    const fontStyleSelectItems: FontStyleSelectItem[] = styleEntries.map(([label, value]) => ({
      value,
      label,
    }));

    return fontStyleSelectItems;
  }
  return [];
};

const fontSize: FontSizeSelectItem[] = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72, 88, 96,
].map((number) => ({
  value: number,
  label: number,
}));

export const allFontValues: string[] = Object.values(fontStyles)
  .map((fontObj) => Object.values(fontObj))
  .reduce((acc, fonts) => acc.concat(fonts), []);

export { fontSelectOptions, fontStyles, getStyles, fontSize };
