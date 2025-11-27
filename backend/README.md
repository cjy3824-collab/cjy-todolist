# cjy-todolist Backend API

할 일 관리 애플리케이션의 백엔드 API 서버입니다.

## 기술 스택

- **Node.js**: 18+
- **Express**: 5.x
- **PostgreSQL**: 데이터베이스
- **JWT**: 인증/인가
- **Swagger**: API 문서화
- **Winston**: 로깅
- **Jest**: 테스트 프레임워크

## 주요 기능

- 🔐 JWT 기반 인증 (Access Token + Refresh Token)
- 📝 할 일 CRUD 작업
- 🗑️ 휴지통 (소프트 삭제)
- 📅 캘린더 통합
- 🎉 공휴일 관리
- 🔒 보안 (Helmet, CORS, Rate Limiting)
- 📊 Swagger UI API 문서
- 📝 Winston 로깅 시스템

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정하세요.

```bash
cp .env.example .env
```

**필수 환경 변수:**

```env
# 서버 설정
NODE_ENV=development
PORT=3000
HOST=localhost

# 데이터베이스 설정
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT 설정
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS 설정
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 스키마를 적용하세요.

```bash
# 데이터베이스 스키마 적용
psql -h localhost -U postgres -d your_database -f ../database/schema.sql
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm start` | 프로덕션 모드로 서버 실행 |
| `npm run dev` | 개발 모드로 서버 실행 (nodemon) |
| `npm test` | 전체 테스트 실행 |
| `npm run test:watch` | 테스트 watch 모드 |
| `npm run test:coverage` | 테스트 커버리지 확인 |
| `npm run lint` | ESLint 실행 |
| `npm run lint:fix` | ESLint 자동 수정 |
| `npm run format` | Prettier 포맷팅 |
| `npm run format:check` | Prettier 포맷 검사 |

## 프로젝트 구조

```
backend/
├── src/
│   ├── config/              # 설정 파일
│   │   ├── database.js      # PostgreSQL Pool 설정
│   │   ├── jwt.js           # JWT 설정
│   │   └── swagger.js       # Swagger 설정
│   ├── controllers/         # 요청 처리 컨트롤러
│   │   ├── AuthController.js
│   │   ├── TodoController.js
│   │   ├── CalendarController.js
│   │   └── HolidayController.js
│   ├── services/            # 비즈니스 로직
│   │   ├── AuthService.js
│   │   ├── TodoService.js
│   │   ├── CalendarService.js
│   │   └── HolidayService.js
│   ├── models/              # 데이터 접근 레이어
│   │   ├── BaseModel.js
│   │   ├── UserModel.js
│   │   ├── TodoModel.js
│   │   └── RefreshTokenModel.js
│   ├── routes/              # API 라우팅
│   │   ├── authRoutes.js
│   │   ├── todoRoutes.js
│   │   ├── trashRoutes.js
│   │   ├── calendarRoutes.js
│   │   └── holidayRoutes.js
│   ├── middlewares/         # 미들웨어
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   ├── corsConfig.js
│   │   └── rateLimiter.js
│   ├── validators/          # 입력 검증
│   │   ├── authValidator.js
│   │   └── todoValidator.js
│   ├── utils/               # 유틸리티 함수
│   │   ├── jwtUtils.js
│   │   ├── passwordUtils.js
│   │   ├── logger.js
│   │   └── responseFormatter.js
│   ├── app.js               # Express 앱 설정
│   └── server.js            # 서버 진입점
├── tests/                   # 테스트 파일
│   ├── unit/                # 단위 테스트
│   ├── integration/         # 통합 테스트
│   └── helpers/             # 테스트 헬퍼
├── logs/                    # 로그 파일
├── API.md                   # API 상세 문서
├── vercel.json              # Vercel 배포 설정
└── package.json
```

## API 엔드포인트

### 인증 (`/api/auth`)

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

### 할 일 (`/api/todos`)

- `GET /api/todos` - 할 일 목록 조회
- `GET /api/todos/:id` - 할 일 상세 조회
- `POST /api/todos` - 할 일 생성
- `PUT /api/todos/:id` - 할 일 수정
- `DELETE /api/todos/:id` - 할 일 삭제 (소프트)
- `PATCH /api/todos/:id/complete` - 완료 상태 토글

### 휴지통 (`/api/trash`)

- `GET /api/trash` - 휴지통 목록 조회
- `POST /api/trash/:id/restore` - 할 일 복원
- `DELETE /api/trash/:id` - 영구 삭제

### 캘린더 (`/api/calendar`)

- `GET /api/calendar` - 캘린더 데이터 조회

### 공휴일 (`/api/holidays`)

- `GET /api/holidays` - 공휴일 목록 조회
- `POST /api/holidays` - 공휴일 추가 (관리자)

### 기타

- `GET /health` - 헬스 체크
- `GET /api-docs` - Swagger UI
- `GET /api-docs.json` - Swagger JSON

## API 문서

### Swagger UI

개발 서버 실행 후 브라우저에서 확인:

```
http://localhost:3000/api-docs
```

### API.md

자세한 API 문서는 `API.md` 파일을 참조하세요.

## 테스트

```bash
# 전체 테스트 실행
npm test

# 커버리지 확인
npm run test:coverage

# watch 모드
npm run test:watch
```

**현재 테스트 커버리지**: ~40% (개선 필요)

### 테스트 구조

```
tests/
├── unit/                   # 단위 테스트
│   ├── models/             # 모델 테스트
│   ├── services/           # 서비스 테스트
│   ├── utils/              # 유틸리티 테스트
│   └── middlewares/        # 미들웨어 테스트
├── integration/            # 통합 테스트
│   ├── auth/               # 인증 API 테스트
│   ├── todos/              # 할 일 API 테스트
│   └── calendar/           # 캘린더 API 테스트
└── helpers/                # 테스트 헬퍼
```

## 보안

### Rate Limiting

- **인증 API**: 15분당 5회
- **일반 API**: 15분당 100회
- **휴지통 API**: 15분당 20회
- **캘린더 API**: 15분당 50회

### 보안 미들웨어

- **Helmet**: 보안 헤더 설정
- **CORS**: 도메인 제한
- **Input Validation**: XSS/SQL Injection 방어
- **JWT**: 토큰 기반 인증

## 로깅

Winston을 사용한 로깅 시스템:

```
logs/
├── error.log        # 에러 로그
├── combined.log     # 전체 로그
├── exceptions.log   # 예외 로그
└── rejections.log   # Promise rejection 로그
```

## 코드 품질

ESLint와 Prettier를 사용하여 코드 품질을 유지합니다.

```bash
# Lint 검사
npm run lint

# Lint 자동 수정
npm run lint:fix

# 포맷팅
npm run format
```

## Vercel 배포

### 1. Vercel 프로젝트 생성

```bash
vercel
```

### 2. 환경 변수 설정

Vercel Dashboard에서 다음 환경 변수를 설정하세요:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`

### 3. 배포

```bash
vercel --prod
```

## 문제 해결

### 데이터베이스 연결 실패

1. PostgreSQL 서비스가 실행 중인지 확인
2. `DATABASE_URL` 환경 변수 확인
3. 데이터베이스 접근 권한 확인

### JWT 토큰 오류

1. `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` 환경 변수 확인
2. 토큰 만료 시간 확인

### CORS 오류

1. `.env` 파일의 `CORS_ORIGIN` 값 확인
2. 프론트엔드 도메인이 허용 목록에 있는지 확인

## 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

ISC
