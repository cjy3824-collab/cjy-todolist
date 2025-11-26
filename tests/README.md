# 테스트 가이드

## 개요

이 프로젝트의 테스트 자동화 프레임워크는 데이터베이스 스키마, 제약 조건, 비즈니스 로직의 정확성을 보장합니다.

## 테스트 구조

```
tests/
├── README.md                    # 이 문서
├── setup.js                     # Jest 전역 설정 및 데이터베이스 초기화
└── database/
    └── documentation.test.js    # 데이터베이스 문서화 검증 테스트
```

## 환경 설정

### 1. 데이터베이스 준비

테스트 전용 PostgreSQL 데이터베이스를 생성하세요:

```sql
CREATE DATABASE todolist_test;
```

### 2. 환경 변수 설정

`.env.test` 파일을 프로젝트 루트에 생성하고 다음 내용으로 설정하세요:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist_test
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
```

**중요**: `.env.test` 파일은 `.gitignore`에 추가하여 버전 관리에서 제외하세요.

### 3. 의존성 설치

```bash
npm install
```

## 테스트 실행

### 전체 테스트 실행

```bash
npm test
```

### 데이터베이스 테스트만 실행

```bash
npm run test:db
```

### 워치 모드 (개발 중)

```bash
npm run test:watch
```

### 커버리지 리포트

```bash
npm run test:coverage
```

## 테스트 범위

### 1. 스키마 검증 (`tests/database/documentation.test.js`)

#### 테이블 구조 검증
- **Users 테이블**: 컬럼, 데이터 타입, NULL 제약조건 확인
- **Todos 테이블**: 컬럼, 데이터 타입, NULL 제약조건 확인
- **테이블 코멘트**: 문서화된 설명이 올바르게 설정되었는지 확인

#### 인덱스 검증
- **Users 테이블 인덱스**:
  - `idx_users_username`
  - `idx_users_email`
  - `idx_users_created_at`
  - `uk_users_username` (UNIQUE)
  - `uk_users_email` (UNIQUE)

- **Todos 테이블 인덱스**:
  - 단일 컬럼 인덱스 (8개)
  - 복합 인덱스 (4개):
    - `idx_todos_user_active`: 사용자별 활성 할 일
    - `idx_todos_calendar`: 캘린더 조회
    - `idx_todos_public_holidays`: 국경일 조회
    - `idx_todos_trash`: 휴지통 조회

#### 제약 조건 검증
- **UNIQUE 제약조건**: 중복 username, email 방지
- **CHECK 제약조건**:
  - `chk_users_username_length`: 사용자명 길이 (1-50자)
  - `chk_users_email_format`: 이메일 형식 검증
  - `chk_todos_title_length`: 제목 길이 (1-200자)
  - `chk_todos_description_length`: 설명 길이 (최대 2000자)
  - `chk_todos_dates`: startDate <= dueDate
  - `chk_todos_delete_consistency`: isDeleted와 deletedAt 일관성
  - `chk_todos_public_holiday`: 국경일은 userId가 NULL이어야 함
- **FOREIGN KEY 제약조건**: CASCADE 삭제 동작 확인

#### 트리거 검증
- **updatedAt 자동 업데이트**:
  - Users 테이블의 트리거 동작
  - Todos 테이블의 트리거 동작

#### 뷰 검증
- **v_active_todos**: 삭제되지 않은 할 일만 표시
- **v_public_holidays**: 국경일만 표시
- **v_trash**: 삭제된 할 일만 표시

#### 함수 검증
- **get_user_todo_stats**: 사용자별 할 일 통계 정확성
  - total_todos
  - completed_todos
  - pending_todos
  - deleted_todos
  - completion_rate

#### 쿼리 예제 검증
- 사용자 생성 (INSERT)
- 할 일 생성 (INSERT)
- 소프트 삭제 (UPDATE)
- 국경일 조회 (SELECT with WHERE userId IS NULL)
- 활성 할 일 조회
- 미완료 할 일 조회
- 기간별 할 일 조회

#### 초기 데이터 검증
- 2025년 한국 공휴일 15개가 정확히 삽입되었는지 확인

#### 성능 검증
- 대량 데이터 삽입 성능 (100개 < 5초)
- 복합 인덱스 활용 여부 (EXPLAIN 분석)

## 테스트 결과 해석

### 성공 케이스

```
PASS  tests/database/documentation.test.js
  데이터베이스 스키마 검증
    1. 테이블 구조 검증
      ✓ Users 테이블이 올바른 컬럼으로 생성되어야 함 (45ms)
      ✓ Todos 테이블이 올바른 컬럼으로 생성되어야 함 (38ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        15.234s
```

### 실패 케이스 분석

#### 1. 스키마 불일치
```
Expected columns to have property 'userid'
```
→ 테이블 정의에서 컬럼이 누락되었거나 이름이 잘못됨

#### 2. 제약 조건 미적용
```
Expected query to throw error with /check constraint/
```
→ schema.sql에 제약조건이 정의되지 않았거나 비활성화됨

#### 3. 인덱스 누락
```
Expected indexes to contain 'idx_todos_user_active'
```
→ schema.sql에서 인덱스 생성 구문이 누락됨

## 테스트 작성 가이드

### 새로운 테스트 추가

```javascript
test('새로운 기능이 정상 작동해야 함', async () => {
  const client = global.getGlobalClient();

  // Given: 테스트 데이터 준비
  const userResult = await client.query(`
    INSERT INTO users (username, email, password)
    VALUES ('testuser', 'test@example.com', 'password')
    RETURNING userid;
  `);
  const userId = userResult.rows[0].userid;

  // When: 테스트 실행
  const result = await client.query(`
    SELECT * FROM some_function($1);
  `, [userId]);

  // Then: 결과 검증
  expect(result.rows.length).toBeGreaterThan(0);
});
```

### 베스트 프랙티스

1. **독립성**: 각 테스트는 다른 테스트에 의존하지 않아야 함
2. **멱등성**: 같은 테스트를 여러 번 실행해도 같은 결과
3. **명확성**: 테스트 이름만 보고도 무엇을 검증하는지 알 수 있어야 함
4. **속도**: 각 테스트는 가능한 빠르게 완료되어야 함 (< 1초)
5. **정리**: `afterEach`에서 테스트 데이터 자동 정리

## 커버리지 목표

- **라인 커버리지**: 80% 이상
- **제약조건 커버리지**: 100% (모든 제약조건 테스트)
- **인덱스 커버리지**: 100% (모든 인덱스 검증)
- **함수 커버리지**: 100% (모든 함수 테스트)

## 트러블슈팅

### 데이터베이스 연결 실패

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**해결 방법**:
1. PostgreSQL이 실행 중인지 확인
2. `.env.test` 파일의 연결 정보가 올바른지 확인
3. 테스트용 데이터베이스가 생성되었는지 확인

### 스키마 초기화 실패

```
Error: permission denied for schema public
```

**해결 방법**:
```sql
GRANT ALL ON SCHEMA public TO your_user;
```

### 타임아웃 에러

```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**해결 방법**:
- `jest.config.js`의 `testTimeout` 증가
- 또는 개별 테스트에 `jest.setTimeout(30000)` 추가

### 인덱스 이름 대소문자 문제

PostgreSQL은 기본적으로 모든 식별자를 소문자로 변환합니다.
테스트에서는 `indexname`을 소문자로 비교하세요.

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: Database Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: todolist_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:db
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: todolist_test
          DB_USER: postgres
          DB_PASSWORD: postgres
```

## 참고 자료

- [Jest Documentation](https://jestjs.io/)
- [node-postgres (pg)](https://node-postgres.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [database/schema.sql](../database/schema.sql)

## 문의

테스트 관련 문제나 개선 사항은 GitHub Issues에 등록해주세요.
