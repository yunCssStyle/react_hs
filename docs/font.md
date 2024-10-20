# 스튜디오 폰트 추가/수정

---

## 사용할 모든 폴더를 SCSS 파일에 정의

- 로컬 파일을 사용할 경우 `src/assets/fonts`에 폴더를 추가합니다.
- `src/assets/fonts.scss`에 폰트를 정의합니다. 같은 폰트의 다른 스타일일 경우에도 따로 정의합니다.

## 폰트 정보를 편집

- `src/constants/studioFons.ts`에 폰트를 추가 합니다.

### 폰트 추가

```ts
export const fontList: Record<FontFamily, FontSelectItem> = {
  Pretendard: { value: 'Pretendard', label: 'Pretendard' },
  'LG Smart': { value: 'LG Smart', label: 'LG Smart' },
  Arial: { value: 'Arial', label: 'Arial' },
  'Arial Italic': { value: 'Arial Italic', label: 'Arial Italic' },
  'Arial Narrow': { value: 'Arial Narrow', label: 'Arial Narrow' },
  'Arial Narrow Italic': { value: 'Arial Narrow Italic', label: 'Arial Narrow Italic' },
};
```

`Regular`에 해당되는 기본 폰트를 정의합니다.
value는 scss에 정의된 이름과 동일해야 하며 label은 화면에 표시되는 이름입니다.

### 폰트 스타일

```ts
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
```

폰트 스타일 종류의 추가가 필요하다면 enum값에 추가하세요.

```ts
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
};
```

폰트 스타일별로 폰트 이름(scss에 정의한 것과 동일하게)을 등록해줍니다.

### 스튜디오 페이지에서의 모든 폰트 로딩

- `src/component/studio/studio_editor.tsx` 에서 `fontStatusAtom`을 사용해서, `FontFaceObserver`가 모든 폰트를 브라우저에서 사용할 준비가 되어있는지를 확인합니다. (`Suspense`로 현재는 페이지 영역이 모두 로딩 됨)
- 자세한 내용은 http://fabricjs.com/loadfonts, https://github.com/bramstein/fontfaceobserver
