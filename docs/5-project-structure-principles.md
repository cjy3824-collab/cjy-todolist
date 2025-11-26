# cjy-todoList 프로젝트 구조 설계 원칙

---

## 문서 정보

| 항목       | 내용                           |
| ---------- | ------------------------------ |
| **문서명** | 프로젝트 구조 설계 원칙        |
| **버전**   | 1.1                            |
| **작성일** | 2025-11-25                     |
| **작성자** | Claude (Architecture Reviewer) |
| **상태**   | 수정                           |

---

## 목차

1. [최상위 공통 원칙](#1-최상위-공통-원칙)
2. [의존성/레이어 원칙](#2-의존성레이어-원칙)
3. [코드/네이밍 원칙](#3-코드네이밍-원칙)
4. [테스트/품질 원칙](#4-테스트품질-원칙)
5. [설정/보안/운영 원칙](#5-설정보안운영-원칙)
6. [프론트엔드 디렉토리 구조](#6-프론트엔드-디렉토리-구조)
7. [백엔드 디렉토리 구조](#7-백엔드-디렉토리-구조)
8. [부록: 파일 명명 규칙](#부록-파일-명명-규칙)

---

## 1. 최상위 공통 원칙

### 1.1 아키텍처 철학

**핵심 가치**:

- **단순성 (Simplicity)**: 불필요한 복잡도를 제거하고 명확한 구조 유지
- **명확성 (Clarity)**: 코드의 의도가 명확하게 드러나도록 작성
- **유지보수성 (Maintainability)**: 변경과 확장이 용이한 구조
- **일관성 (Consistency)**: 프로젝트 전체에 일관된 패턴 적용

**설계 철학**:

```
"복잡함보다 단순함을, 영리함보다 명확함을, 추상화보다 구체성을 우선한다."
```

### 1.2 SOLID 원칙 적용

#### S - 단일 책임 원칙 (Single Responsibility Principle)

각 모듈, 클래스, 함수는 단 하나의 책임만 가져야 합니다.

#### O - 개방-폐쇄 원칙 (Open-Closed Principle)

확장에는 열려있고 수정에는 닫혀있어야 합니다.

#### L - 리스코프 치환 원칙 (Liskov Substitution Principle)

하위 타입은 상위 타입을 대체할 수 있어야 합니다.

#### I - 인터페이스 분리 원칙 (Interface Segregation Principle)

클라이언트는 자신이 사용하지 않는 메서드에 의존하지 않아야 합니다.

#### D - 의존성 역전 원칙 (Dependency Inversion Principle)

고수준 모듈은 저수준 모듈에 의존하지 않아야 하며, 둘 다 추상화에 의존해야 합니다.

### 1.3 DRY, KISS, YAGNI 원칙

#### DRY (Don't Repeat Yourself)

중복을 제거하고 재사용 가능한 코드를 작성합니다. 공통 로직은 별도의 함수나 모듈로 추출합니다.

#### KISS (Keep It Simple, Stupid)

단순하고 이해하기 쉬운 코드를 작성합니다. 불필요한 복잡도를 피합니다.

#### YAGNI (You Aren't Gonna Need It)

현재 필요하지 않은 기능은 구현하지 않습니다. 미래의 요구사항을 예측하지 않습니다.

### 1.4 모듈화 및 관심사의 분리

**계층별 책임 분리**:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (UI)             │
│  - 사용자 인터랙션 처리                      │
│  - 화면 렌더링                               │
│  - 입력 검증 (클라이언트)                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Application Layer (Services)        │
│  - 비즈니스 로직 처리                        │
│  - 데이터 변환                               │
│  - 트랜잭션 관리                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Data Access Layer (Models)          │
│  - 데이터 CRUD                               │
│  - 쿼리 실행                                 │
│  - 데이터 매핑                               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Database (PostgreSQL)               │
└─────────────────────────────────────────────┘
```

---

## 2. 의존성/레이어 원칙

### 2.1 레이어드 아키텍처

프로젝트는 명확한 레이어 구조를 따릅니다.

```
┌──────────────────────────────────────────────────┐
│                 Presentation Layer               │
│  React Components, Pages, UI Logic               │
│  의존: Service Layer, State Management           │
└──────────────────────────────────────────────────┘
                      ↓ (HTTP/API)
┌──────────────────────────────────────────────────┐
│                   API Layer                      │
│  Controllers, Routes, Request/Response Handling  │
│  의존: Service Layer, Middleware                 │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│                 Service Layer                    │
│  Business Logic, Use Cases, Data Transformation  │
│  의존: Data Access Layer, External Services      │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│              Data Access Layer                   │
│  Models, Repositories, Database Queries          │
│  의존: Database, ORM                             │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│                   Database                       │
│  PostgreSQL, Data Storage                        │
└──────────────────────────────────────────────────┘
```

### 2.2 의존성 방향 규칙

**원칙**: 상위 레이어는 하위 레이어에만 의존할 수 있습니다.

**허용되는 의존성**:

```
Controller → Service → Model ✓
Component → Service (API) ✓
Service → Utils ✓
```

**금지되는 의존성**:

```
Model → Service ✗
Service → Controller ✗
Utils → Service ✗
```

### 2.3 순환 참조 방지

**해결 방법**:

1. **공통 모듈 추출**: 두 모듈이 서로 참조해야 하는 경우, 공통 기능을 별도 모듈로 분리
2. **의존성 주입**: 런타임에 의존성을 주입하여 순환 참조 제거
3. **인터페이스 분리**: 추상화 레이어를 통해 의존성 역전

### 2.4 인터페이스 분리 원칙

각 모듈은 명확한 Public API를 제공합니다.

**원칙**:

- 최소한의 public API만 export
- 내부 구현 세부사항은 노출하지 않음
- 모듈 사용자에게 필요한 인터페이스만 제공

---

## 3. 코드/네이밍 원칙

### 3.1 네이밍 컨벤션

#### 변수 및 함수명

**JavaScript/Node.js**:

- **camelCase** 사용
- 동사 + 명사 조합 (함수의 경우)
- 명사 또는 형용사 (변수의 경우)
- Boolean 변수: is, has, can, should 등의 prefix 사용

**상수**:

- 대문자 + 언더스코어 사용
- 예: MAX_TITLE_LENGTH, API_BASE_URL, DEFAULT_PAGE_SIZE

#### 클래스 및 컴포넌트명

**PascalCase** 사용:

- React Components: TodoList, TodoItem, CalendarView
- Classes: TodoService, UserRepository, AuthMiddleware

#### 파일명

**프론트엔드 (React)**:

- 컴포넌트: PascalCase (TodoList.jsx)
- Hook: camelCase (useTodos.js)
- 유틸리티: camelCase (dateUtils.js)
- Store: camelCase (todoStore.js)
- Service: camelCase (todoService.js)

**백엔드 (Node.js)**:

- 모든 파일: camelCase
- 명확한 suffix 사용 (Controller, Service, Model, etc.)

### 3.2 코드 스타일 가이드

#### 들여쓰기 및 포맷팅

- 2 spaces 들여쓰기 (Prettier 기본값)
- 한 줄당 최대 80-100자
- 긴 체이닝은 줄바꿈 사용

#### 중괄호 규칙

- 항상 중괄호 사용 (조건문이 한 줄이어도)
- 일관된 스타일 유지

#### 문자열

- 템플릿 리터럴 사용 (동적 문자열)
- 단순 문자열은 작은따옴표 사용

#### 함수 선언

- Named function: 재사용 가능한 함수
- Arrow function: 콜백, 간단한 로직
- Async/await 사용: 비동기 처리

### 3.3 주석 작성 규칙

#### JSDoc 주석

- 함수의 목적, 매개변수, 반환값, 예외 설명
- 복잡한 비즈니스 로직에 대한 상세 설명

#### 인라인 주석

- 필요한 경우에만 작성 (코드가 명확하면 주석 불필요)
- 복잡한 로직이나 비즈니스 규칙 설명
- 불필요한 주석은 지양

#### TODO 주석

- TODO: 향후 구현 필요
- FIXME: 버그 수정 필요
- HACK: 임시 해결책, 추후 리팩토링 필요
- NOTE: 중요한 설명이나 참고사항

### 3.4 ESLint/Prettier 설정

**ESLint**: 코드 품질 및 스타일 규칙 적용

- JavaScript 표준 규칙
- React 및 React Hooks 규칙
- 사용하지 않는 변수 경고
- console 사용 제한 (warn, error만 허용)

**Prettier**: 코드 포맷팅 자동화

- 세미콜론 사용
- 작은따옴표 사용
- 2 spaces 탭
- 80자 줄 길이

---

## 4. 테스트/품질 원칙

### 4.1 테스트 전략

#### 테스트 피라미드

```
         /\
        /  \       E2E Tests (10%)
       /____\      - 주요 사용자 플로우
      /      \
     /________\    Integration Tests (30%)
    /          \   - API 통합, DB 연동
   /____________\
  /              \ Unit Tests (60%)
 /________________\ - 함수, 컴포넌트, 서비스
```

#### 레이어별 테스트 전략

**프론트엔드**:

- **Unit Tests**: 개별 컴포넌트, 커스텀 훅, 유틸리티 함수
- **Integration Tests**: 페이지 단위, API 통합
- **E2E Tests**: 주요 사용자 시나리오 (로그인 → 할 일 생성 → 완료)

**백엔드**:

- **Unit Tests**: Service, Model, Utility 함수
- **Integration Tests**: API 엔드포인트, DB 쿼리
- **E2E Tests**: 전체 API 플로우

### 4.2 테스트 작성 가이드

#### Unit Test

- 개별 함수/컴포넌트의 기능 검증
- Mock을 활용한 의존성 격리
- 엣지 케이스 및 에러 시나리오 포함

#### Integration Test

- API 엔드포인트 통합 테스트
- 데이터베이스 연동 테스트
- 인증/인가 플로우 검증

### 4.3 테스트 커버리지 목표

| 레이어            | 목표 커버리지 | 우선순위 |
| ----------------- | ------------- | -------- |
| Services          | 90%+          | High     |
| Models            | 80%+          | High     |
| Controllers       | 70%+          | Medium   |
| Utils             | 90%+          | High     |
| Components        | 70%+          | Medium   |
| Hooks             | 80%+          | High     |
| Routes/Middleware | 80%+          | High     |

### 4.4 코드 리뷰 프로세스

#### 리뷰 체크리스트

**기능성**:

- [ ] 요구사항을 충족하는가?
- [ ] 비즈니스 규칙을 준수하는가?
- [ ] 엣지 케이스를 처리하는가?

**코드 품질**:

- [ ] 코드가 읽기 쉽고 이해하기 쉬운가?
- [ ] 네이밍이 명확하고 일관성 있는가?
- [ ] 중복 코드가 없는가?
- [ ] 함수/컴포넌트가 단일 책임을 가지는가?

**테스트**:

- [ ] 적절한 테스트가 작성되었는가?
- [ ] 테스트가 의미 있는가?
- [ ] 커버리지가 목표를 충족하는가?

**보안**:

- [ ] 입력값 검증이 적절한가?
- [ ] 인증/인가가 적절히 구현되었는가?
- [ ] 민감한 정보가 노출되지 않는가?

**성능**:

- [ ] 불필요한 렌더링/연산이 없는가?
- [ ] 데이터베이스 쿼리가 최적화되었는가?
- [ ] 메모리 누수 가능성이 없는가?

#### Pull Request 템플릿

- 변경 사항 설명
- 변경 이유
- 관련 이슈
- 테스트 방법
- 스크린샷 (UI 변경 시)
- 체크리스트

### 4.5 CI/CD 품질 게이트

**필수 검증 항목**:

- Linter 통과
- 모든 테스트 통과
- 코드 커버리지 임계값 충족
- 빌드 성공

---

## 5. 설정/보안/운영 원칙

### 5.1 환경 변수 관리

#### 환경 변수 구조

**프론트엔드**:

- API 설정 (베이스 URL, 앱 이름)
- Feature Flags
- 민감한 정보는 프론트엔드에 넣지 않음

**백엔드**:

- 서버 설정 (NODE_ENV, PORT, HOST)
- 데이터베이스 설정
- 인증 설정 (JWT Secret, Bcrypt Rounds)
- 보안 설정 (CORS, Rate Limiting)
- 로깅 설정

#### 환경별 설정

- development: 개발 환경 설정
- production: 프로덕션 환경 설정
- test: 테스트 환경 설정

#### 설정 로드 패턴

- dotenv 사용
- 필수 환경 변수 검증
- 타입 변환 (문자열 → 숫자 등)
- 기본값 제공

### 5.2 시크릿 관리

#### 시크릿 관리 원칙

1. **절대 커밋하지 않기**: .env 파일을 .gitignore에 추가
2. **로컬 개발**: .env 파일 사용
3. **프로덕션**: Vercel/Supabase 환경 변수 사용
4. **팀 공유**: 암호화된 채널을 통해 공유

#### 시크릿 로테이션

- JWT Secret 로테이션 시 고려사항
- Dual-token period: 양쪽 시크릿으로 검증
- 점진적 마이그레이션

### 5.3 로깅 전략

#### 로깅 레벨

- **error**: 시스템 오류, 즉시 조치 필요
- **warn**: 경고, 주의 필요
- **info**: 중요 이벤트 (로그인, 생성 등)
- **http**: HTTP 요청/응답
- **debug**: 디버깅 정보

#### 로깅 구현

- Winston 또는 유사 라이브러리 사용
- 구조화된 로깅 (JSON 형식)
- 콘솔 및 파일 출력
- 로그 레벨별 필터링

#### 민감 정보 마스킹

- password, token, secret, authorization 등 민감 필드 마스킹
- 로그에 개인정보 노출 방지

### 5.4 에러 핸들링

#### 에러 클래스 정의

- AppError: 기본 에러 클래스
- ValidationError: 입력 검증 오류 (400)
- AuthenticationError: 인증 실패 (401)
- AuthorizationError: 권한 없음 (403)
- NotFoundError: 리소스 없음 (404)
- ConflictError: 충돌 (409)

#### 에러 핸들링 미들웨어

- 에러 로깅
- HTTP 상태 코드 설정
- 에러 메시지 포맷팅
- 개발 환경에서만 스택 트레이스 노출

#### 전역 에러 처리

- 404 에러 처리
- 처리되지 않은 Promise rejection
- 처리되지 않은 예외

### 5.5 보안 체크리스트

#### 인증/인가

- [ ] JWT 토큰 사용 (Access + Refresh)
- [ ] 토큰 만료 시간 적절히 설정 (Access: 15분, Refresh: 7일)
- [ ] 비밀번호 bcrypt 암호화 (최소 10 rounds)
- [ ] 민감한 경로에 인증 미들웨어 적용
- [ ] 사용자 권한 검증 (자신의 리소스만 접근)

#### 입력 검증

- [ ] 모든 사용자 입력 검증
- [ ] SQL Injection 방지 (Prepared Statements)
- [ ] XSS 방지 (입력 이스케이프)
- [ ] 파일 크기 제한
- [ ] 데이터 타입 검증

#### Rate Limiting

- API 엔드포인트별 요청 제한
- 로그인 시도 제한
- IP 기반 제한

#### CORS 설정

- 허용된 origin만 요청 허용
- credentials 옵션 설정
- 허용 메서드 및 헤더 명시

#### 보안 헤더

- Helmet 사용
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options, X-Content-Type-Options 등

#### SQL Injection 방지

- Parameterized queries 사용
- 문자열 연결로 쿼리 생성 금지
- ORM 사용 권장

---

## 6. 프론트엔드 디렉토리 구조

### 6.1 전체 구조

```
frontend/
├── public/                    # 정적 파일
│   ├── index.html
│   ├── favicon.ico
│   └── assets/                # 이미지, 폰트 등
│       ├── images/
│       │   ├── logo.png
│       │   └── icons/
│       └── fonts/
│
├── src/
│   ├── main.jsx               # 애플리케이션 진입점
│   ├── App.jsx                # 루트 컴포넌트
│   │
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Loading/
│   │   │   └── ErrorBoundary/
│   │   │
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── Navigation/
│   │   │
│   │   └── features/          # 기능별 컴포넌트
│   │       ├── Todo/
│   │       │   ├── TodoList/
│   │       │   ├── TodoItem/
│   │       │   ├── TodoForm/
│   │       │   └── TodoFilter/
│   │       │
│   │       ├── Calendar/
│   │       │   ├── CalendarView/
│   │       │   ├── CalendarCell/
│   │       │   └── CalendarHeader/
│   │       │
│   │       └── Trash/
│   │           ├── TrashList/
│   │           └── TrashItem/
│   │
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── HomePage/
│   │   ├── LoginPage/
│   │   ├── RegisterPage/
│   │   ├── TodosPage/
│   │   ├── CalendarPage/
│   │   ├── TrashPage/
│   │   └── NotFoundPage/
│   │
│   ├── hooks/                 # 커스텀 훅
│   │   ├── useTodos.js
│   │   ├── useAuth.js
│   │   ├── useCalendar.js
│   │   ├── useDebounce.js
│   │   └── useLocalStorage.js
│   │
│   ├── stores/                # Zustand 상태 관리
│   │   ├── todoStore.js
│   │   ├── authStore.js
│   │   ├── uiStore.js
│   │   └── index.js
│   │
│   ├── services/              # API 호출 서비스
│   │   ├── api.js             # axios 인스턴스 설정
│   │   ├── todoService.js
│   │   ├── authService.js
│   │   ├── calendarService.js
│   │   └── trashService.js
│   │
│   ├── utils/                 # 유틸리티 함수
│   │   ├── dateUtils.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── helpers.js
│   │
│   ├── constants/             # 상수 정의
│   │   ├── routes.js
│   │   ├── apiEndpoints.js
│   │   ├── messages.js
│   │   └── config.js
│   │
│   ├── types/                 # TypeScript 타입 (향후)
│   │   ├── todo.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   └── styles/                # 글로벌 스타일
│       ├── index.css
│       ├── tailwind.css
│       └── variables.css
│
├── __tests__/                 # 테스트 파일
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── utils/
│
├── .env.example               # 환경 변수 예시
├── .eslintrc.json             # ESLint 설정
├── .prettierrc                # Prettier 설정
├── vite.config.js             # Vite 설정
├── tailwind.config.js         # Tailwind CSS 설정
├── package.json
└── README.md
```

### 6.2 컴포넌트 구조 원칙

#### 컴포넌트 분류

**1. Common Components (공통 컴포넌트)**:

- 프로젝트 전체에서 재사용 가능
- 도메인 로직 없음
- 예: Button, Input, Modal, Loading

**2. Layout Components (레이아웃 컴포넌트)**:

- 페이지 구조 담당
- 예: Header, Footer, Sidebar

**3. Feature Components (기능 컴포넌트)**:

- 특정 기능에 종속
- 도메인 로직 포함
- 예: TodoList, CalendarView

**4. Page Components (페이지 컴포넌트)**:

- 라우트와 1:1 매핑
- 데이터 fetching 및 상태 관리
- 예: TodosPage, CalendarPage

#### 컴포넌트 패턴

**컨테이너/프레젠테이션 분리**:

- 컨테이너: 데이터 fetching 및 로직 처리
- 프레젠테이션: 순수 UI 렌더링

### 6.3 상태 관리 (Zustand)

#### Store 구조

- State: 애플리케이션 상태
- Actions: 상태 변경 함수
- Async Actions: 비동기 작업
- Selectors: 계산된 값
- Middleware: devtools, persist 등

### 6.4 API 서비스 레이어

#### API Client

- Axios 인스턴스 생성
- 기본 설정 (baseURL, timeout, headers)
- Request interceptor: 토큰 자동 추가
- Response interceptor: 에러 처리 및 토큰 갱신

#### Service 모듈

- 도메인별 API 함수 그룹화
- CRUD 메서드 제공
- 에러 처리

### 6.5 커스텀 훅

**useTodos**: 할 일 관련 로직 캡슐화

**useAuth**: 인증 관련 로직 캡슐화

**useDebounce**: 입력 디바운싱

**useLocalStorage**: 로컬 스토리지 접근

### 6.6 라우팅 구조

- BrowserRouter 사용
- Public Routes: 인증 불필요
- Protected Routes: 인증 필요
- 404 처리

---

## 7. 백엔드 디렉토리 구조

### 7.1 전체 구조

```
backend/
├── src/
│   ├── app.js                 # Express 앱 설정
│   ├── server.js              # 서버 시작 진입점
│   │
│   ├── config/                # 설정 파일
│   │   ├── index.js           # 전역 설정
│   │   ├── database.js        # DB 연결 설정
│   │   └── environments.js    # 환경별 설정
│   │
│   ├── controllers/           # 요청 처리 컨트롤러
│   │   ├── authController.js
│   │   ├── todoController.js
│   │   ├── trashController.js
│   │   ├── calendarController.js
│   │   └── userController.js
│   │
│   ├── services/              # 비즈니스 로직
│   │   ├── authService.js
│   │   ├── todoService.js
│   │   ├── trashService.js
│   │   ├── calendarService.js
│   │   ├── userService.js
│   │   └── tokenService.js
│   │
│   ├── models/                # 데이터 접근 레이어
│   │   ├── index.js           # 모델 통합
│   │   ├── userModel.js
│   │   ├── todoModel.js
│   │   └── db.js              # DB 연결 풀
│   │
│   ├── routes/                # API 라우팅
│   │   ├── index.js           # 라우트 통합
│   │   ├── authRoutes.js
│   │   ├── todoRoutes.js
│   │   ├── trashRoutes.js
│   │   ├── calendarRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── middlewares/           # 미들웨어
│   │   ├── auth.js            # 인증 미들웨어
│   │   ├── errorHandler.js    # 에러 핸들링
│   │   ├── validator.js       # 입력 검증
│   │   ├── rateLimiter.js     # Rate limiting
│   │   ├── cors.js            # CORS 설정
│   │   ├── security.js        # 보안 헤더
│   │   └── logger.js          # 요청 로깅
│   │
│   ├── validators/            # 입력 검증 스키마
│   │   ├── authValidator.js
│   │   ├── todoValidator.js
│   │   └── userValidator.js
│   │
│   ├── utils/                 # 유틸리티 함수
│   │   ├── errors.js          # 커스텀 에러 클래스
│   │   ├── logger.js          # 로깅 유틸리티
│   │   ├── dateUtils.js       # 날짜 유틸리티
│   │   ├── validators.js      # 검증 헬퍼
│   │   └── helpers.js         # 기타 헬퍼
│   │
│   └── scripts/               # 스크립트
│       ├── seed.js            # DB 시딩
│       ├── migrate.js         # 마이그레이션
│       └── setupAdmin.js      # 관리자 생성
│
├── tests/                     # 테스트
│   ├── unit/                  # 단위 테스트
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── integration/           # 통합 테스트
│   │   ├── api/
│   │   └── db/
│   ├── e2e/                   # E2E 테스트
│   └── helpers/               # 테스트 헬퍼
│       ├── db.js
│       ├── fixtures.js
│       └── setup.js
│
├── logs/                      # 로그 파일
│   ├── error.log
│   └── combined.log
│
├── .env.example               # 환경 변수 예시
├── .eslintrc.json             # ESLint 설정
├── .prettierrc                # Prettier 설정
├── jest.config.js             # Jest 설정
├── package.json
└── README.md
```

### 7.2 레이어별 상세 구조

#### 7.2.1 Controllers (컨트롤러)

**책임**:

- HTTP 요청/응답 처리
- 요청 파라미터 추출
- 서비스 레이어 호출
- 응답 포맷팅

**원칙**:

- 비즈니스 로직 포함하지 않음
- 얇은 레이어 유지
- 에러는 next()로 전달

#### 7.2.2 Services (서비스)

**책임**:

- 비즈니스 로직 구현
- 데이터 검증
- 트랜잭션 관리
- 여러 모델 조정

**원칙**:

- 단일 책임 원칙 준수
- HTTP 요청/응답과 독립적
- 재사용 가능한 로직

#### 7.2.3 Models (모델)

**책임**:

- 데이터베이스 CRUD 작업
- SQL 쿼리 실행
- 데이터 매핑

**원칙**:

- 비즈니스 로직 포함하지 않음
- Parameterized queries 사용
- 데이터베이스와의 유일한 접점

#### 7.2.4 Routes (라우팅)

**책임**:

- URL 경로 정의
- HTTP 메서드 매핑
- 미들웨어 적용
- 컨트롤러 연결

**원칙**:

- RESTful 설계
- 명확한 엔드포인트 명명
- 적절한 HTTP 메서드 사용

#### 7.2.5 Middlewares (미들웨어)

**종류**:

- 인증 미들웨어: JWT 검증
- 검증 미들웨어: 입력 데이터 검증
- 에러 핸들러: 전역 에러 처리
- 로거: 요청/응답 로깅
- Rate Limiter: 요청 제한
- CORS: Cross-Origin 설정
- Security: 보안 헤더

### 7.3 데이터베이스 설정

**Connection Pool**:

- pg 라이브러리 사용
- 연결 풀 설정 (max, idleTimeout, connectionTimeout)
- 연결 상태 모니터링

**Query Helper**:

- 쿼리 실행 로깅
- 성능 측정
- 에러 처리

**Transaction Helper**:

- BEGIN, COMMIT, ROLLBACK 자동 처리
- 에러 발생 시 자동 롤백

### 7.4 애플리케이션 진입점

**app.js**:

- Express 앱 설정
- 미들웨어 등록
- 라우트 등록
- 에러 핸들러 등록

**server.js**:

- HTTP 서버 시작
- Graceful shutdown 처리
- Unhandled rejection/exception 처리

---

## 부록: 파일 명명 규칙

### 컴포넌트 파일

```
TodoList/
  ├── TodoList.jsx        # 메인 컴포넌트
  ├── TodoList.test.jsx   # 테스트
  ├── TodoList.module.css # 스타일 (CSS Modules 사용 시)
  └── index.js            # Export
```

### 서비스/유틸리티 파일

```
services/
  ├── todoService.js      # 서비스
  └── todoService.test.js # 테스트

utils/
  ├── dateUtils.js        # 유틸리티
  └── dateUtils.test.js   # 테스트
```

### 라우트/컨트롤러 파일

```
routes/
  └── todoRoutes.js       # 라우트

controllers/
  ├── todoController.js   # 컨트롤러
  └── todoController.test.js # 테스트
```

### 명명 규칙 요약

| 타입            | 규칙        | 예시                     |
| --------------- | ----------- | ------------------------ |
| React 컴포넌트  | PascalCase  | TodoList.jsx             |
| 커스텀 훅       | camelCase   | useTodos.js              |
| 서비스/유틸리티 | camelCase   | todoService.js           |
| 컨트롤러        | camelCase   | todoController.js        |
| 모델            | camelCase   | todoModel.js             |
| 라우트          | camelCase   | todoRoutes.js            |
| 미들웨어        | camelCase   | auth.js, errorHandler.js |
| 상수            | UPPER_CASE  | MAX_TITLE_LENGTH         |
| 테스트 파일     | .test.js    | todoService.test.js      |
| 환경 변수       | UPPER_CASE  | DATABASE_URL             |
| CSS Modules     | .module.css | TodoList.module.css      |
| 일반 CSS        | kebab-case  | todo-list.css            |

---

## 문서 변경 이력

| 버전 | 날짜       | 작성자                         | 변경 내용               |
| ---- | ---------- | ------------------------------ | ----------------------- |
| 1.0  | 2025-11-25 | Claude (Architecture Reviewer) | 초안 작성               |
| 1.1  | 2025-11-26 | Claude (Architecture Reviewer) | 모든 코드 예시 제거     |

---

**END OF DOCUMENT**
