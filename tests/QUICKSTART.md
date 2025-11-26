# 데이터베이스 테스트 빠른 시작 가이드

## 1. 테스트 환경 설정 (5분)

### 단계 1: 테스트용 데이터베이스 생성

```sql
-- PostgreSQL에 접속하여 실행
CREATE DATABASE todolist_test;
```

### 단계 2: 환경 변수 파일 생성

`.env.test` 파일을 프로젝트 루트에 생성:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist_test
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false
```

**주의**: `your_password_here`를 실제 PostgreSQL 비밀번호로 변경하세요.

## 2. 테스트 실행

### 전체 테스트 실행
```bash
npm test
```

### 데이터베이스 테스트만 실행
```bash
npm run test:db
```

### 커버리지 포함 실행
```bash
npm run test:coverage
```

## 3. 예상 결과

성공 시 다음과 같은 결과가 표시됩니다:

```
PASS  tests/database/documentation.test.js
  데이터베이스 스키마 검증
    1. 테이블 구조 검증
      ✓ Users 테이블이 올바른 컬럼으로 생성되어야 함 (45ms)
      ✓ Todos 테이블이 올바른 컬럼으로 생성되어야 함 (38ms)
      ✓ 스키마에 코멘트가 올바르게 설정되어야 함 (25ms)
    2. 인덱스 검증
      ✓ Users 테이블에 필요한 모든 인덱스가 생성되어야 함 (32ms)
      ✓ Todos 테이블에 필요한 모든 인덱스가 생성되어야 함 (40ms)
      ✓ 부분 인덱스(Partial Index)가 올바르게 생성되어야 함 (28ms)
    3. 제약 조건 검증
      ✓ Users 테이블의 UNIQUE 제약조건이 작동해야 함 (50ms)
      ✓ Users 테이블의 CHECK 제약조건이 작동해야 함 (45ms)
      ✓ Todos 테이블의 날짜 CHECK 제약조건이 작동해야 함 (42ms)
      ... (총 42개 테스트)

Test Suites: 1 passed, 1 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        15.234s
```

## 4. 문제 해결

### "데이터베이스 연결 실패" 에러

**원인**: PostgreSQL이 실행되지 않거나 연결 정보가 잘못됨

**해결**:
1. PostgreSQL 서비스 확인: `pg_isready`
2. `.env.test` 파일의 연결 정보 확인
3. 데이터베이스 존재 여부 확인: `psql -l`

### "permission denied" 에러

**원인**: 데이터베이스 권한 부족

**해결**:
```sql
GRANT ALL ON SCHEMA public TO your_user;
```

### "timeout" 에러

**원인**: 테스트 실행 시간 초과

**해결**:
`jest.config.js`의 `testTimeout` 값을 증가시키세요 (기본값: 30000ms)

## 5. 다음 단계

테스트가 성공적으로 완료되었다면:

1. `tests/README.md` - 전체 테스트 가이드 확인
2. `database/README.md` - 데이터베이스 운영 가이드 확인
3. 새로운 테스트 케이스 추가 고려

## 6. 지원

문제가 계속되면 GitHub Issues에 등록하거나 프로젝트 문서를 참조하세요.
