# cjy-todoList 백엔드 API

cjy-todoList 애플리케이션의 백엔드 API 서버입니다. 사용자 인증 기반의 할 일 관리 시스템을 제공합니다.

## 기술 스택

- **런타임**: Node.js 18+
- **프레임워크**: Express 4.x
- **데이터베이스**: PostgreSQL (Supabase)
- **인증**: JWT (Access Token + Refresh Token)
- **해시**: bcrypt
- **API 문서화**: Swagger UI

## 설치 및 실행

### 1. 환경 설정

1. Node.js 18+ 설치
2. PostgreSQL 서버 또는 Supabase 프로젝트 준비
3. 프로젝트 클론:

```bash
git clone <repository-url>
cd cjy-todolist/backend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET` 등을 설정:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE_PATH=logs
```

### 4. 데이터베이스 테이블 생성

데이터베이스에 `schema.sql` 파일을 실행하여 테이블을 생성합니다:

```bash
psql -f database/schema.sql
```

### 5. 서버 실행

개발 모드:

```bash
npm run dev
```

Production 모드:

```bash
npm start
```

서버는 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 인증 관련

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

### 할 일 관련

- `GET /api/todos` - 할 일 목록 조회
- `GET /api/todos/:id` - 특정 할 일 조회
- `POST /api/todos` - 할 일 생성
- `PUT /api/todos/:id` - 할 일 수정
- `DELETE /api/todos/:id` - 할 일 삭제 (소프트 삭제)
- `PATCH /api/todos/:id/complete` - 할 일 완료 상태 토글

### 휴지통 관련

- `GET /api/trash` - 삭제된 할 일 목록 조회
- `POST /api/trash/:id/restore` - 할 일 복원
- `DELETE /api/trash/:id` - 할 일 영구 삭제

### 캘린더 관련

- `GET /api/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - 캘린더 데이터 조회
- `GET /api/holidays` - 국경일 목록 조회

## 환경 변수

다음 환경 변수들을 설정해야 합니다:

- `NODE_ENV` - 실행 환경 ('development', 'production', 'test')
- `PORT` - 서버 포트 (기본값: 3000)
- `DATABASE_URL` - PostgreSQL 데이터베이스 연결 URL
- `JWT_ACCESS_SECRET` - JWT Access 토큰 생성을 위한 비밀키
- `JWT_REFRESH_SECRET` - JWT Refresh 토큰 생성을 위한 비밀키
- `JWT_ACCESS_EXPIRES_IN` - Access 토큰 만료 시간
- `JWT_REFRESH_EXPIRES_IN` - Refresh 토큰 만료 시간
- `BCRYPT_ROUNDS` - 비밀번호 해싱을 위한 bcrypt 라운드 수
- `CORS_ORIGIN` - 허용할 클라이언트 도메인 (逗号로 구분 가능)
- `RATE_LIMIT_WINDOW_MS` - Rate Limiting 시간 창 (밀리초)
- `RATE_LIMIT_MAX_REQUESTS` - Rate Limiting 최대 요청 수
- `LOG_LEVEL` - 로깅 레벨 ('error', 'warn', 'info', 'debug')
- `LOG_FILE_PATH` - 로그 파일 저장 경로

## 테스트

Unit Tests 실행:

```bash
npm test
```

Unit Tests + Coverage 실행:

```bash
npm run test:coverage
```

## API 문서

Swagger UI를 통해 API 문서를 확인할 수 있습니다:

- [로컬] http://localhost:3000/api-docs
- [배포] https://cjy-todolist-backend.vercel.app/api-docs (배포 시)

## 배포

이 애플리케이션은 Vercel에 배포됩니다. 배포 시 다음을 확인하세요:

1. `vercel.json` 설정 확인
2. Vercel 프로젝트 생성 및 연결
3. 환경 변수 설정
4. 배포 성공 확인

## 오류 코드

- `400 Bad Request` - 잘못된 요청 (입력값 검증 실패 등)
- `401 Unauthorized` - 인증 실패 (토큰 없음 또는 만료)
- `403 Forbidden` - 접근 권한 없음
- `404 Not Found` - 요청한 리소스를 찾을 수 없음
- `422 Unprocessable Entity` - 요청 구문은 올바르지만 의미적으로 오류가 있음
- `429 Too Many Requests` - Rate Limit 초과
- `500 Internal Server Error` - 서버 내부 오류

## 폴더 구조

```
src/
├── app.js              # Express 애플리케이션 설정
├── server.js           # 서버 시작
├── config/             # 설정 파일들
├── controllers/        # 컨트롤러
├── models/             # 데이터베이스 모델
├── services/           # 비즈니스 로직
├── middlewares/        # 미들웨어
├── validators/         # 입력 검증
├── routes/             # 라우트
└── utils/              # 유틸리티 함수
```

## 기여

기여는 언제나 환영합니다. Pull Request를 보내주세요!

## 라이센스

MIT
