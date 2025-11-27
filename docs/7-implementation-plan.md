# cjy-todoList 통합 구현 계획

## 프로젝트 개요

- **프로젝트명**: cjy-todoList
- **기술 스택**:
  - Database: PostgreSQL 15+ (Supabase)
  - Backend: Node.js 18+, Express 4.x, JWT
  - Frontend: React 18.x, Zustand, Tailwind CSS 3.x, Axios, React Router 6.x
- **총 예상 시간**: 178-200시간 (22-25 작업일)
- **작성일**: 2025-11-26

---

## 전체 일정 개요

| 구분     | 예상 시간       | 작업 기간   |
| -------- | --------------- | ----------- |
| Database | 28시간          | 3.5일       |
| Backend  | 70-72시간       | 9일         |
| Frontend | 80-100시간      | 10-12.5일   |
| **전체** | **178-200시간** | **22-25일** |

---

## Phase 1: 데이터베이스 구축 (28시간)

### DB-1: 개발 환경 설정

**예상 시간**: 2시간
**우선순위**: High
**의존성**: 없음

#### 완료 조건

- [x] Supabase 프로젝트 생성 완료
- [x] Supabase 연결 정보 확인 (host, port, database name, user, password)
- [x] PostgreSQL 클라이언트 도구 설치 (pgAdmin, DBeaver 등)
- [x] 로컬 개발 환경에서 Supabase 데이터베이스 연결 테스트 성공
- [x] `.env` 파일에 데이터베이스 연결 정보 저장
- [x] `.gitignore`에 `.env` 파일 추가 확인

---

### DB-2: 스키마 파일 검증 및 준비

**예상 시간**: 1시간
**우선순위**: High
**의존성**: DB-1

#### 완료 조건

- [x] `database/schema.sql` 파일 구문 검증 (PostgreSQL 문법 체크)
- [x] UUID 확장 모듈 사용 가능 여부 확인
- [x] 모든 제약 조건(CONSTRAINT) 정의 검토
- [x] 트리거 함수 동작 검증
- [x] 뷰(View) 정의 검토
- [x] 초기 데이터(국경일) 검증

---

### DB-3: 데이터베이스 및 테이블 생성

**예상 시간**: 3시간
**우선순위**: High
**의존성**: DB-2

#### 완료 조건

- [x] Supabase SQL Editor에서 `database/schema.sql` 실행
- [x] UUID 확장 모듈 활성화 확인
- [x] `users` 테이블 생성 확인
- [x] `todos` 테이블 생성 확인
- [x] 모든 제약 조건(PK, FK, UNIQUE, CHECK) 적용 확인
- [x] 외래 키 관계 정상 동작 확인
- [x] 테이블 코멘트 추가 확인

---

### DB-4: 인덱스 생성 및 최적화

**예상 시간**: 2시간
**우선순위**: High
**의존성**: DB-3

#### 완료 조건

- [x] 단일 컬럼 인덱스 생성 확인 (users: username, email / todos: userId, isDeleted 등)
- [x] 복합 인덱스 생성 확인 (idx_todos_user_active, idx_todos_calendar 등)
- [x] 부분 인덱스(Partial Index) 생성 확인
- [x] 인덱스 사용 계획 분석 (EXPLAIN ANALYZE)
- [x] 쿼리 성능 테스트 (조회 쿼리 실행 시간 측정)
- [x] 필요 시 인덱스 추가 또는 조정

---

### DB-5: 트리거, 함수 및 뷰 생성

**예상 시간**: 4시간
**우선순위**: High
**의존성**: DB-3

#### 완료 조건

- [x] `update_updated_at_column()` 함수 생성 확인
- [x] `users` 테이블 트리거 생성 및 동작 테스트
- [x] `todos` 테이블 트리거 생성 및 동작 테스트
- [x] UPDATE 시 `updatedAt` 자동 갱신 확인
- [x] `get_user_todo_stats()` 함수 생성 확인
- [x] 통계 함수 동작 테스트 (샘플 데이터로 검증)
- [x] `v_active_todos` 뷰 생성 확인
- [x] `v_public_holidays` 뷰 생성 확인
- [x] `v_trash` 뷰 생성 확인
- [x] 각 뷰에서 데이터 조회 테스트

---

### DB-6: 초기 데이터 삽입 및 제약 조건 테스트

**예상 시간**: 5시간
**우선순위**: High
**의존성**: DB-5

#### 완료 조건

- [x] 2025년 한국 공휴일 데이터 삽입 확인
- [x] 삽입된 국경일 데이터 검증 (총 15개)
- [x] `isPublicHoliday = TRUE` 및 `userId IS NULL` 확인
- [x] **Users 테이블 제약 조건 테스트**
  - [x] 중복 username 삽입 시 에러 발생 확인
  - [x] 중복 email 삽입 시 에러 발생 확인
  - [x] 잘못된 email 형식 삽입 시 에러 발생 확인
  - [x] username 길이 제약 테스트
- [x] **Todos 테이블 제약 조건 테스트**
  - [x] startDate > dueDate 삽입 시 에러 발생 확인
  - [x] isDeleted=TRUE인데 deletedAt=NULL 삽입 시 에러 발생 확인
  - [x] isPublicHoliday=TRUE인데 userId가 NULL이 아닌 경우 에러 확인
  - [x] title 길이 제약 테스트 (1~200자)
  - [x] description 길이 제약 테스트 (최대 2000자)
  - [x] 존재하지 않는 userId 삽입 시 외래 키 에러 확인
  - [x] 사용자 삭제 시 연관 todos 자동 삭제(CASCADE) 확인

---

### DB-7: 통합 쿼리 테스트 및 성능 분석

**예상 시간**: 5시간
**우선순위**: High
**의존성**: DB-6

#### 완료 조건

- [x] 사용자별 할 일 조회 쿼리 테스트 (활성/삭제 구분)
- [x] 캘린더 조회 쿼리 테스트 (날짜별 할 일 및 국경일)
- [x] 휴지통 조회 쿼리 테스트
- [x] 국경일 조회 쿼리 테스트
- [x] 사용자 통계 조회 함수 테스트 (`get_user_todo_stats()`)
- [x] 각 쿼리 실행 계획 분석 (EXPLAIN ANALYZE)
- [x] 인덱스 사용 여부 확인
- [x] 쿼리 응답 시간 측정 및 최적화
- [x] 대량 데이터 삽입 후 성능 재측정 (1000+ todos)

---

### DB-8: 문서화 및 마이그레이션 가이드 작성

**예상 시간**: 6시간
**우선순위**: Medium
**의존성**: DB-7

#### 완료 조건

- [x] 데이터베이스 설치 가이드 작성
- [x] 스키마 마이그레이션 절차 문서화
- [x] 주요 쿼리 예제 문서 작성
- [x] 인덱스 설계 근거 문서화
- [x] 제약 조건 및 비즈니스 규칙 설명
- [x] 백업 및 복원 절차 문서화
- [x] 성능 튜닝 가이드 작성
- [x] 트러블슈팅 가이드 작성
- [x] `database/README.md` 파일 작성

---

## Phase 2: 백엔드 구축 (70-72시간)

### BE-1: 프로젝트 초기화 및 의존성 설치

**예상 시간**: 3시간
**우선순위**: High
**의존성**: DB-3

#### 완료 조건

- [x] `backend/` 디렉토리 생성
- [x] `npm init` 실행 및 `package.json` 생성
- [x] 프로젝트 메타데이터 설정
- [x] `.gitignore`, `.env.example` 파일 생성
- [x] **프로덕션 의존성 설치**
  - [x] express, pg, dotenv, bcrypt, jsonwebtoken
  - [x] cors, helmet, express-validator, express-rate-limit
- [x] **개발 의존성 설치**
  - [x] nodemon, jest, supertest, eslint, prettier
- [x] `package.json`에 scripts 추가 (start, dev, test, lint)

---

### BE-2: 프로젝트 폴더 구조 및 환경 설정

**예상 시간**: 3시간
**우선순위**: High
**의존성**: BE-1

#### 완료 조건

- [x] 계층별 디렉토리 생성
  - [x] `src/controllers/`, `src/services/`, `src/models/`
  - [x] `src/middlewares/`, `src/routes/`, `src/utils/`
  - [x] `src/config/`, `src/validators/`
- [x] `tests/` 디렉토리 생성
- [x] `.env` 파일 생성 및 환경 변수 정의
  - [x] PORT, DATABASE_URL
  - [x] JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
  - [x] JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
  - [x] NODE_ENV
- [x] `src/config/database.js` 생성 (PostgreSQL Pool 설정)
- [x] `src/config/jwt.js` 생성 (JWT 설정)
- [x] 데이터베이스 연결 테스트 스크립트 작성 및 실행

---

### BE-3: 데이터베이스 모델 레이어 구현

**예상 시간**: 5시간
**우선순위**: High
**의존성**: BE-2

#### 완료 조건

- [x] `src/models/db.js` 생성 (PostgreSQL Pool 초기화)
- [x] `src/models/BaseModel.js` 생성 (공통 CRUD 메서드)
- [x] **`src/models/UserModel.js` 생성**
  - [x] `findByUsername()`, `findByEmail()`, `findById()`
  - [x] `create()`, `update()` 메서드
- [x] **`src/models/TodoModel.js` 생성**
  - [x] `findById()`, `findByUserId()` (활성 todos)
  - [x] `create()`, `update()`, `softDelete()`, `hardDelete()`
  - [x] `findDeletedByUserId()`, `restore()`
  - [x] `findByDateRange()`, `findPublicHolidays()`
- [x] `src/models/RefreshTokenModel.js` 생성
  - [x] Refresh Token 저장/조회/삭제 메서드
- [x] 단위 테스트 작성 (UserModel, TodoModel)

---

### BE-4: 공통 미들웨어 및 유틸리티 구현

**예상 시간**: 6시간
**우선순위**: High
**의존성**: BE-2

#### 완료 조건

- [x] **미들웨어 생성**
  - [x] `src/middlewares/errorHandler.js` (전역 에러 핸들러, 커스텀 에러 클래스)
  - [x] `src/middlewares/authMiddleware.js` (JWT 토큰 검증)
  - [x] `src/middlewares/requestLogger.js` (요청 로깅)
  - [x] `src/middlewares/corsConfig.js` (CORS 설정)
  - [x] `src/middlewares/rateLimiter.js` (Rate limiting)
- [x] **유틸리티 함수 생성**
  - [x] `src/utils/jwtUtils.js` (generateAccessToken, generateRefreshToken, verifyToken)
  - [x] `src/utils/passwordUtils.js` (hashPassword, comparePassword)
  - [x] `src/utils/responseFormatter.js` (성공/에러 응답 포맷)
- [x] 미들웨어 및 유틸리티 단위 테스트 작성

---

### BE-5: Express 서버 기본 설정

**예상 시간**: 2시간
**우선순위**: High
**의존성**: BE-4

#### 완료 조건

- [x] `src/app.js` 생성 (Express 앱 설정)
  - [x] 미들웨어 등록 (cors, helmet, express.json, express.urlencoded)
  - [x] 라우터 등록
  - [x] 에러 핸들러 등록
- [x] `src/server.js` 생성 (서버 시작)
- [x] 헬스 체크 엔드포인트 구현 (`GET /health`)
- [x] 404 핸들러 구현
- [x] 서버 시작 테스트 (포트 리스닝 확인)

---

### BE-6: 회원가입 API 구현

**예상 시간**: 5시간
**우선순위**: High
**의존성**: BE-3, BE-4

#### 완료 조건

- [x] `src/validators/authValidator.js` 생성 (회원가입 입력 검증)
- [x] `src/services/AuthService.js` 생성
  - [x] `signUp()` 메서드 (중복 확인, 비밀번호 해싱, 사용자 생성)
- [x] `src/controllers/AuthController.js` 생성
  - [x] `signUp()` 컨트롤러
- [x] `src/routes/authRoutes.js` 생성
  - [x] `POST /api/auth/signup` 라우트
- [x] 단위 테스트 작성 (AuthService.signUp)
- [x] 통합 테스트 작성 (POST /api/auth/signup)

---

### BE-7: 로그인 및 토큰 관리 API 구현

**예상 시간**: 8시간
**우선순위**: High
**의존성**: BE-6

#### 완료 조건

- [x] **로그인 API**
  - [x] `src/validators/authValidator.js` 업데이트 (로그인 입력 검증)
  - [x] `AuthService.signIn()` 메서드 (사용자 인증, 토큰 생성/저장)
  - [x] `AuthController.signIn()` 컨트롤러
  - [x] `POST /api/auth/signin` 라우트
- [x] **토큰 갱신 API**
  - [x] `AuthService.refreshAccessToken()` 메서드
  - [x] `AuthController.refreshToken()` 컨트롤러
  - [x] `POST /api/auth/refresh` 라우트
- [x] **로그아웃 API**
  - [x] `AuthService.signOut()` 메서드 (Refresh Token 삭제)
  - [x] `AuthController.signOut()` 컨트롤러
  - [x] `POST /api/auth/signout` 라우트
- [x] 단위 테스트 및 통합 테스트 작성

---

### BE-8: Todo CRUD API 구현

**예상 시간**: 9시간
**우선순위**: High
**의존성**: BE-3, BE-4

#### 완료 조건

- [x] `src/validators/todoValidator.js` 생성 (Todo 생성/수정 입력 검증)
- [x] `src/services/TodoService.js` 생성
  - [x] `getTodosByUserId()`, `getTodoById()`
  - [x] `createTodo()`, `updateTodo()`, `deleteTodo()` (소프트 삭제)
- [x] `src/controllers/TodoController.js` 생성
  - [x] `getTodos()`, `getTodoById()`, `createTodo()`
  - [x] `updateTodo()`, `deleteTodo()`, `toggleComplete()`
- [x] `src/routes/todoRoutes.js` 생성
  - [x] `GET /api/todos`, `GET /api/todos/:id`
  - [x] `POST /api/todos`, `PUT /api/todos/:id`
  - [x] `DELETE /api/todos/:id`, `PATCH /api/todos/:id/complete`
- [x] 단위 테스트 작성 (TodoModel, TodoService)
- [x] 통합 테스트 작성 (모든 엔드포인트)

---

### BE-9: 휴지통 API 구현

**예상 시간**: 4시간
**우선순위**: Medium
**의존성**: BE-8

#### 완료 조건

- [x] `TodoService` 업데이트
  - [x] `getTrashByUserId()`, `restoreTodo()`, `permanentlyDeleteTodo()`
- [x] `TodoController` 업데이트
  - [x] `getTrash()`, `restoreTodo()`, `permanentlyDelete()`
- [x] `src/routes/trashRoutes.js` 생성
  - [x] `GET /api/trash`
  - [x] `POST /api/trash/:id/restore`
  - [x] `DELETE /api/trash/:id` (영구 삭제)
- [x] 통합 테스트 작성

---

### BE-10: 캘린더 및 국경일 API 구현

**예상 시간**: 8시간
**우선순위**: High
**의존성**: BE-8

#### 완료 조건

- [x] **캘린더 API**
  - [x] `src/services/CalendarService.js` 생성
  - [x] `getCalendarData()` 메서드 (사용자 할 일 + 국경일 병합)
  - [x] `src/controllers/CalendarController.js` 생성
  - [x] `src/routes/calendarRoutes.js` 생성
  - [x] `GET /api/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD`
- [x] **국경일 API**
  - [x] `src/services/HolidayService.js` 생성
  - [x] `getPublicHolidays()`, `addPublicHoliday()` (관리자 전용)
  - [x] `src/controllers/HolidayController.js` 생성
  - [x] `src/routes/holidayRoutes.js` 생성
  - [x] `GET /api/holidays`, `POST /api/holidays`
- [x] 단위 테스트 및 통합 테스트 작성

---

### BE-11: 보안 강화 및 입력 검증

**예상 시간**: 6시간
**우선순위**: High
**의존성**: BE-5

#### 완료 조건

- [x] **Rate Limiting 설정**
  - [x] 인증 API: 5 requests/15분
  - [x] 일반 API: 100 requests/15분
- [x] **보안 미들웨어 강화**
  - [x] `helmet` 설정 커스터마이징
  - [x] CORS 화이트리스트 설정
  - [x] SQL Injection 방어 확인 (Parameterized Queries)
  - [x] XSS 방어 확인
- [x] **입력 검증 보완**
  - [x] 모든 API 엔드포인트 입력 검증 강화
  - [x] 커스텀 에러 메시지 정의
  - [x] 에러 로깅 시스템 구축 (Winston 또는 Pino)
- [x] 보안 테스트 작성

---

### BE-12: 테스트 및 커버리지 확인

**예상 시간**: 11시간
**우선순위**: High
**의존성**: BE-1~BE-11

#### 완료 조건

- [x] **단위 테스트 완성**
  - [x] 모든 Service 레이어 단위 테스트 작성
  - [x] 모든 Model 레이어 단위 테스트 작성
  - [x] 모든 유틸리티 함수 단위 테스트 작성
  - [ ] Service 레이어 커버리지 90% 이상 달성 (현재 ~50%)
- [x] **통합 테스트 완성**
  - [x] 모든 API 엔드포인트 통합 테스트 작성
  - [x] 인증 플로우 E2E 테스트
  - [x] Todo CRUD E2E 테스트
  - [x] 휴지통, 캘린더 E2E 테스트
  - [x] 에러 케이스 테스트 (401, 403, 404, 422, 500)
  - [ ] 통합 테스트 커버리지 80% 이상 달성 (현재 ~40%)
- [x] Jest 커버리지 측정 (`npm run test:coverage`)
- [ ] 전체 코드 커버리지 80% 이상 달성 (현재 40.63% - 개선 필요)

---

### BE-13: Vercel 배포 및 문서화

**예상 시간**: 5시간
**우선순위**: High
**의존성**: BE-12

#### 완료 조건

- [x] `vercel.json` 설정 파일 생성
- [x] Vercel 프로젝트 생성 및 연결 준비 완료 (사용자 직접 수행 가이드 제공)
- [x] 환경 변수 설정 가이드 작성 완료 (DATABASE_URL, JWT SECRET 등 준비 완료)
- [ ] Supabase 데이터베이스 연결 테스트 (사용자가 배포 후 확인 필요)
- [ ] Vercel 배포 성공 확인 (사용자가 직접 수행 필요)
- [ ] 배포된 API Health Check 확인 (사용자가 배포 후 확인 필요)
- [x] **API 문서 작성**
  - [x] 엔드포인트 목록
  - [x] 요청/응답 예제
  - [x] 인증 방식 설명
  - [x] 에러 코드 정의
- [x] **`backend/README.md` 작성**
  - [x] 프로젝트 소개, 설치/실행 방법
  - [x] 환경 변수 설정 가이드
  - [x] API 문서 링크, 테스트 실행 방법
- [x] **배포 가이드 문서 작성**
  - [x] `backend/DEPLOYMENT.md` - 상세한 Vercel 배포 가이드
  - [x] `backend/VERCEL_SETUP_GUIDE.md` - 단계별 배포 안내서
  - [x] 환경 변수 목록 및 값 준비 완료
  - [x] 트러블슈팅 가이드

---

## Phase 3: 프론트엔드 구축 (80-100시간)

### FE-1: React 프로젝트 초기화 및 의존성 설치

**예상 시간**: 3시간
**우선순위**: High
**의존성**: 없음

#### 완료 조건

- [ ] `frontend/` 디렉토리 생성
- [ ] Vite로 React 프로젝트 생성
- [ ] `.gitignore`, `.env.example` 파일 확인
- [ ] **프로덕션 의존성 설치**
  - [ ] react-router-dom, zustand, axios
  - [ ] date-fns 또는 dayjs
  - [ ] react-hot-toast 또는 sonner
- [ ] **Tailwind CSS 설치 및 설정**
  - [ ] tailwindcss, postcss, autoprefixer 설치
  - [ ] `tailwind.config.js` 생성
  - [ ] `src/index.css`에 Tailwind directives 추가
- [ ] **개발 의존성 설치**
  - [ ] eslint, prettier
  - [ ] @testing-library/react, vitest
- [ ] 개발 서버 실행 테스트 (`npm run dev`)

---

### FE-2: 프로젝트 폴더 구조 및 Axios 설정

**예상 시간**: 3시간
**우선순위**: High
**의존성**: FE-1

#### 완료 조건

- [ ] 계층별 디렉토리 생성
  - [ ] `src/components/` (common, layout)
  - [ ] `src/pages/`, `src/hooks/`, `src/store/`
  - [ ] `src/services/`, `src/utils/`, `src/constants/`, `src/styles/`
- [ ] `.env.local` 파일 생성 (`VITE_API_BASE_URL`)
- [ ] **`src/services/api.js` 생성**
  - [ ] Axios 인스턴스 생성 (baseURL 설정)
  - [ ] Request Interceptor (Access Token 자동 포함)
  - [ ] Response Interceptor (토큰 만료 시 자동 갱신)
  - [ ] 에러 핸들링 (401, 403, 500)
- [ ] `src/services/authApi.js` 생성
  - [ ] `signUp()`, `signIn()`, `signOut()`, `refreshToken()`
- [ ] API 연결 테스트 (Health Check 호출)

---

### FE-3: React Router 및 Zustand 스토어 설정

**예상 시간**: 7시간
**우선순위**: High
**의존성**: FE-2

#### 완료 조건

- [ ] **React Router 설정**
  - [ ] `src/App.jsx` 업데이트 (BrowserRouter)
  - [ ] `src/routes/index.jsx` 생성 (라우트 정의)
    - [ ] `/signin`, `/signup`, `/todos`, `/calendar`, `/trash`, `/profile`, `*` (404)
  - [ ] `src/components/ProtectedRoute.jsx` 생성 (인증 라우트 보호)
- [ ] **Zustand 스토어 구현**
  - [ ] `src/store/authStore.js` (user, accessToken, isAuthenticated, setUser, setToken, logout, checkAuth)
  - [ ] `src/store/todoStore.js` (todos, isLoading, error, setTodos, addTodo, updateTodo, deleteTodo, toggleComplete)
  - [ ] `src/store/calendarStore.js` (calendarData, selectedDate, setCalendarData, setSelectedDate, fetchCalendarData)
  - [ ] `src/store/trashStore.js` (trashedTodos, isLoading, setTrash, restoreTodo, permanentlyDelete)
- [ ] Zustand DevTools 설정 (개발 환경)
- [ ] 라우팅 및 스토어 단위 테스트 작성

---

### FE-4: 공통 컴포넌트 구현

**예상 시간**: 8시간
**우선순위**: High
**의존성**: FE-1

#### 완료 조건

- [ ] `src/components/common/Button.jsx` 생성
  - [ ] variants: primary, secondary, danger, ghost
  - [ ] sizes: sm, md, lg
  - [ ] loading 상태 지원
- [ ] `src/components/common/Input.jsx` 생성
  - [ ] 타입별 Input (text, email, password, date)
  - [ ] 에러 메시지 표시
- [ ] `src/components/common/Modal.jsx` 생성
  - [ ] 열기/닫기 애니메이션, 외부 클릭 시 닫기
- [ ] `src/components/common/Checkbox.jsx` 생성
- [ ] `src/components/common/Loading.jsx` 생성 (스피너)
- [ ] `src/components/common/ErrorMessage.jsx` 생성
- [ ] Tailwind CSS로 스타일링
- [ ] 각 컴포넌트 단위 테스트 작성

---

### FE-5: 레이아웃 컴포넌트 구현

**예상 시간**: 4시간
**우선순위**: Medium
**의존성**: FE-3, FE-4

#### 완료 조건

- [ ] `src/components/layout/Header.jsx` 생성
  - [ ] 로고/타이틀
  - [ ] 네비게이션 메뉴 (Todos, Calendar, Trash, Profile)
  - [ ] 로그아웃 버튼
- [ ] `src/components/layout/MainLayout.jsx` 생성
  - [ ] Header + Content 영역 구성
- [ ] 반응형 디자인 적용 (모바일, 태블릿, 데스크톱)
- [ ] 레이아웃 컴포넌트 통합 테스트

---

### FE-6: 회원가입/로그인 페이지 구현

**예상 시간**: 8시간
**우선순위**: High
**의존성**: FE-3, FE-4

#### 완료 조건

- [ ] **`src/pages/SignUpPage.jsx` 생성**
  - [ ] 회원가입 폼 (username, email, password, confirmPassword)
  - [ ] 입력 검증 (이메일 형식, 비밀번호 강도, 필수 필드)
  - [ ] authApi.signUp() 호출
  - [ ] 성공 시 로그인 페이지로 리다이렉트
  - [ ] 에러 메시지 표시
- [ ] **`src/pages/SignInPage.jsx` 생성**
  - [ ] 로그인 폼 (username, password)
  - [ ] authApi.signIn() 호출
  - [ ] 성공 시 authStore 업데이트 및 /todos로 리다이렉트
  - [ ] 에러 메시지 표시
  - [ ] "회원가입" 링크
- [ ] 토스트 알림 통합 (성공/실패 메시지)
- [ ] E2E 테스트 작성 (회원가입 → 로그인 플로우)

---

### FE-7: 할 일 목록 (Todos) 페이지 구현

**예상 시간**: 10시간
**우선순위**: High
**의존성**: FE-3, FE-4, FE-5

#### 완료 조건

- [ ] `src/services/todoApi.js` 생성
  - [ ] `getTodos()`, `createTodo()`, `updateTodo()`, `deleteTodo()`, `toggleComplete()`
- [ ] **`src/pages/TodosPage.jsx` 생성**
  - [ ] 할 일 목록 조회 및 표시
  - [ ] 필터링 (전체, 미완료, 완료)
  - [ ] 정렬 (최신순, 마감일순)
- [ ] **`src/components/TodoItem.jsx` 생성**
  - [ ] 체크박스 (완료 토글)
  - [ ] 제목, 설명, 날짜 표시
  - [ ] 수정/삭제 버튼
- [ ] **`src/components/TodoForm.jsx` 생성**
  - [ ] 모달 형태로 구현
  - [ ] 제목, 설명, 시작일, 마감일 입력
  - [ ] 입력 검증
- [ ] 할 일 생성/수정/삭제 기능 구현
- [ ] 완료 상태 토글 기능 구현
- [ ] 통합 테스트 작성

---

### FE-8: 캘린더 페이지 구현

**예상 시간**: 12시간
**우선순위**: High
**의존성**: FE-3, FE-4, FE-5

#### 완료 조건

- [ ] `src/services/calendarApi.js` 생성
  - [ ] `getCalendarData(startDate, endDate)`
- [ ] **`src/pages/CalendarPage.jsx` 생성**
  - [ ] 월간 캘린더 UI 구현
  - [ ] 날짜별 할 일 및 국경일 표시
  - [ ] 날짜 클릭 시 상세 보기
- [ ] **`src/components/Calendar.jsx` 생성**
  - [ ] date-fns 또는 dayjs로 달력 로직 구현
  - [ ] 현재 월 표시 및 이전/다음 달 이동
  - [ ] 오늘 날짜 하이라이트
  - [ ] 할 일이 있는 날짜 표시 (점 또는 숫자)
  - [ ] 국경일 표시 (색상 구분)
- [ ] **`src/components/CalendarDayDetail.jsx` 생성**
  - [ ] 선택된 날짜의 할 일 목록
  - [ ] 할 일 추가/수정/삭제 기능
- [ ] 반응형 캘린더 UI
- [ ] 통합 테스트 작성

---

### FE-9: 휴지통 및 프로필 페이지 구현

**예상 시간**: 11시간
**우선순위**: Medium
**의존성**: FE-3, FE-4, FE-5

#### 완료 조건

- [ ] **휴지통 페이지**
  - [ ] `src/services/trashApi.js` 생성 (getTrash, restoreTodo, permanentlyDelete)
  - [ ] `src/pages/TrashPage.jsx` 생성 (삭제된 할 일 목록 조회)
  - [ ] `src/components/TrashItem.jsx` 생성 (복원/영구삭제 버튼)
  - [ ] 복원 기능 구현 (todoStore 업데이트, 토스트 알림)
  - [ ] 영구 삭제 기능 구현 (확인 모달)
- [ ] **프로필 페이지**
  - [ ] `src/services/userApi.js` 생성 (getUserProfile, getUserStats)
  - [ ] `src/pages/ProfilePage.jsx` 생성
  - [ ] 사용자 정보 표시 (username, email)
  - [ ] 통계 표시 (전체 할 일, 완료율 등)
  - [ ] 로그아웃 기능 구현
- [ ] 통합 테스트 작성

---

### FE-10: 커스텀 훅 및 전역 스타일 구현

**예상 시간**: 7시간
**우선순위**: Medium
**의존성**: FE-3

#### 완료 조건

- [ ] **커스텀 훅 구현**
  - [ ] `src/hooks/useAuth.js` (authStore 래핑)
  - [ ] `src/hooks/useTodos.js` (todoStore 래핑)
  - [ ] `src/hooks/useCalendar.js` (calendarStore 래핑)
  - [ ] `src/hooks/useTrash.js` (trashStore 래핑)
  - [ ] `src/hooks/useToast.js` (토스트 알림 래핑)
  - [ ] 커스텀 훅 단위 테스트 작성
- [ ] **전역 스타일 및 테마 설정**
  - [ ] `tailwind.config.js` 커스터마이징 (색상 팔레트, 폰트)
  - [ ] `src/styles/index.css` 업데이트 (전역 스타일, 폰트 임포트)
  - [ ] 다크 모드 지원 (선택사항)

---

### FE-11: 에러 처리 및 성능 최적화

**예상 시간**: 9시간
**우선순위**: High
**의존성**: FE-7, FE-8

#### 완료 조건

- [ ] **에러 처리**
  - [ ] `src/components/ErrorBoundary.jsx` 생성
  - [ ] `src/components/GlobalLoading.jsx` 생성
  - [ ] Axios Interceptor에서 전역 로딩 상태 관리
  - [ ] 각 페이지에서 로컬 로딩 상태 구현
  - [ ] 404 페이지 구현 (`src/pages/NotFoundPage.jsx`)
  - [ ] 네트워크 에러 처리 (오프라인 감지)
- [ ] **성능 최적화**
  - [ ] React.memo 적용 (TodoItem, CalendarDay 등)
  - [ ] useMemo/useCallback 적용
  - [ ] 가상 스크롤링 구현 (긴 할 일 목록)
  - [ ] Code splitting 적용 (React.lazy, Suspense)
  - [ ] Lighthouse 성능 측정 (90점 이상 목표)
  - [ ] Bundle size 분석 및 최적화

---

### FE-12: 접근성 개선 및 테스트 완성

**예상 시간**: 13시간
**우선순위**: High
**의존성**: FE-1~FE-11

#### 완료 조건

- [ ] **접근성 개선**
  - [ ] 모든 인터랙티브 요소에 ARIA 속성 추가
  - [ ] 키보드 네비게이션 지원 (Tab, Enter, Esc)
  - [ ] 포커스 인디케이터 스타일링
  - [ ] 스크린 리더 테스트
  - [ ] 색상 대비 확인 (WCAG AA 기준)
- [ ] **단위 테스트 및 통합 테스트 완성**
  - [ ] 모든 컴포넌트 단위 테스트 작성 (80% 커버리지)
  - [ ] 모든 커스텀 훅 단위 테스트 작성
  - [ ] 모든 스토어 단위 테스트 작성
  - [ ] 주요 페이지 통합 테스트 작성
  - [ ] E2E 테스트 작성 (Playwright 또는 Cypress)
  - [ ] 테스트 커버리지 측정 (`npm run test:coverage`)

---

### FE-13: Vercel 배포 및 문서화

**예상 시간**: 4시간
**우선순위**: High
**의존성**: FE-12

#### 완료 조건

- [ ] `vercel.json` 설정 파일 생성 (SPA 라우팅 설정)
- [ ] Vercel 프로젝트 생성 및 연결
- [ ] 환경 변수 설정 (Vercel Dashboard: `VITE_API_BASE_URL`)
- [ ] Vercel 배포 성공 확인
- [ ] 배포된 앱 동작 테스트 (모든 기능 확인)
- [ ] Custom Domain 설정 (선택사항)
- [ ] **`frontend/README.md` 작성**
  - [ ] 프로젝트 소개, 기술 스택
  - [ ] 설치 및 실행 방법
  - [ ] 환경 변수 설정 가이드
  - [ ] 빌드 및 배포 방법
  - [ ] 테스트 실행 방법
- [ ] 사용자 가이드 작성 (선택사항)

---

## 전체 의존성 다이어그램

```
Database Phase (DB-1 → DB-8)
    ↓
Backend Phase
    BE-1 → BE-2 → BE-3 → BE-6 → BE-7
                ↓      ↓
           BE-4 → BE-5   BE-8 → BE-9
                          ↓      ↓
                       BE-10 ← BE-11
                          ↓
                     BE-12 → BE-13

Frontend Phase (병렬 개발 가능)
    FE-1 → FE-2 → FE-3 → FE-6
              ↓      ↓      ↓
         FE-4 → FE-5   FE-10
              ↓      ↓
         FE-7 + FE-8 + FE-9 (병렬)
              ↓
         FE-11 → FE-12 → FE-13
```

---

## 주요 마일스톤 및 체크포인트

| 마일스톤                        | 완료 Task   | 예상 완료 시간 | 누적 시간 |
| ------------------------------- | ----------- | -------------- | --------- |
| **데이터베이스 완료**           | DB-1~DB-8   | 28시간         | 28시간    |
| **백엔드 기반 구축**            | BE-1~BE-5   | 19시간         | 47시간    |
| **백엔드 인증 완료**            | BE-6~BE-7   | 32시간         | 60시간    |
| **백엔드 Core API 완료**        | BE-8~BE-10  | 53시간         | 81시간    |
| **백엔드 배포 완료**            | BE-11~BE-13 | 75시간         | 103시간   |
| **프론트엔드 기반 구축**        | FE-1~FE-5   | 25시간         | 128시간   |
| **프론트엔드 인증 완료**        | FE-6        | 33시간         | 136시간   |
| **프론트엔드 Core 페이지 완료** | FE-7~FE-9   | 66시간         | 169시간   |
| **프론트엔드 배포 완료**        | FE-10~FE-13 | 99시간         | 202시간   |

---

## 병렬 처리 가능 작업

### 데이터베이스

- DB 작업은 순차적으로 진행

### 백엔드

- BE-3 + BE-4 (모델 레이어 + 미들웨어/유틸리티)
- BE-9 + BE-10 (휴지통 + 캘린더/국경일)

### 프론트엔드

- FE-3 + FE-4 (라우팅/스토어 + 공통 컴포넌트 일부)
- FE-7 + FE-8 + FE-9 (각 페이지 독립 개발)
- FE-10 (커스텀 훅 + 스타일)

---

## 우선순위 분류

### Critical Path (High Priority)

1. **Database**: DB-1~DB-7 (필수 인프라)
2. **Backend**: BE-1~BE-8, BE-11~BE-13 (핵심 API 및 배포)
3. **Frontend**: FE-1~FE-8, FE-11~FE-13 (핵심 UI 및 배포)

### Important (Medium Priority)

1. **Database**: DB-8 (문서화)
2. **Backend**: BE-9, BE-10 (휴지통, 캘린더)
3. **Frontend**: FE-5, FE-9, FE-10 (레이아웃, 휴지통/프로필, 훅/스타일)

### Nice to Have (Low Priority)

1. **Backend**: 비밀번호 변경, 다크 모드
2. **Frontend**: 다크 모드, Custom Domain

---

## 참고 문서

- `database/schema.sql`: 데이터베이스 DDL
- `docs/3-prd.md`: 제품 요구사항 문서
- `docs/4-api-spec.md`: API 상세 스펙
- `docs/5-arch-diagram.md`: 아키텍처 다이어그램
- `docs/5-project-structure-principles.md`: 프로젝트 구조 원칙
- `docs/6-erd.md`: ERD 및 엔티티 정의
