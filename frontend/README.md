# cjy-todoList 프론트엔드

cjy-todoList는 사용자 인증 기반의 개인 할 일 관리 웹 애플리케이션입니다. 사용자는 자신의 할 일을 체계적으로 생성, 관리하고, 캘린더 뷰를 통해 시각화할 수 있으며, 국경일 정보와 통합하여 일정을 한눈에 파악할 수 있습니다.

## 기술 스택

- **프레임워크**: React 19.2.0
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS
- **HTTP 클라이언트**: Axios
- **라우팅**: React Router
- **빌드 도구**: Vite
- **날짜 처리**: date-fns

## 설치 및 실행 방법

1. 노드.js와 npm이 설치되어 있어야 합니다.

2. 레포지토리를 클론하거나 다운로드합니다.

3. 프로젝트 디렉토리에서 다음 명령어를 실행합니다:

```bash
npm install
```

4. 환경 변수 파일을 설정합니다. `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

5. 개발 서버를 시작합니다:

```bash
npm run dev
```

6. 브라우저에서 `http://localhost:5173`으로 접속합니다.

## 환경 변수 설정 가이드

- `VITE_API_BASE_URL`: 백엔드 API 서버의 주소를 지정합니다. (기본값: http://localhost:3000/api)

## 빌드 및 배포 방법

1. 프로덕션용 빌드를 생성하려면 다음 명령어를 사용합니다:

```bash
npm run build
```

2. 빌드된 파일은 `dist` 디렉토리에 생성됩니다.

3. Vercel 배포를 위해서는 `vercel.json` 파일이 이미 SPA 라우팅을 위해 설정되어 있습니다.

## 테스트 실행 방법

1. 단위 테스트를 실행하려면 다음 명령어를 사용합니다:

```bash
npm run test
```

2. 테스트 커버리지를 확인하려면 다음 명령어를 사용합니다:

```bash
npm run test:coverage
```

3. 테스트 UI를 사용하려면 다음 명령어를 사용합니다:

```bash
npm run test:ui
```

## 주요 기능

- 사용자 인증 (회원가입, 로그인, 로그아웃)
- 할 일 CRUD (생성, 조회, 수정, 삭제)
- 할 일 완료 상태 토글
- 휴지통 기능 (삭제된 할 일 관리 및 복구)
- 캘린더 뷰 (월별 할 일 표시)
- 국경일 표시
- 할 일 검색 및 필터링

## 디렉토리 구조

```
src/
├── components/     # 재사용 가능한 UI 컴포넌트
├── pages/          # 라우팅되는 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── store/          # Zustand 상태 관리
├── services/       # API 서비스
├── routes/         # 라우팅 설정
├── constants/      # 상수 정의
├── utils/          # 유틸리티 함수
└── styles/         # 전역 스타일
```

## 프로젝트 특징

- 반응형 웹 디자인으로 모바일 및 데스크톱에서 모두 사용 가능
- 접근성 고려 (ARIA 라벨, 키보드 네비게이션 지원)
- 성능 최적화 (React.memo, 콜백 최적화, 코드 스플리팅)
- 최신 React 기술 (Hooks, Suspense 등) 사용
- 모던 CSS (Tailwind CSS) 활용