# 기타 참고 사항

## 프롬프트 설정/히스토리

- `react-hook-form`을 사용하고 있습니다.
- `제목`과 `설명`을 제외한 나머지 부분들은 조건에 따라 비활성화 됩니다.

### 프롬프트 활성화/비활성화 조건

- generate를 최초에 클릭하여 카피들이 생성됨 -> 비활성화
- 우측에서 히스토리를 불러왔을 때 -> 비활성화
- Draft에 임시저장된 파일을 불러왔을 때 -> 비활성화
- 아카이브-라이브러리에서 파일을 열었을 때 -> **활성화**

`setIsGeneratedCopyAtom` 값이 `true`면 비활성화 됩니다.

### 키워드

- **키워드에 ',' (콤마)가 들어가면 안 됩니다.**

### 히스토리

- `intersectionObserver`로 무한스크롤이 구현되어 있습니다.

## 스튜디오

### 스튜디오 리셋

- 다른 페이지로 가거나 세션이 만료되었을 때는 스튜디오 내용이 보존됩니다.
- **로그아웃을 클릭해 직접 로그아웃 했을 때**는 스튜디오를 초기화 해야 합니다.
- 리셋을 하면 스튜디오 내용을 초기화 하고 해당 스튜디오 id에 해당하는 `Draft`도 지웁니다.

### 저장

- `generate`를 클릭하면 스튜디오 아이디가 생성되고 카피리스트를 생성합니다.
- 이미지만 업로드 한 상태로는 저장을 하지 않고 draft 저장도 하지 않습니다.
- 카피는 선택하지 않아도 저장이 가능합니다. (이 경우 히스토리 미리보기에 카피가 보이지 않음)

### Draft 임시저장

- studio id가 존재할 때 (generate를 한 적이 있을 때)만 5분에 한번 저장합니다.

## 로그인

- 비밀번호를 `window.btoa`로 인코딩합니다.
- 아이디 저장(remember me)을 하면 로컬스토리지에 저장합니다.

### 권한이 필요한 페이지

- `AppRouter.tsx`에서 권한이 필요한 페이지를 설정할 수 있습니다.

```jsx
<Routes>
  <Route element={<MainLayout />}>
    <Route path={RoutePaths.Home} element={<Home />} />

    <Route element={<PrivateRoute authentication={true} />}>
      <Route path={RoutePaths.Library} element={<Library />} />
      <Route path={RoutePaths.Draft} element={<Draft />} />
      <Route path={RoutePaths.Studio} element={<Studio />} />
    </Route>

    <Route element={<PrivateRoute authentication={false} />}>
      <Route path={RoutePaths.Login} element={<Login />} />
    </Route>

    <Route path="/*" element={<h1>페이지를 찾을 수 없습니다.</h1>} />
  </Route>
</Routes>
```

Private로 감싸면 됩니다.

- `authentication`이 true: 로그인 해야 함
- `authentication`이 false: 로그인을 하지 않아야만 함 (로그아웃 상태여야 함)
- 감싸지 않은 경우: 로그인 여부와 상관 없음

## enum

### `src/constants/errorMessage.ts`

- ValidationErrors - 유효성 검증 관련 메세지
- CommonErrors - 공통 에러 메세지

### `src/infoMessage.ts`

- infoMessage - 정보 관련 메세지
- userActionPrompt - 액션 실행 여부를 묻는 메세지

### `src/routes/RoutePaths.ts`

router path
