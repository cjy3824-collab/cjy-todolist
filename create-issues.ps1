# GitHub 이슈 생성 스크립트
# PowerShell 스크립트

# ===== Phase 1: Database =====

# DB-1
gh issue create --title "[DB-1] 개발 환경 설정" --label "feature,infrastructure,database,complexity: low" --body @"
## 📋 개요
Supabase 프로젝트를 생성하고 로컬 개발 환경에서 데이터베이스에 연결할 수 있도록 설정합니다.

## ✅ 완료 조건
- [ ] Supabase 프로젝트 생성 완료
- [ ] Supabase 연결 정보 확인 (host, port, database name, user, password)
- [ ] PostgreSQL 클라이언트 도구 설치 (pgAdmin, DBeaver 등)
- [ ] 로컬 개발 환경에서 Supabase 데이터베이스 연결 테스트 성공
- [ ] ``.env`` 파일에 데이터베이스 연결 정보 저장
- [ ] ``.gitignore``에 ``.env`` 파일 추가 확인

## 🔧 기술적 고려사항
- Supabase 무료 티어 활용
- 데이터베이스 연결 정보 보안 (환경 변수 사용)
- PostgreSQL 15+ 사용
- 연결 테스트를 통한 환경 검증

## 📦 의존성
**선행 작업**: 없음
**후행 작업**: DB-2

## 📝 Todo
- [ ] Supabase 계정 생성 및 프로젝트 생성
- [ ] PostgreSQL 클라이언트 도구 선택 및 설치
- [ ] 환경 변수 파일 설정
- [ ] 연결 테스트 수행

## ⏱️ 예상 시간
2시간
"@

# DB-2
gh issue create --title "[DB-2] 스키마 파일 검증 및 준비" --label "feature,database,complexity: low" --body @"
## 📋 개요
데이터베이스 스키마 파일의 문법과 정의를 검증하여 실행 준비를 완료합니다.

## ✅ 완료 조건
- [ ] ``database/schema.sql`` 파일 구문 검증 (PostgreSQL 문법 체크)
- [ ] UUID 확장 모듈 사용 가능 여부 확인
- [ ] 모든 제약 조건(CONSTRAINT) 정의 검토
- [ ] 트리거 함수 동작 검증
- [ ] 뷰(View) 정의 검토
- [ ] 초기 데이터(국경일) 검증

## 🔧 기술적 고려사항
- PostgreSQL 문법 준수
- UUID 확장 모듈 활성화 필요
- 제약 조건의 비즈니스 규칙 반영
- 트리거 함수의 정확한 동작 보장

## 📦 의존성
**선행 작업**: #1 (DB-1)
**후행 작업**: DB-3

## 📝 Todo
- [ ] schema.sql 파일 구문 검사
- [ ] UUID 확장 모듈 확인
- [ ] 제약 조건 로직 검토
- [ ] 트리거 및 뷰 정의 확인
- [ ] 국경일 초기 데이터 확인

## ⏱️ 예상 시간
1시간
"@

# DB-3
gh issue create --title "[DB-3] 데이터베이스 및 테이블 생성" --label "feature,database,complexity: medium" --body @"
## 📋 개요
Supabase SQL Editor에서 스키마 파일을 실행하여 데이터베이스 테이블을 생성합니다.

## ✅ 완료 조건
- [ ] Supabase SQL Editor에서 ``database/schema.sql`` 실행
- [ ] UUID 확장 모듈 활성화 확인
- [ ] ``users`` 테이블 생성 확인
- [ ] ``todos`` 테이블 생성 확인
- [ ] 모든 제약 조건(PK, FK, UNIQUE, CHECK) 적용 확인
- [ ] 외래 키 관계 정상 동작 확인
- [ ] 테이블 코멘트 추가 확인

## 🔧 기술적 고려사항
- Users 테이블: username, email 고유성 보장
- Todos 테이블: userId 외래 키, 소프트 삭제 지원
- 제약 조건을 통한 데이터 무결성 보장
- PRD의 비즈니스 규칙 반영 (BR-01~BR-16, C-01~C-18)

## 📦 의존성
**선행 작업**: #2 (DB-2)
**후행 작업**: DB-4, DB-5

## 📝 Todo
- [ ] Supabase SQL Editor 접속
- [ ] schema.sql 파일 실행
- [ ] 테이블 생성 확인
- [ ] 제약 조건 검증
- [ ] 외래 키 관계 테스트

## ⏱️ 예상 시간
3시간
"@

# DB-4
gh issue create --title "[DB-4] 인덱스 생성 및 최적화" --label "feature,database,complexity: medium" --body @"
## 📋 개요
쿼리 성능 향상을 위한 인덱스를 생성하고 쿼리 실행 계획을 분석합니다.

## ✅ 완료 조건
- [ ] 단일 컬럼 인덱스 생성 확인 (users: username, email / todos: userId, isDeleted 등)
- [ ] 복합 인덱스 생성 확인 (idx_todos_user_active, idx_todos_calendar 등)
- [ ] 부분 인덱스(Partial Index) 생성 확인
- [ ] 인덱스 사용 계획 분석 (EXPLAIN ANALYZE)
- [ ] 쿼리 성능 테스트 (조회 쿼리 실행 시간 측정)
- [ ] 필요 시 인덱스 추가 또는 조정

## 🔧 기술적 고려사항
- 자주 조회되는 컬럼에 인덱스 생성
- 복합 인덱스를 통한 쿼리 최적화
- 부분 인덱스로 스토리지 절약
- EXPLAIN ANALYZE를 통한 성능 분석
- API 응답 시간 목표: 평균 200ms 이하 (PRD 6.3)

## 📦 의존성
**선행 작업**: #3 (DB-3)
**후행 작업**: DB-7

## 📝 Todo
- [ ] 단일 컬럼 인덱스 생성
- [ ] 복합 인덱스 생성
- [ ] 부분 인덱스 생성
- [ ] 쿼리 실행 계획 분석
- [ ] 성능 측정 및 최적화

## ⏱️ 예상 시간
2시간
"@

# DB-5
gh issue create --title "[DB-5] 트리거, 함수 및 뷰 생성" --label "feature,database,complexity: high" --body @"
## 📋 개요
데이터베이스 트리거, 함수, 뷰를 생성하여 자동화 및 쿼리 편의성을 향상시킵니다.

## ✅ 완료 조건
- [ ] ``update_updated_at_column()`` 함수 생성 확인
- [ ] ``users`` 테이블 트리거 생성 및 동작 테스트
- [ ] ``todos`` 테이블 트리거 생성 및 동작 테스트
- [ ] UPDATE 시 ``updatedAt`` 자동 갱신 확인
- [ ] ``get_user_todo_stats()`` 함수 생성 확인
- [ ] 통계 함수 동작 테스트 (샘플 데이터로 검증)
- [ ] ``v_active_todos`` 뷰 생성 확인
- [ ] ``v_public_holidays`` 뷰 생성 확인
- [ ] ``v_trash`` 뷰 생성 확인
- [ ] 각 뷰에서 데이터 조회 테스트

## 🔧 기술적 고려사항
- 트리거를 통한 updatedAt 자동 관리
- 통계 함수로 사용자 할 일 집계
- 뷰를 통한 복잡한 쿼리 단순화
- 비즈니스 로직의 데이터베이스 레벨 구현

## 📦 의존성
**선행 작업**: #3 (DB-3)
**후행 작업**: DB-6

## 📝 Todo
- [ ] 트리거 함수 생성 및 등록
- [ ] 통계 함수 구현
- [ ] 뷰 정의 및 생성
- [ ] 각 기능 동작 테스트
- [ ] 샘플 데이터로 검증

## ⏱️ 예상 시간
4시간
"@

# DB-6
gh issue create --title "[DB-6] 초기 데이터 삽입 및 제약 조건 테스트" --label "feature,database,complexity: high" --body @"
## 📋 개요
초기 국경일 데이터를 삽입하고 모든 제약 조건이 정상 작동하는지 테스트합니다.

## ✅ 완료 조건
- [ ] 2025년 한국 공휴일 데이터 삽입 확인
- [ ] 삽입된 국경일 데이터 검증 (총 15개)
- [ ] ``isPublicHoliday = TRUE`` 및 ``userId IS NULL`` 확인
- [ ] **Users 테이블 제약 조건 테스트**
  - [ ] 중복 username 삽입 시 에러 발생 확인
  - [ ] 중복 email 삽입 시 에러 발생 확인
  - [ ] 잘못된 email 형식 삽입 시 에러 발생 확인
  - [ ] username 길이 제약 테스트
- [ ] **Todos 테이블 제약 조건 테스트**
  - [ ] startDate > dueDate 삽입 시 에러 발생 확인
  - [ ] isDeleted=TRUE인데 deletedAt=NULL 삽입 시 에러 발생 확인
  - [ ] isPublicHoliday=TRUE인데 userId가 NULL이 아닌 경우 에러 확인
  - [ ] title 길이 제약 테스트 (1~200자)
  - [ ] description 길이 제약 테스트 (최대 2000자)
  - [ ] 존재하지 않는 userId 삽입 시 외래 키 에러 확인
  - [ ] 사용자 삭제 시 연관 todos 자동 삭제(CASCADE) 확인

## 🔧 기술적 고려사항
- 국경일 데이터는 모든 사용자 공통 (userId IS NULL, BR-11, BR-13)
- 제약 조건을 통한 데이터 무결성 검증
- PRD 제약사항 준수 (C-09, C-10, C-12, C-15)
- 비즈니스 규칙 검증 (BR-03, BR-12)

## 📦 의존성
**선행 작업**: #5 (DB-5)
**후행 작업**: DB-7

## 📝 Todo
- [ ] 2025년 국경일 데이터 삽입
- [ ] Users 테이블 제약 조건 테스트 수행
- [ ] Todos 테이블 제약 조건 테스트 수행
- [ ] 외래 키 및 CASCADE 동작 확인
- [ ] 테스트 결과 문서화

## ⏱️ 예상 시간
5시간
"@

# DB-7
gh issue create --title "[DB-7] 통합 쿼리 테스트 및 성능 분석" --label "feature,database,complexity: high" --body @"
## 📋 개요
실제 사용될 쿼리들을 테스트하고 성능을 분석하여 최적화합니다.

## ✅ 완료 조건
- [ ] 사용자별 할 일 조회 쿼리 테스트 (활성/삭제 구분)
- [ ] 캘린더 조회 쿼리 테스트 (날짜별 할 일 및 국경일)
- [ ] 휴지통 조회 쿼리 테스트
- [ ] 국경일 조회 쿼리 테스트
- [ ] 사용자 통계 조회 함수 테스트 (``get_user_todo_stats()``)
- [ ] 각 쿼리 실행 계획 분석 (EXPLAIN ANALYZE)
- [ ] 인덱스 사용 여부 확인
- [ ] 쿼리 응답 시간 측정 및 최적화
- [ ] 대량 데이터 삽입 후 성능 재측정 (1000+ todos)

## 🔧 기술적 고려사항
- API 주요 쿼리 시나리오 검증
- 인덱스 효과 측정
- 대량 데이터 처리 성능 확인
- 목표 응답 시간: 평균 200ms 이하 (PRD 6.3)
- 비즈니스 규칙 준수 확인 (BR-01, BR-02, BR-06, BR-10, BR-14, BR-15, BR-16)

## 📦 의존성
**선행 작업**: #4 (DB-4), #6 (DB-6)
**후행 작업**: DB-8

## 📝 Todo
- [ ] 주요 쿼리 시나리오 정의
- [ ] 각 쿼리 실행 및 테스트
- [ ] EXPLAIN ANALYZE 수행
- [ ] 대량 데이터 생성 및 성능 측정
- [ ] 최적화 적용 및 재측정

## ⏱️ 예상 시간
5시간
"@

# DB-8
gh issue create --title "[DB-8] 문서화 및 마이그레이션 가이드 작성" --label "documentation,database,complexity: medium" --body @"
## 📋 개요
데이터베이스 설치, 마이그레이션, 운영을 위한 문서를 작성합니다.

## ✅ 완료 조건
- [ ] 데이터베이스 설치 가이드 작성
- [ ] 스키마 마이그레이션 절차 문서화
- [ ] 주요 쿼리 예제 문서 작성
- [ ] 인덱스 설계 근거 문서화
- [ ] 제약 조건 및 비즈니스 규칙 설명
- [ ] 백업 및 복원 절차 문서화
- [ ] 성능 튜닝 가이드 작성
- [ ] 트러블슈팅 가이드 작성
- [ ] ``database/README.md`` 파일 작성

## 🔧 기술적 고려사항
- 개발자 온보딩 용이성
- 운영 및 유지보수 편의성
- Supabase 환경 특성 반영
- 데이터베이스 백업 전략 (Supabase 자동 백업 활용)

## 📦 의존성
**선행 작업**: #7 (DB-7)
**후행 작업**: 없음 (Database Phase 완료)

## 📝 Todo
- [ ] database/README.md 작성
- [ ] 설치 및 마이그레이션 가이드 작성
- [ ] 쿼리 예제 문서 작성
- [ ] 운영 가이드 작성
- [ ] 트러블슈팅 가이드 작성

## ⏱️ 예상 시간
6시간
"@

# ===== Phase 2: Backend =====

# BE-1
gh issue create --title "[BE-1] 프로젝트 초기화 및 의존성 설치" --label "feature,infrastructure,backend,complexity: low" --body @"
## 📋 개요
백엔드 프로젝트를 초기화하고 필요한 npm 패키지를 설치합니다.

## ✅ 완료 조건
- [ ] ``backend/`` 디렉토리 생성
- [ ] ``npm init`` 실행 및 ``package.json`` 생성
- [ ] 프로젝트 메타데이터 설정
- [ ] ``.gitignore``, ``.env.example`` 파일 생성
- [ ] **프로덕션 의존성 설치**
  - [ ] express, pg, dotenv, bcrypt, jsonwebtoken
  - [ ] cors, helmet, express-validator, express-rate-limit
- [ ] **개발 의존성 설치**
  - [ ] nodemon, jest, supertest, eslint, prettier
- [ ] ``package.json``에 scripts 추가 (start, dev, test, lint)

## 🔧 기술적 고려사항
- Node.js 18+ 사용 (PRD 6.2)
- Express 4.x 프레임워크 (PRD 6.2)
- PostgreSQL 클라이언트 (pg)
- JWT 기반 인증 준비
- 보안 미들웨어 (helmet, cors, rate-limit)

## 📦 의존성
**선행 작업**: #3 (DB-3 - 데이터베이스 생성 완료 필요)
**후행 작업**: BE-2

## 📝 Todo
- [ ] backend/ 디렉토리 생성
- [ ] npm 프로젝트 초기화
- [ ] 의존성 패키지 설치
- [ ] npm scripts 설정
- [ ] .gitignore, .env.example 작성

## ⏱️ 예상 시간
3시간
"@

# BE-2
gh issue create --title "[BE-2] 프로젝트 폴더 구조 및 환경 설정" --label "feature,infrastructure,backend,complexity: low" --body @"
## 📋 개요
백엔드 프로젝트의 폴더 구조를 생성하고 환경 설정 파일을 작성합니다.

## ✅ 완료 조건
- [ ] 계층별 디렉토리 생성
  - [ ] ``src/controllers/``, ``src/services/``, ``src/models/``
  - [ ] ``src/middlewares/``, ``src/routes/``, ``src/utils/``
  - [ ] ``src/config/``, ``src/validators/``
- [ ] ``tests/`` 디렉토리 생성
- [ ] ``.env`` 파일 생성 및 환경 변수 정의
  - [ ] PORT, DATABASE_URL
  - [ ] JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
  - [ ] JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
  - [ ] NODE_ENV
- [ ] ``src/config/database.js`` 생성 (PostgreSQL Pool 설정)
- [ ] ``src/config/jwt.js`` 생성 (JWT 설정)
- [ ] 데이터베이스 연결 테스트 스크립트 작성 및 실행

## 🔧 기술적 고려사항
- 계층형 아키텍처 (Controller-Service-Model)
- 환경 변수를 통한 설정 관리
- Supabase PostgreSQL 연결 설정
- JWT 토큰 설정 (Access + Refresh Token, PRD C-04, C-05)

## 📦 의존성
**선행 작업**: #9 (BE-1)
**후행 작업**: BE-3, BE-4

## 📝 Todo
- [ ] 폴더 구조 생성
- [ ] 환경 변수 파일 설정
- [ ] database.js 작성
- [ ] jwt.js 작성
- [ ] DB 연결 테스트 수행

## ⏱️ 예상 시간
3시간
"@

# BE-3
gh issue create --title "[BE-3] 데이터베이스 모델 레이어 구현" --label "feature,backend,complexity: medium" --body @"
## 📋 개요
데이터베이스와 상호작용하는 모델 레이어를 구현합니다.

## ✅ 완료 조건
- [ ] ``src/models/db.js`` 생성 (PostgreSQL Pool 초기화)
- [ ] ``src/models/BaseModel.js`` 생성 (공통 CRUD 메서드)
- [ ] **``src/models/UserModel.js`` 생성**
  - [ ] ``findByUsername()``, ``findByEmail()``, ``findById()``
  - [ ] ``create()``, ``update()`` 메서드
- [ ] **``src/models/TodoModel.js`` 생성**
  - [ ] ``findById()``, ``findByUserId()`` (활성 todos)
  - [ ] ``create()``, ``update()``, ``softDelete()``, ``hardDelete()``
  - [ ] ``findDeletedByUserId()``, ``restore()``
  - [ ] ``findByDateRange()``, ``findPublicHolidays()``
- [ ] ``src/models/RefreshTokenModel.js`` 생성
  - [ ] Refresh Token 저장/조회/삭제 메서드
- [ ] 단위 테스트 작성 (UserModel, TodoModel)

## 🔧 기술적 고려사항
- Parameterized Queries로 SQL Injection 방어 (PRD 7.1)
- 소프트 삭제 구현 (isDeleted 플래그, PRD C-03, BR-07)
- 국경일 조회 지원 (userId IS NULL, BR-11, BR-13)
- 비즈니스 규칙 반영 (BR-01, BR-02, BR-06, BR-10)

## 📦 의존성
**선행 작업**: #10 (BE-2)
**후행 작업**: BE-6, BE-8

## 📝 Todo
- [ ] BaseModel 공통 메서드 구현
- [ ] UserModel 구현
- [ ] TodoModel 구현
- [ ] RefreshTokenModel 구현
- [ ] 단위 테스트 작성

## ⏱️ 예상 시간
5시간
"@

# BE-4
gh issue create --title "[BE-4] 공통 미들웨어 및 유틸리티 구현" --label "feature,backend,complexity: medium" --body @"
## 📋 개요
인증, 에러 처리, 로깅 등 공통으로 사용되는 미들웨어와 유틸리티 함수를 구현합니다.

## ✅ 완료 조건
- [ ] **미들웨어 생성**
  - [ ] ``src/middlewares/errorHandler.js`` (전역 에러 핸들러, 커스텀 에러 클래스)
  - [ ] ``src/middlewares/authMiddleware.js`` (JWT 토큰 검증)
  - [ ] ``src/middlewares/requestLogger.js`` (요청 로깅)
  - [ ] ``src/middlewares/corsConfig.js`` (CORS 설정)
  - [ ] ``src/middlewares/rateLimiter.js`` (Rate limiting)
- [ ] **유틸리티 함수 생성**
  - [ ] ``src/utils/jwtUtils.js`` (generateAccessToken, generateRefreshToken, verifyToken)
  - [ ] ``src/utils/passwordUtils.js`` (hashPassword, comparePassword)
  - [ ] ``src/utils/responseFormatter.js`` (성공/에러 응답 포맷)
- [ ] 미들웨어 및 유틸리티 단위 테스트 작성

## 🔧 기술적 고려사항
- JWT 기반 인증 (PRD C-04, C-05)
- bcrypt를 통한 비밀번호 암호화 (PRD C-01, 7.1)
- CORS 설정 (PRD 7.1)
- Rate Limiting으로 DDoS 방어 (PRD 7.1)
- 인증되지 않은 사용자 접근 차단 (PRD C-06, BR-01)

## 📦 의존성
**선행 작업**: #10 (BE-2)
**후행 작업**: BE-5, BE-6

## 📝 Todo
- [ ] 에러 핸들러 및 커스텀 에러 클래스 구현
- [ ] JWT 미들웨어 구현
- [ ] 기타 미들웨어 구현
- [ ] 유틸리티 함수 구현
- [ ] 단위 테스트 작성

## ⏱️ 예상 시간
6시간
"@

# BE-5
gh issue create --title "[BE-5] Express 서버 기본 설정" --label "feature,backend,complexity: low" --body @"
## 📋 개요
Express 애플리케이션을 설정하고 서버를 시작합니다.

## ✅ 완료 조건
- [ ] ``src/app.js`` 생성 (Express 앱 설정)
  - [ ] 미들웨어 등록 (cors, helmet, express.json, express.urlencoded)
  - [ ] 라우터 등록
  - [ ] 에러 핸들러 등록
- [ ] ``src/server.js`` 생성 (서버 시작)
- [ ] 헬스 체크 엔드포인트 구현 (``GET /health``)
- [ ] 404 핸들러 구현
- [ ] 서버 시작 테스트 (포트 리스닝 확인)

## 🔧 기술적 고려사항
- Express 미들웨어 체인 순서
- helmet을 통한 보안 강화 (PRD 7.1)
- CORS 설정 (PRD 7.1)
- 헬스 체크 엔드포인트로 모니터링 지원
- REST API 구조 (PRD 6.2)

## 📦 의존성
**선행 작업**: #12 (BE-4)
**후행 작업**: BE-6, BE-11

## 📝 Todo
- [ ] app.js 작성
- [ ] server.js 작성
- [ ] 헬스 체크 엔드포인트 구현
- [ ] 404 핸들러 구현
- [ ] 서버 시작 테스트

## ⏱️ 예상 시간
2시간
"@

# BE-6
gh issue create --title "[BE-6] 회원가입 API 구현" --label "feature,backend,complexity: medium" --body @"
## 📋 개요
사용자 회원가입 API를 구현합니다.

## ✅ 완료 조건
- [ ] ``src/validators/authValidator.js`` 생성 (회원가입 입력 검증)
- [ ] ``src/services/AuthService.js`` 생성
  - [ ] ``signUp()`` 메서드 (중복 확인, 비밀번호 해싱, 사용자 생성)
- [ ] ``src/controllers/AuthController.js`` 생성
  - [ ] ``signUp()`` 컨트롤러
- [ ] ``src/routes/authRoutes.js`` 생성
  - [ ] ``POST /api/auth/signup`` 라우트
- [ ] 단위 테스트 작성 (AuthService.signUp)
- [ ] 통합 테스트 작성 (POST /api/auth/signup)

## 🔧 기술적 고려사항
- PRD UC-01: 회원가입 기능 명세 준수
- username, email 중복 확인 (PRD C-11)
- 비밀번호 암호화 (bcrypt, PRD C-01, 7.1)
- 이메일 유효성 검증
- 입력 검증을 통한 XSS 방어 (PRD 7.1)

## 📦 의존성
**선행 작업**: #11 (BE-3), #12 (BE-4)
**후행 작업**: BE-7

## 📝 Todo
- [ ] 입력 검증 로직 구현
- [ ] AuthService.signUp 구현
- [ ] AuthController.signUp 구현
- [ ] 라우트 설정
- [ ] 단위 및 통합 테스트 작성

## ⏱️ 예상 시간
5시간
"@

# BE-7
gh issue create --title "[BE-7] 로그인 및 토큰 관리 API 구현" --label "feature,backend,complexity: high" --body @"
## 📋 개요
로그인, 토큰 갱신, 로그아웃 API를 구현합니다.

## ✅ 완료 조건
- [ ] **로그인 API**
  - [ ] ``src/validators/authValidator.js`` 업데이트 (로그인 입력 검증)
  - [ ] ``AuthService.signIn()`` 메서드 (사용자 인증, 토큰 생성/저장)
  - [ ] ``AuthController.signIn()`` 컨트롤러
  - [ ] ``POST /api/auth/signin`` 라우트
- [ ] **토큰 갱신 API**
  - [ ] ``AuthService.refreshAccessToken()`` 메서드
  - [ ] ``AuthController.refreshToken()`` 컨트롤러
  - [ ] ``POST /api/auth/refresh`` 라우트
- [ ] **로그아웃 API**
  - [ ] ``AuthService.signOut()`` 메서드 (Refresh Token 삭제)
  - [ ] ``AuthController.signOut()`` 컨트롤러
  - [ ] ``POST /api/auth/signout`` 라우트
- [ ] 단위 테스트 및 통합 테스트 작성

## 🔧 기술적 고려사항
- PRD UC-02, UC-03: 로그인/로그아웃 기능 명세
- JWT 기반 인증 (Access + Refresh Token, PRD C-04, C-05)
- 비밀번호 검증 (bcrypt.compare)
- Refresh Token 관리 및 보안
- 인증 플로우 (PRD 6.3)

## 📦 의존성
**선행 작업**: #14 (BE-6)
**후행 작업**: BE-8

## 📝 Todo
- [ ] 로그인 API 구현
- [ ] 토큰 갱신 API 구현
- [ ] 로그아웃 API 구현
- [ ] 단위 및 통합 테스트 작성
- [ ] 인증 플로우 E2E 테스트

## ⏱️ 예상 시간
8시간
"@

# BE-8
gh issue create --title "[BE-8] Todo CRUD API 구현" --label "feature,backend,complexity: high" --body @"
## 📋 개요
할 일 생성, 조회, 수정, 삭제, 완료 토글 API를 구현합니다.

## ✅ 완료 조건
- [ ] ``src/validators/todoValidator.js`` 생성 (Todo 생성/수정 입력 검증)
- [ ] ``src/services/TodoService.js`` 생성
  - [ ] ``getTodosByUserId()``, ``getTodoById()``
  - [ ] ``createTodo()``, ``updateTodo()``, ``deleteTodo()`` (소프트 삭제)
- [ ] ``src/controllers/TodoController.js`` 생성
  - [ ] ``getTodos()``, ``getTodoById()``, ``createTodo()``
  - [ ] ``updateTodo()``, ``deleteTodo()``, ``toggleComplete()``
- [ ] ``src/routes/todoRoutes.js`` 생성
  - [ ] ``GET /api/todos``, ``GET /api/todos/:id``
  - [ ] ``POST /api/todos``, ``PUT /api/todos/:id``
  - [ ] ``DELETE /api/todos/:id``, ``PATCH /api/todos/:id/complete``
- [ ] 단위 테스트 작성 (TodoModel, TodoService)
- [ ] 통합 테스트 작성 (모든 엔드포인트)

## 🔧 기술적 고려사항
- PRD UC-04~UC-09: 할 일 관리 기능 명세
- 소프트 삭제 구현 (isDeleted, PRD C-03, BR-07)
- 본인 소유 할 일만 접근 (PRD C-07, BR-02)
- 제목 필수, 길이 제약 (PRD BR-04, C-09, C-10)
- startDate, dueDate 검증 (PRD C-12)
- 완료된 할 일 수정/삭제 불가 (PRD C-15)

## 📦 의존성
**선행 작업**: #11 (BE-3), #12 (BE-4)
**후행 작업**: BE-9, BE-10

## 📝 Todo
- [ ] 입력 검증 로직 구현
- [ ] TodoService 구현
- [ ] TodoController 구현
- [ ] 라우트 설정
- [ ] 단위 및 통합 테스트 작성

## ⏱️ 예상 시간
9시간
"@

# BE-9
gh issue create --title "[BE-9] 휴지통 API 구현" --label "feature,backend,complexity: medium" --body @"
## 📋 개요
휴지통 조회, 복구, 영구 삭제 API를 구현합니다.

## ✅ 완료 조건
- [ ] ``TodoService`` 업데이트
  - [ ] ``getTrashByUserId()``, ``restoreTodo()``, ``permanentlyDeleteTodo()``
- [ ] ``TodoController`` 업데이트
  - [ ] ``getTrash()``, ``restoreTodo()``, ``permanentlyDelete()``
- [ ] ``src/routes/trashRoutes.js`` 생성
  - [ ] ``GET /api/trash``
  - [ ] ``POST /api/trash/:id/restore``
  - [ ] ``DELETE /api/trash/:id`` (영구 삭제)
- [ ] 통합 테스트 작성

## 🔧 기술적 고려사항
- PRD UC-10~UC-12: 휴지통 관리 기능 명세
- 소프트 삭제된 할 일만 조회 (isDeleted=true, BR-08)
- 복구 시 isDeleted=false, deletedAt=null
- 영구 삭제는 복구 불가 (BR-09)
- 본인 소유 할 일만 접근 (PRD C-07, BR-02)

## 📦 의존성
**선행 작업**: #16 (BE-8)
**후행 작업**: 없음

## 📝 Todo
- [ ] TodoService 메서드 추가
- [ ] TodoController 메서드 추가
- [ ] 라우트 설정
- [ ] 통합 테스트 작성
- [ ] 휴지통 E2E 테스트

## ⏱️ 예상 시간
4시간
"@

# BE-10
gh issue create --title "[BE-10] 캘린더 및 국경일 API 구현" --label "feature,backend,complexity: high" --body @"
## 📋 개요
캘린더 조회 및 국경일 관리 API를 구현합니다.

## ✅ 완료 조건
- [ ] **캘린더 API**
  - [ ] ``src/services/CalendarService.js`` 생성
  - [ ] ``getCalendarData()`` 메서드 (사용자 할 일 + 국경일 병합)
  - [ ] ``src/controllers/CalendarController.js`` 생성
  - [ ] ``src/routes/calendarRoutes.js`` 생성
  - [ ] ``GET /api/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD``
- [ ] **국경일 API**
  - [ ] ``src/services/HolidayService.js`` 생성
  - [ ] ``getPublicHolidays()``, ``addPublicHoliday()`` (관리자 전용)
  - [ ] ``src/controllers/HolidayController.js`` 생성
  - [ ] ``src/routes/holidayRoutes.js`` 생성
  - [ ] ``GET /api/holidays``, ``POST /api/holidays``
- [ ] 단위 테스트 및 통합 테스트 작성

## 🔧 기술적 고려사항
- PRD UC-13~UC-16: 캘린더 및 국경일 기능 명세
- 개인 할 일 + 국경일 병합 (BR-14)
- 만료 기한 없는 할 일 제외 (BR-15)
- 삭제된 할 일 제외 (BR-16)
- 국경일 관리는 관리자만 가능 (BR-03, BR-12)
- 날짜 범위 필터링

## 📦 의존성
**선행 작업**: #16 (BE-8)
**후행 작업**: 없음

## 📝 Todo
- [ ] CalendarService 구현
- [ ] HolidayService 구현
- [ ] 각 Controller 구현
- [ ] 라우트 설정
- [ ] 단위 및 통합 테스트 작성

## ⏱️ 예상 시간
8시간
"@

# BE-11
gh issue create --title "[BE-11] 보안 강화 및 입력 검증" --label "feature,backend,complexity: medium" --body @"
## 📋 개요
보안 미들웨어를 강화하고 모든 API의 입력 검증을 보완합니다.

## ✅ 완료 조건
- [ ] **Rate Limiting 설정**
  - [ ] 인증 API: 5 requests/15분
  - [ ] 일반 API: 100 requests/15분
- [ ] **보안 미들웨어 강화**
  - [ ] ``helmet`` 설정 커스터마이징
  - [ ] CORS 화이트리스트 설정
  - [ ] SQL Injection 방어 확인 (Parameterized Queries)
  - [ ] XSS 방어 확인
- [ ] **입력 검증 보완**
  - [ ] 모든 API 엔드포인트 입력 검증 강화
  - [ ] 커스텀 에러 메시지 정의
  - [ ] 에러 로깅 시스템 구축 (Winston 또는 Pino)
- [ ] 보안 테스트 작성

## 🔧 기술적 고려사항
- PRD 7.1: 보안 요구사항 준수
- HTTPS 사용 (Vercel 자동 제공)
- Rate Limiting으로 DDoS 방어
- SQL Injection 방어 (Parameterized Queries)
- XSS 방어 (입력값 검증 및 이스케이프)
- CORS 정책 (허용된 도메인만 접근)

## 📦 의존성
**선행 작업**: #13 (BE-5)
**후행 작업**: BE-12

## 📝 Todo
- [ ] Rate Limiting 설정
- [ ] helmet 커스터마이징
- [ ] CORS 화이트리스트 설정
- [ ] 입력 검증 강화
- [ ] 에러 로깅 시스템 구축
- [ ] 보안 테스트 작성

## ⏱️ 예상 시간
6시간
"@

# BE-12
gh issue create --title "[BE-12] 테스트 및 커버리지 확인" --label "feature,backend,complexity: high" --body @"
## 📋 개요
모든 백엔드 코드의 단위 테스트와 통합 테스트를 완성하고 커버리지를 확인합니다.

## ✅ 완료 조건
- [ ] **단위 테스트 완성**
  - [ ] 모든 Service 레이어 단위 테스트 작성
  - [ ] 모든 Model 레이어 단위 테스트 작성
  - [ ] 모든 유틸리티 함수 단위 테스트 작성
  - [ ] Service 레이어 커버리지 90% 이상 달성
- [ ] **통합 테스트 완성**
  - [ ] 모든 API 엔드포인트 통합 테스트 작성
  - [ ] 인증 플로우 E2E 테스트
  - [ ] Todo CRUD E2E 테스트
  - [ ] 휴지통, 캘린더 E2E 테스트
  - [ ] 에러 케이스 테스트 (401, 403, 404, 422, 500)
  - [ ] 통합 테스트 커버리지 80% 이상 달성
- [ ] Jest 커버리지 측정 (``npm run test:coverage``)
- [ ] 전체 코드 커버리지 80% 이상 달성

## 🔧 기술적 고려사항
- Jest, Supertest 사용
- 모든 비즈니스 로직 테스트
- 에러 케이스 포함
- 목표 커버리지: 80% 이상
- CI/CD 준비 (향후)

## 📦 의존성
**선행 작업**: #9~#18 (BE-1~BE-11)
**후행 작업**: BE-13

## 📝 Todo
- [ ] Service 레이어 단위 테스트 작성
- [ ] Model 레이어 단위 테스트 작성
- [ ] 유틸리티 단위 테스트 작성
- [ ] API 엔드포인트 통합 테스트 작성
- [ ] E2E 테스트 작성
- [ ] 커버리지 측정 및 개선

## ⏱️ 예상 시간
11시간
"@

# BE-13
gh issue create --title "[BE-13] Vercel 배포 및 문서화" --label "feature,infrastructure,backend,documentation,complexity: medium" --body @"
## 📋 개요
백엔드 API를 Vercel에 배포하고 API 문서를 작성합니다.

## ✅ 완료 조건
- [ ] ``vercel.json`` 설정 파일 생성
- [ ] Vercel 프로젝트 생성 및 연결
- [ ] 환경 변수 설정 (Vercel Dashboard)
- [ ] Supabase 데이터베이스 연결 테스트
- [ ] Vercel 배포 성공 확인
- [ ] 배포된 API Health Check 확인
- [ ] **API 문서 작성**
  - [ ] 엔드포인트 목록
  - [ ] 요청/응답 예제
  - [ ] 인증 방식 설명
  - [ ] 에러 코드 정의
- [ ] **``backend/README.md`` 작성**
  - [ ] 프로젝트 소개, 설치/실행 방법
  - [ ] 환경 변수 설정 가이드
  - [ ] API 문서 링크, 테스트 실행 방법

## 🔧 기술적 고려사항
- PRD 6.2: Vercel을 통한 백엔드 호스팅
- Supabase PostgreSQL 연결 (PRD 6.2)
- 환경 변수 보안 관리
- HTTPS 자동 제공 (PRD 7.1)
- 시스템 가동률 목표: 99.5% 이상 (PRD 6.3)

## 📦 의존성
**선행 작업**: #20 (BE-12)
**후행 작업**: 없음 (Backend Phase 완료)

## 📝 Todo
- [ ] vercel.json 작성
- [ ] Vercel 프로젝트 설정
- [ ] 환경 변수 설정
- [ ] 배포 및 테스트
- [ ] API 문서 작성
- [ ] backend/README.md 작성

## ⏱️ 예상 시간
5시간
"@

# ===== Phase 3: Frontend =====

# FE-1
gh issue create --title "[FE-1] React 프로젝트 초기화 및 의존성 설치" --label "feature,infrastructure,frontend,complexity: low" --body @"
## 📋 개요
Vite로 React 프로젝트를 초기화하고 필요한 npm 패키지를 설치합니다.

## ✅ 완료 조건
- [ ] ``frontend/`` 디렉토리 생성
- [ ] Vite로 React 프로젝트 생성
- [ ] ``.gitignore``, ``.env.example`` 파일 확인
- [ ] **프로덕션 의존성 설치**
  - [ ] react-router-dom, zustand, axios
  - [ ] date-fns 또는 dayjs
  - [ ] react-hot-toast 또는 sonner
- [ ] **Tailwind CSS 설치 및 설정**
  - [ ] tailwindcss, postcss, autoprefixer 설치
  - [ ] ``tailwind.config.js`` 생성
  - [ ] ``src/index.css``에 Tailwind directives 추가
- [ ] **개발 의존성 설치**
  - [ ] eslint, prettier
  - [ ] @testing-library/react, vitest
- [ ] 개발 서버 실행 테스트 (``npm run dev``)

## 🔧 기술적 고려사항
- PRD 6.2: React 18.x, Zustand, Tailwind CSS 3.x, Axios, React Router 6.x
- Vite를 통한 빠른 개발 환경
- Tailwind CSS로 스타일링
- 반응형 디자인 준비 (PRD C-18)

## 📦 의존성
**선행 작업**: 없음
**후행 작업**: FE-2

## 📝 Todo
- [ ] Vite React 프로젝트 생성
- [ ] 의존성 패키지 설치
- [ ] Tailwind CSS 설정
- [ ] 개발 서버 실행 테스트
- [ ] .gitignore, .env.example 확인

## ⏱️ 예상 시간
3시간
"@

# FE-2
gh issue create --title "[FE-2] 프로젝트 폴더 구조 및 Axios 설정" --label "feature,infrastructure,frontend,complexity: medium" --body @"
## 📋 개요
프론트엔드 프로젝트의 폴더 구조를 생성하고 Axios를 설정합니다.

## ✅ 완료 조건
- [ ] 계층별 디렉토리 생성
  - [ ] ``src/components/`` (common, layout)
  - [ ] ``src/pages/``, ``src/hooks/``, ``src/store/``
  - [ ] ``src/services/``, ``src/utils/``, ``src/constants/``, ``src/styles/``
- [ ] ``.env.local`` 파일 생성 (``VITE_API_BASE_URL``)
- [ ] **``src/services/api.js`` 생성**
  - [ ] Axios 인스턴스 생성 (baseURL 설정)
  - [ ] Request Interceptor (Access Token 자동 포함)
  - [ ] Response Interceptor (토큰 만료 시 자동 갱신)
  - [ ] 에러 핸들링 (401, 403, 500)
- [ ] ``src/services/authApi.js`` 생성
  - [ ] ``signUp()``, ``signIn()``, ``signOut()``, ``refreshToken()``
- [ ] API 연결 테스트 (Health Check 호출)

## 🔧 기술적 고려사항
- Axios 인터셉터를 통한 토큰 관리
- 자동 토큰 갱신 로직 (PRD C-05)
- 에러 핸들링 및 사용자 피드백
- 백엔드 API 연동 준비
- HTTPS 통신 (PRD 7.1)

## 📦 의존성
**선행 작업**: #22 (FE-1)
**후행 작업**: FE-3

## 📝 Todo
- [ ] 폴더 구조 생성
- [ ] 환경 변수 파일 설정
- [ ] api.js 작성 (Axios 인스턴스, 인터셉터)
- [ ] authApi.js 작성
- [ ] Health Check 연결 테스트

## ⏱️ 예상 시간
3시간
"@

# FE-3
gh issue create --title "[FE-3] React Router 및 Zustand 스토어 설정" --label "feature,frontend,complexity: high" --body @"
## 📋 개요
React Router로 라우팅을 설정하고 Zustand 스토어를 구현합니다.

## ✅ 완료 조건
- [ ] **React Router 설정**
  - [ ] ``src/App.jsx`` 업데이트 (BrowserRouter)
  - [ ] ``src/routes/index.jsx`` 생성 (라우트 정의)
    - [ ] ``/signin``, ``/signup``, ``/todos``, ``/calendar``, ``/trash``, ``/profile``, ``*`` (404)
  - [ ] ``src/components/ProtectedRoute.jsx`` 생성 (인증 라우트 보호)
- [ ] **Zustand 스토어 구현**
  - [ ] ``src/store/authStore.js`` (user, accessToken, isAuthenticated, setUser, setToken, logout, checkAuth)
  - [ ] ``src/store/todoStore.js`` (todos, isLoading, error, setTodos, addTodo, updateTodo, deleteTodo, toggleComplete)
  - [ ] ``src/store/calendarStore.js`` (calendarData, selectedDate, setCalendarData, setSelectedDate, fetchCalendarData)
  - [ ] ``src/store/trashStore.js`` (trashedTodos, isLoading, setTrash, restoreTodo, permanentlyDelete)
- [ ] Zustand DevTools 설정 (개발 환경)
- [ ] 라우팅 및 스토어 단위 테스트 작성

## 🔧 기술적 고려사항
- PRD 6.2: React Router 6.x, Zustand
- 인증 라우트 보호 (PRD C-06, BR-01)
- 전역 상태 관리 (인증, 할 일, 캘린더, 휴지통)
- localStorage를 통한 인증 상태 유지
- 라우팅 구조 (PRD 11.4 UI 컴포넌트 참고)

## 📦 의존성
**선행 작업**: #23 (FE-2)
**후행 작업**: FE-5, FE-6, FE-10

## 📝 Todo
- [ ] React Router 설정
- [ ] ProtectedRoute 구현
- [ ] authStore 구현
- [ ] todoStore 구현
- [ ] calendarStore 구현
- [ ] trashStore 구현
- [ ] 단위 테스트 작성

## ⏱️ 예상 시간
7시간
"@

# FE-4
gh issue create --title "[FE-4] 공통 컴포넌트 구현" --label "feature,frontend,complexity: medium" --body @"
## 📋 개요
재사용 가능한 공통 UI 컴포넌트를 구현합니다.

## ✅ 완료 조건
- [ ] ``src/components/common/Button.jsx`` 생성
  - [ ] variants: primary, secondary, danger, ghost
  - [ ] sizes: sm, md, lg
  - [ ] loading 상태 지원
- [ ] ``src/components/common/Input.jsx`` 생성
  - [ ] 타입별 Input (text, email, password, date)
  - [ ] 에러 메시지 표시
- [ ] ``src/components/common/Modal.jsx`` 생성
  - [ ] 열기/닫기 애니메이션, 외부 클릭 시 닫기
- [ ] ``src/components/common/Checkbox.jsx`` 생성
- [ ] ``src/components/common/Loading.jsx`` 생성 (스피너)
- [ ] ``src/components/common/ErrorMessage.jsx`` 생성
- [ ] Tailwind CSS로 스타일링
- [ ] 각 컴포넌트 단위 테스트 작성

## 🔧 기술적 고려사항
- PRD 8.4: UI 컴포넌트 설계
- 재사용 가능한 컴포넌트
- Tailwind CSS 활용 (PRD 6.2)
- 접근성 고려 (ARIA 속성)
- 미니멀 디자인 (PRD 8.1)

## 📦 의존성
**선행 작업**: #22 (FE-1)
**후행 작업**: FE-5, FE-6, FE-7, FE-8, FE-9

## 📝 Todo
- [ ] Button 컴포넌트 구현
- [ ] Input 컴포넌트 구현
- [ ] Modal 컴포넌트 구현
- [ ] Checkbox 컴포넌트 구현
- [ ] Loading 컴포넌트 구현
- [ ] ErrorMessage 컴포넌트 구현
- [ ] 단위 테스트 작성

## ⏱️ 예상 시간
8시간
"@

# FE-5
gh issue create --title "[FE-5] 레이아웃 컴포넌트 구현" --label "feature,frontend,complexity: medium" --body @"
## 📋 개요
애플리케이션의 레이아웃 컴포넌트를 구현합니다.

## ✅ 완료 조건
- [ ] ``src/components/layout/Header.jsx`` 생성
  - [ ] 로고/타이틀
  - [ ] 네비게이션 메뉴 (Todos, Calendar, Trash, Profile)
  - [ ] 로그아웃 버튼
- [ ] ``src/components/layout/MainLayout.jsx`` 생성
  - [ ] Header + Content 영역 구성
- [ ] 반응형 디자인 적용 (모바일, 태블릿, 데스크톱)
- [ ] 레이아웃 컴포넌트 통합 테스트

## 🔧 기술적 고려사항
- PRD 8.3: 반응형 디자인 (C-18)
- 데스크톱 우선 설계
- 네비게이션 메뉴 구조
- 인증 상태에 따른 UI 변경
- 미니멀 디자인 (PRD 8.1)

## 📦 의존성
**선행 작업**: #24 (FE-3), #25 (FE-4)
**후행 작업**: FE-6, FE-7, FE-8, FE-9

## 📝 Todo
- [ ] Header 컴포넌트 구현
- [ ] MainLayout 컴포넌트 구현
- [ ] 반응형 스타일 적용
- [ ] 네비게이션 로직 구현
- [ ] 통합 테스트 작성

## ⏱️ 예상 시간
4시간
"@

# FE-6
gh issue create --title "[FE-6] 회원가입/로그인 페이지 구현" --label "feature,frontend,complexity: medium" --body @"
## 📋 개요
사용자 회원가입 및 로그인 페이지를 구현합니다.

## ✅ 완료 조건
- [ ] **``src/pages/SignUpPage.jsx`` 생성**
  - [ ] 회원가입 폼 (username, email, password, confirmPassword)
  - [ ] 입력 검증 (이메일 형식, 비밀번호 강도, 필수 필드)
  - [ ] authApi.signUp() 호출
  - [ ] 성공 시 로그인 페이지로 리다이렉트
  - [ ] 에러 메시지 표시
- [ ] **``src/pages/SignInPage.jsx`` 생성**
  - [ ] 로그인 폼 (username, password)
  - [ ] authApi.signIn() 호출
  - [ ] 성공 시 authStore 업데이트 및 /todos로 리다이렉트
  - [ ] 에러 메시지 표시
  - [ ] "회원가입" 링크
- [ ] 토스트 알림 통합 (성공/실패 메시지)
- [ ] E2E 테스트 작성 (회원가입 → 로그인 플로우)

## 🔧 기술적 고려사항
- PRD UC-01, UC-02: 회원가입/로그인 기능 명세
- 입력 검증 (클라이언트 측)
- 에러 핸들링 및 사용자 피드백
- 인증 플로우 (PRD 6.3)
- 토스트 알림 (react-hot-toast 또는 sonner)

## 📦 의존성
**선행 작업**: #24 (FE-3), #25 (FE-4)
**후행 작업**: FE-7

## 📝 Todo
- [ ] SignUpPage 구현
- [ ] SignInPage 구현
- [ ] 입력 검증 로직 구현
- [ ] 토스트 알림 통합
- [ ] E2E 테스트 작성

## ⏱️ 예상 시간
8시간
"@

# FE-7
gh issue create --title "[FE-7] 할 일 목록 (Todos) 페이지 구현" --label "feature,frontend,complexity: high" --body @"
## 📋 개요
할 일 목록을 조회하고 관리하는 페이지를 구현합니다.

## ✅ 완료 조건
- [ ] ``src/services/todoApi.js`` 생성
  - [ ] ``getTodos()``, ``createTodo()``, ``updateTodo()``, ``deleteTodo()``, ``toggleComplete()``
- [ ] **``src/pages/TodosPage.jsx`` 생성**
  - [ ] 할 일 목록 조회 및 표시
  - [ ] 필터링 (전체, 미완료, 완료)
  - [ ] 정렬 (최신순, 마감일순)
- [ ] **``src/components/TodoItem.jsx`` 생성**
  - [ ] 체크박스 (완료 토글)
  - [ ] 제목, 설명, 날짜 표시
  - [ ] 수정/삭제 버튼
- [ ] **``src/components/TodoForm.jsx`` 생성**
  - [ ] 모달 형태로 구현
  - [ ] 제목, 설명, 시작일, 마감일 입력
  - [ ] 입력 검증
- [ ] 할 일 생성/수정/삭제 기능 구현
- [ ] 완료 상태 토글 기능 구현
- [ ] 통합 테스트 작성

## 🔧 기술적 고려사항
- PRD UC-04~UC-09: 할 일 관리 기능 명세
- todoStore와 연동
- 필터링 및 정렬 기능
- 실시간 UI 업데이트
- 에러 핸들링 및 로딩 상태
- 사용자 경험 원칙 (PRD 8.5)

## 📦 의존성
**선행 작업**: #24 (FE-3), #25 (FE-4), #26 (FE-5)
**후행 작업**: 없음

## 📝 Todo
- [ ] todoApi.js 작성
- [ ] TodosPage 구현
- [ ] TodoItem 구현
- [ ] TodoForm 구현
- [ ] CRUD 기능 구현
- [ ] 통합 테스트 작성

## ⏱️ 예상 시간
10시간
"@

# FE-8
gh issue create --title "[FE-8] 캘린더 페이지 구현" --label "feature,frontend,complexity: high" --body @"
## 📋 개요
월간 캘린더로 할 일을 시각화하는 페이지를 구현합니다.

## ✅ 완료 조건
- [ ] ``src/services/calendarApi.js`` 생성
  - [ ] ``getCalendarData(startDate, endDate)``
- [ ] **``src/pages/CalendarPage.jsx`` 생성**
  - [ ] 월간 캘린더 UI 구현
  - [ ] 날짜별 할 일 및 국경일 표시
  - [ ] 날짜 클릭 시 상세 보기
- [ ] **``src/components/Calendar.jsx`` 생성**
  - [ ] date-fns 또는 dayjs로 달력 로직 구현
  - [ ] 현재 월 표시 및 이전/다음 달 이동
  - [ ] 오늘 날짜 하이라이트
  - [ ] 할 일이 있는 날짜 표시 (점 또는 숫자)
  - [ ] 국경일 표시 (색상 구분)
- [ ] **``src/components/CalendarDayDetail.jsx`` 생성**
  - [ ] 선택된 날짜의 할 일 목록
  - [ ] 할 일 추가/수정/삭제 기능
- [ ] 반응형 캘린더 UI
- [ ] 통합 테스트 작성

## 🔧 기술적 고려사항
- PRD UC-13~UC-15: 캘린더 기능 명세
- 개인 할 일 + 국경일 통합 표시 (BR-14)
- 만료 기한 없는 할 일 제외 (BR-15)
- 삭제된 할 일 제외 (BR-16)
- calendarStore와 연동
- date-fns 또는 dayjs 활용
- 시각적 피드백 (PRD 8.1)

## 📦 의존성
**선행 작업**: #24 (FE-3), #25 (FE-4), #26 (FE-5)
**후행 작업**: 없음

## 📝 Todo
- [ ] calendarApi.js 작성
- [ ] CalendarPage 구현
- [ ] Calendar 컴포넌트 구현
- [ ] CalendarDayDetail 구현
- [ ] 반응형 UI 적용
- [ ] 통합 테스트 작성

## ⏱️ 예상 시간
12시간
"@

# FE-9
gh issue create --title "[FE-9] 휴지통 및 프로필 페이지 구현" --label "feature,frontend,complexity: medium" --body @"
## 📋 개요
휴지통 및 사용자 프로필 페이지를 구현합니다.

## ✅ 완료 조건
- [ ] **휴지통 페이지**
  - [ ] ``src/services/trashApi.js`` 생성 (getTrash, restoreTodo, permanentlyDelete)
  - [ ] ``src/pages/TrashPage.jsx`` 생성 (삭제된 할 일 목록 조회)
  - [ ] ``src/components/TrashItem.jsx`` 생성 (복원/영구삭제 버튼)
  - [ ] 복원 기능 구현 (todoStore 업데이트, 토스트 알림)
  - [ ] 영구 삭제 기능 구현 (확인 모달)
- [ ] **프로필 페이지**
  - [ ] ``src/services/userApi.js`` 생성 (getUserProfile, getUserStats)
  - [ ] ``src/pages/ProfilePage.jsx`` 생성
  - [ ] 사용자 정보 표시 (username, email)
  - [ ] 통계 표시 (전체 할 일, 완료율 등)
  - [ ] 로그아웃 기능 구현
- [ ] 통합 테스트 작성

## 🔧 기술적 고려사항
- PRD UC-10~UC-12: 휴지통 기능 명세
- PRD 4.1.4: 사용자 프로필 기능
- trashStore와 연동
- 확인 모달로 실수 방지
- 사용자 통계 표시 (get_user_todo_stats 함수 활용)
- 로그아웃 기능 (authStore 업데이트)

## 📦 의존성
**선행 작업**: #24 (FE-3), #25 (FE-4), #26 (FE-5)
**후행 작업**: 없음

## 📝 Todo
- [ ] trashApi.js, userApi.js 작성
- [ ] TrashPage 구현
- [ ] TrashItem 구현
- [ ] ProfilePage 구현
- [ ] 복원/영구삭제 기능 구현
- [ ] 통합 테스트 작성

## ⏱️ 예상 시간
11시간
"@

# FE-10
gh issue create --title "[FE-10] 커스텀 훅 및 전역 스타일 구현" --label "feature,frontend,complexity: medium" --body @"
## 📋 개요
재사용 가능한 커스텀 훅을 구현하고 전역 스타일을 설정합니다.

## ✅ 완료 조건
- [ ] **커스텀 훅 구현**
  - [ ] ``src/hooks/useAuth.js`` (authStore 래핑)
  - [ ] ``src/hooks/useTodos.js`` (todoStore 래핑)
  - [ ] ``src/hooks/useCalendar.js`` (calendarStore 래핑)
  - [ ] ``src/hooks/useTrash.js`` (trashStore 래핑)
  - [ ] ``src/hooks/useToast.js`` (토스트 알림 래핑)
  - [ ] 커스텀 훅 단위 테스트 작성
- [ ] **전역 스타일 및 테마 설정**
  - [ ] ``tailwind.config.js`` 커스터마이징 (색상 팔레트, 폰트)
  - [ ] ``src/styles/index.css`` 업데이트 (전역 스타일, 폰트 임포트)
  - [ ] 다크 모드 지원 (선택사항)

## 🔧 기술적 고려사항
- 커스텀 훅으로 로직 재사용
- Tailwind CSS 테마 커스터마이징
- 전역 스타일 일관성
- 다크 모드 지원 (PRD 8.2 - 선택사항)
- 미니멀 디자인 (PRD 8.1)

## 📦 의존성
**선행 작업**: #24 (FE-3)
**후행 작업**: FE-7, FE-8, FE-9

## 📝 Todo
- [ ] 커스텀 훅 구현
- [ ] 커스텀 훅 단위 테스트 작성
- [ ] tailwind.config.js 커스터마이징
- [ ] 전역 스타일 설정
- [ ] (선택) 다크 모드 구현

## ⏱️ 예상 시간
7시간
"@

# FE-11
gh issue create --title "[FE-11] 에러 처리 및 성능 최적화" --label "feature,frontend,complexity: high" --body @"
## 📋 개요
에러 처리를 강화하고 성능을 최적화합니다.

## ✅ 완료 조건
- [ ] **에러 처리**
  - [ ] ``src/components/ErrorBoundary.jsx`` 생성
  - [ ] ``src/components/GlobalLoading.jsx`` 생성
  - [ ] Axios Interceptor에서 전역 로딩 상태 관리
  - [ ] 각 페이지에서 로컬 로딩 상태 구현
  - [ ] 404 페이지 구현 (``src/pages/NotFoundPage.jsx``)
  - [ ] 네트워크 에러 처리 (오프라인 감지)
- [ ] **성능 최적화**
  - [ ] React.memo 적용 (TodoItem, CalendarDay 등)
  - [ ] useMemo/useCallback 적용
  - [ ] 가상 스크롤링 구현 (긴 할 일 목록)
  - [ ] Code splitting 적용 (React.lazy, Suspense)
  - [ ] Lighthouse 성능 측정 (90점 이상 목표)
  - [ ] Bundle size 분석 및 최적화

## 🔧 기술적 고려사항
- Error Boundary로 앱 크래시 방지
- 로딩 상태 일관성
- 성능 최적화 (React.memo, useMemo, useCallback)
- Code splitting으로 초기 로딩 속도 개선
- Lighthouse 성능 목표: 90점 이상
- PRD 8.5: 사용자 경험 원칙 (빠름)

## 📦 의존성
**선행 작업**: #28 (FE-7), #29 (FE-8)
**후행 작업**: FE-12

## 📝 Todo
- [ ] ErrorBoundary 구현
- [ ] GlobalLoading 구현
- [ ] 404 페이지 구현
- [ ] React.memo 적용
- [ ] Code splitting 적용
- [ ] Lighthouse 성능 측정 및 최적화

## ⏱️ 예상 시간
9시간
"@

# FE-12
gh issue create --title "[FE-12] 접근성 개선 및 테스트 완성" --label "feature,frontend,complexity: high" --body @"
## 📋 개요
접근성을 개선하고 모든 프론트엔드 코드의 테스트를 완성합니다.

## ✅ 완료 조건
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
  - [ ] 테스트 커버리지 측정 (``npm run test:coverage``)

## 🔧 기술적 고려사항
- PRD 8.2: 접근성 요구사항
- ARIA 속성 및 키보드 네비게이션
- WCAG AA 색상 대비 기준
- 테스트 커버리지 목표: 80% 이상
- E2E 테스트 (Playwright 또는 Cypress)
- PRD 8.5: 사용자 경험 원칙

## 📦 의존성
**선행 작업**: #22~#32 (FE-1~FE-11)
**후행 작업**: FE-13

## 📝 Todo
- [ ] ARIA 속성 추가
- [ ] 키보드 네비게이션 구현
- [ ] 색상 대비 확인 및 조정
- [ ] 컴포넌트 단위 테스트 작성
- [ ] 커스텀 훅 단위 테스트 작성
- [ ] 스토어 단위 테스트 작성
- [ ] E2E 테스트 작성
- [ ] 커버리지 측정 및 개선

## ⏱️ 예상 시간
13시간
"@

# FE-13
gh issue create --title "[FE-13] Vercel 배포 및 문서화" --label "feature,infrastructure,frontend,documentation,complexity: medium" --body @"
## 📋 개요
프론트엔드를 Vercel에 배포하고 사용자 문서를 작성합니다.

## ✅ 완료 조건
- [ ] ``vercel.json`` 설정 파일 생성 (SPA 라우팅 설정)
- [ ] Vercel 프로젝트 생성 및 연결
- [ ] 환경 변수 설정 (Vercel Dashboard: ``VITE_API_BASE_URL``)
- [ ] Vercel 배포 성공 확인
- [ ] 배포된 앱 동작 테스트 (모든 기능 확인)
- [ ] Custom Domain 설정 (선택사항)
- [ ] **``frontend/README.md`` 작성**
  - [ ] 프로젝트 소개, 기술 스택
  - [ ] 설치 및 실행 방법
  - [ ] 환경 변수 설정 가이드
  - [ ] 빌드 및 배포 방법
  - [ ] 테스트 실행 방법
- [ ] 사용자 가이드 작성 (선택사항)

## 🔧 기술적 고려사항
- PRD 6.2: Vercel을 통한 프론트엔드 호스팅
- SPA 라우팅 설정 (vercel.json)
- 환경 변수 관리
- HTTPS 자동 제공 (PRD 7.1)
- 전체 기능 동작 확인
- PRD 9.1: MVP 출시

## 📦 의존성
**선행 작업**: #33 (FE-12)
**후행 작업**: 없음 (Frontend Phase 완료, 전체 프로젝트 완료)

## 📝 Todo
- [ ] vercel.json 작성
- [ ] Vercel 프로젝트 설정
- [ ] 환경 변수 설정
- [ ] 배포 및 동작 테스트
- [ ] frontend/README.md 작성
- [ ] (선택) 사용자 가이드 작성

## ⏱️ 예상 시간
4시간
"@

Write-Host "모든 GitHub 이슈가 생성되었습니다!" -ForegroundColor Green
