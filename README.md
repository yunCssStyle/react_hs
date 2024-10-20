# Inspire AI

---

## 개발 환경

```
# install
yarn install

# dev
yarn dev

# build
yarn build:dev  # 개발용
yarn build:stag # 플리 개발기
yarn build:prod # 상용

# storybook
yarn storybook
```

- node version 18

### CI/CI

dev 브랜치에 push 하면 개발기에 배포됨
main 브랜치는 상용과 동일하게 맞춥니다. (배포는 수동으로 s3에 업로드 클라우드 프론트 캐시 무효화 해야 함, yarn build:prod)

## 디렉터리 구조

```
📂 .github/workflows
│   └── 📄 delopy.yml: 워크플로우 정의 파일
│
📂 .storybook: 스토리북 설정
│
📂 src
├── 📂 api
│   └── 📄 axios.ts: axios 인스턴스
│
├── 📂 assets - 에셋을 여기에 추가
│   └── 📂 images: 이미지
│	(....)
│   └── 📂 fonts: 폰트를 이곳에 추가
│
├── 📂 components
│   └── 📂 layouts: 레이아웃에 관련된 컴포넌트
│       └── 📄 MainLayout.tsx: 공통 레이아웃을 여기에 정의
│
├── 📂 constants - 상수
│
├── 📂 context - 글로벌 콘텍스트: 모달 관련
│
├── 📂 pages: 페이지 컴포넌트
│
├── 📂 hooks: 커스텀 hooks
│
├── 📂 atoms: jotai atoms
│
├── 📂 routes
│   └── 📄 AppLayout.tsx: 라우터 설정
│   └── 📄 RoutePaths.ts: path enum을 여기에 정의
│
├── 📂 utils: 유틸 함수들
│
├── 📂 types: 타입스크립트 타입
│
└── 📄 global.scss: 글로벌 스타일을 여기에 정의
```

## STUDIO에 관해

[스튜디오 폰트 추가/수정](docs/font.md)

[스튜디오/Fabric.js에 관해](docs/fabricjs.md)

[기타 참고 사항](docs/settings.md)
