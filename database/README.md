# cjy-todoList 데이터베이스 가이드

---

## 문서 정보

| 항목       | 내용                              |
| ---------- | --------------------------------- |
| **문서명** | cjy-todoList 데이터베이스 운영 가이드 |
| **버전**   | 1.0                               |
| **작성일** | 2025-11-26                        |
| **대상**   | 신규 개발자, 운영자                |
| **상태**   | 완성                              |

---

## 목차

1. [개요](#1-개요)
2. [데이터베이스 설치 가이드](#2-데이터베이스-설치-가이드)
3. [스키마 마이그레이션 절차](#3-스키마-마이그레이션-절차)
4. [주요 쿼리 예제](#4-주요-쿼리-예제)
5. [인덱스 설계 근거](#5-인덱스-설계-근거)
6. [제약 조건 및 비즈니스 규칙](#6-제약-조건-및-비즈니스-규칙)
7. [백업 및 복원 절차](#7-백업-및-복원-절차)
8. [성능 튜닝 가이드](#8-성능-튜닝-가이드)
9. [트러블슈팅 가이드](#9-트러블슈팅-가이드)

---

## 1. 개요

### 1.1 데이터베이스 구조

cjy-todoList는 **PostgreSQL 14+** 를 사용하며, 다음과 같은 구조로 되어 있습니다:

```
cjy-todoList Database
├── users          (사용자 계정 정보)
└── todos          (할 일 및 국경일 정보)
    └── 뷰(Views)
        ├── v_active_todos      (활성 할 일 뷰)
        ├── v_public_holidays   (국경일 뷰)
        └── v_trash             (휴지통 뷰)
```

### 1.2 주요 특징

- **UUID 기반 Primary Key**: 보안과 확장성 고려
- **소프트 삭제 (Soft Delete)**: 휴지통 기능 지원
- **국경일 통합 관리**: 별도 테이블 없이 Todos 테이블에서 관리
- **자동 타임스탬프**: 생성/수정 시각 자동 기록

### 1.3 기술 스택

- **데이터베이스**: PostgreSQL 14+
- **개발 환경**: 로컬 PostgreSQL
- **프로덕션 환경**: Supabase PostgreSQL
- **확장 모듈**: uuid-ossp (UUID 생성)

---

## 2. 데이터베이스 설치 가이드

### 2.1 Supabase 프로젝트 생성 (프로덕션 환경)

#### 단계 1: Supabase 회원가입 및 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. **"Start your project"** 클릭
3. GitHub/Google 계정으로 로그인
4. **"New Project"** 클릭
5. 다음 정보 입력:
   - **Project name**: `cjy-todolist` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 입력 (반드시 저장!)
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Pricing Plan**: `Free` 선택
6. **"Create new project"** 클릭
7. 프로젝트 생성 완료 (약 2분 소요)

#### 단계 2: 데이터베이스 연결 정보 확인

1. 좌측 메뉴에서 **"Settings"** → **"Database"** 클릭
2. **Connection string** 섹션에서 다음 정보 복사:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: 생성 시 입력한 비밀번호

#### 단계 3: Connection Pooling 설정 (권장)

1. **Settings** → **Database** → **Connection Pooling** 섹션
2. **"Session mode"** 선택 (기본값)
3. Connection string 복사:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres
   ```

### 2.2 로컬 개발 환경 설정

#### 단계 1: PostgreSQL 설치 (Windows)

1. [PostgreSQL 공식 사이트](https://www.postgresql.org/download/windows/) 접속
2. **"Download the installer"** 클릭
3. PostgreSQL 14 이상 버전 다운로드
4. 설치 실행:
   - **Components**: PostgreSQL Server, pgAdmin 4, Command Line Tools 선택
   - **Port**: `5432` (기본값)
   - **Password**: 로컬 개발용 비밀번호 입력
5. 설치 완료 후 pgAdmin 4 실행하여 연결 확인

#### 단계 2: 데이터베이스 생성

**방법 A: pgAdmin 4 사용**

1. pgAdmin 4 실행
2. 좌측 트리에서 **"Databases"** 우클릭
3. **"Create"** → **"Database"** 클릭
4. **Database name**: `cjy_todolist` 입력
5. **Owner**: `postgres` 선택
6. **"Save"** 클릭

**방법 B: 명령줄 사용**

```bash
# psql 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE cjy_todolist;

# 데이터베이스 목록 확인
\l

# 종료
\q
```

### 2.3 환경 변수 설정

#### 단계 1: .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성합니다:

```bash
# 루트 디렉토리에서 실행
touch .env
```

#### 단계 2: 환경 변수 작성

**개발 환경 (.env)**

```env
# 데이터베이스 연결 정보 (로컬)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cjy_todolist
DATABASE_USER=postgres
DATABASE_PASSWORD=your_local_password
DATABASE_URL=postgresql://postgres:your_local_password@localhost:5432/cjy_todolist

# 또는 Supabase 사용 시
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# 애플리케이션 설정
NODE_ENV=development
PORT=3000
```

**프로덕션 환경 (.env.production)**

```env
# Supabase 연결 정보
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres

# JWT 설정 (프로덕션용 강력한 키 사용)
JWT_SECRET=your_very_strong_production_secret_key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# 애플리케이션 설정
NODE_ENV=production
PORT=3000
```

#### 단계 3: .gitignore 확인

`.env` 파일이 Git에 커밋되지 않도록 `.gitignore`에 추가되어 있는지 확인:

```gitignore
# .gitignore
.env
.env.local
.env.production
.env.development
```

### 2.4 연결 테스트

#### 방법 A: psql 명령줄 도구

```bash
# 로컬 PostgreSQL 연결 테스트
psql -h localhost -p 5432 -U postgres -d cjy_todolist

# Supabase 연결 테스트
psql postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres
```

성공 시 다음과 같이 표시됩니다:
```
psql (14.x)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

cjy_todolist=#
```

#### 방법 B: Node.js 테스트 스크립트

`test-db-connection.js` 파일 생성:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ 데이터베이스 연결 성공!');

    const result = await client.query('SELECT NOW()');
    console.log('현재 시간:', result.rows[0].now);

    client.release();
    await pool.end();

    console.log('✅ 연결 테스트 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    process.exit(1);
  }
}

testConnection();
```

실행:
```bash
node test-db-connection.js
```

---

## 3. 스키마 마이그레이션 절차

### 3.1 초기 스키마 생성

#### 단계 1: schema.sql 파일 확인

`database/schema.sql` 파일이 프로젝트에 포함되어 있습니다. 이 파일에는 다음이 포함됩니다:

- Users 테이블 정의
- Todos 테이블 정의
- 인덱스 생성
- 뷰(View) 생성
- 트리거 함수
- 초기 국경일 데이터

#### 단계 2: 스키마 실행

**방법 A: psql 명령줄 사용 (권장)**

```bash
# 로컬 환경
psql -h localhost -p 5432 -U postgres -d cjy_todolist -f database/schema.sql

# Supabase 환경
psql postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres -f database/schema.sql
```

**방법 B: Supabase SQL Editor 사용**

1. Supabase 대시보드 접속
2. 좌측 메뉴에서 **"SQL Editor"** 클릭
3. **"New query"** 클릭
4. `database/schema.sql` 파일 내용을 복사하여 붙여넣기
5. **"Run"** 클릭
6. 성공 메시지 확인

**방법 C: Node.js 스크립트 사용**

`scripts/migrate.js` 파일 생성:

```javascript
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('🚀 스키마 마이그레이션 시작...');

    const schema = fs.readFileSync('./database/schema.sql', 'utf8');
    await client.query(schema);

    console.log('✅ 스키마 마이그레이션 완료!');
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
```

실행:
```bash
node scripts/migrate.js
```

#### 단계 3: 스키마 검증

테이블이 제대로 생성되었는지 확인:

```sql
-- 테이블 목록 확인
\dt

-- 테이블 구조 확인
\d users
\d todos

-- 인덱스 목록 확인
\di

-- 뷰 목록 확인
\dv
```

예상 결과:
```
List of relations
 Schema |       Name        | Type  |  Owner
--------+-------------------+-------+----------
 public | todos             | table | postgres
 public | users             | table | postgres
 public | v_active_todos    | view  | postgres
 public | v_public_holidays | view  | postgres
 public | v_trash           | view  | postgres
```

### 3.2 마이그레이션 파일 관리

#### 마이그레이션 파일 네이밍 규칙

향후 스키마 변경을 위한 마이그레이션 파일은 다음 규칙으로 생성:

```
database/migrations/
├── 001_initial_schema.sql       (이미 schema.sql로 존재)
├── 002_add_priority_column.sql
├── 003_add_category_table.sql
└── 004_add_tags_table.sql
```

파일명 형식: `{버전번호}_{설명}.sql`

#### 마이그레이션 적용 순서

1. 파일명의 버전 번호 순서대로 실행
2. 각 마이그레이션 실행 후 결과 확인
3. 실행 이력 기록 (예: migrations_log 테이블)

#### 마이그레이션 이력 추적 (선택사항)

마이그레이션 이력을 추적하기 위한 테이블 생성:

```sql
CREATE TABLE IF NOT EXISTS migrations_log (
    id SERIAL PRIMARY KEY,
    version VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW()
);

-- 초기 스키마 기록
INSERT INTO migrations_log (version, description)
VALUES ('001', 'Initial schema creation');
```

### 3.3 롤백 전략

#### 마이그레이션 롤백 파일 작성

각 마이그레이션에 대응하는 롤백 파일 작성:

```
database/migrations/
├── 002_add_priority_column.sql
└── 002_add_priority_column_rollback.sql
```

**예시: 002_add_priority_column.sql**
```sql
-- 마이그레이션: priority 컬럼 추가
ALTER TABLE todos ADD COLUMN priority INTEGER DEFAULT 0;
```

**예시: 002_add_priority_column_rollback.sql**
```sql
-- 롤백: priority 컬럼 삭제
ALTER TABLE todos DROP COLUMN IF EXISTS priority;
```

#### 롤백 실행

```bash
# 특정 마이그레이션 롤백
psql -h localhost -U postgres -d cjy_todolist -f database/migrations/002_add_priority_column_rollback.sql
```

### 3.4 데이터 손실 방지

#### 마이그레이션 전 체크리스트

- [ ] 백업 완료 확인
- [ ] 마이그레이션 스크립트 리뷰
- [ ] 롤백 스크립트 준비
- [ ] 테스트 환경에서 검증
- [ ] 실행 시간대 확인 (트래픽이 적은 시간)

#### 안전한 마이그레이션 순서

1. **백업 생성**
   ```bash
   pg_dump -h localhost -U postgres -d cjy_todolist > backup_before_migration.sql
   ```

2. **테스트 환경에서 마이그레이션 실행**
   ```bash
   psql -h localhost -U postgres -d cjy_todolist_test -f migration_file.sql
   ```

3. **결과 검증**
   - 데이터 무결성 확인
   - 쿼리 성능 테스트
   - 애플리케이션 동작 확인

4. **프로덕션 환경 적용**
   ```bash
   psql $DATABASE_URL -f migration_file.sql
   ```

5. **적용 후 모니터링**
   - 에러 로그 확인
   - 쿼리 성능 모니터링
   - 사용자 피드백 수집

---

## 4. 주요 쿼리 예제

### 4.1 사용자 인증 쿼리

#### 회원가입

```sql
-- 신규 사용자 생성
INSERT INTO users (username, email, password)
VALUES ($1, $2, $3)
RETURNING userId, username, email, createdAt;

-- 예시
INSERT INTO users (username, email, password)
VALUES ('testuser', 'test@example.com', '$2b$10$abcdefg...')
RETURNING userId, username, email, createdAt;
```

#### 로그인 (사용자 조회)

```sql
-- username으로 사용자 조회
SELECT userId, username, password, email, createdAt
FROM users
WHERE username = $1;

-- email로 사용자 조회
SELECT userId, username, password, email, createdAt
FROM users
WHERE email = $1;
```

#### 사용자명 중복 확인

```sql
-- username 중복 체크
SELECT EXISTS(SELECT 1 FROM users WHERE username = $1) AS exists;

-- email 중복 체크
SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists;
```

### 4.2 할 일 CRUD 쿼리

#### 할 일 생성 (CREATE)

```sql
-- 신규 할 일 추가
INSERT INTO todos (userId, title, description, startDate, dueDate)
VALUES ($1, $2, $3, $4, $5)
RETURNING todoId, title, description, startDate, dueDate, isCompleted, createdAt;

-- 예시: 간단한 할 일
INSERT INTO todos (userId, title, dueDate)
VALUES ('550e8400-e29b-41d4-a716-446655440000', '회의 자료 준비', '2025-12-01')
RETURNING *;

-- 예시: 상세한 할 일
INSERT INTO todos (userId, title, description, startDate, dueDate)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '프로젝트 기획서 작성',
    '2025년 1분기 프로젝트 기획서 초안 작성 및 검토',
    '2025-11-27',
    '2025-11-30'
)
RETURNING *;
```

#### 할 일 목록 조회 (READ)

```sql
-- 사용자의 활성 할 일 조회 (삭제되지 않은 할 일)
SELECT todoId, title, description, startDate, dueDate, isCompleted, isPublicHoliday, createdAt, updatedAt
FROM todos
WHERE userId = $1
  AND isDeleted = FALSE
ORDER BY dueDate ASC NULLS LAST, createdAt DESC;

-- 사용자의 할 일 + 국경일 함께 조회
SELECT todoId, userId, title, description, startDate, dueDate, isCompleted, isPublicHoliday, createdAt
FROM todos
WHERE (userId = $1 OR userId IS NULL)
  AND isDeleted = FALSE
ORDER BY dueDate ASC NULLS LAST, isPublicHoliday DESC;

-- 완료되지 않은 할 일만 조회
SELECT todoId, title, dueDate, isCompleted
FROM todos
WHERE userId = $1
  AND isDeleted = FALSE
  AND isCompleted = FALSE
ORDER BY dueDate ASC NULLS LAST;

-- 특정 기간의 할 일 조회
SELECT todoId, title, dueDate
FROM todos
WHERE userId = $1
  AND isDeleted = FALSE
  AND dueDate BETWEEN $2 AND $3
ORDER BY dueDate ASC;
```

#### 할 일 상세 조회

```sql
-- 특정 할 일 상세 정보
SELECT todoId, userId, title, description, startDate, dueDate,
       isCompleted, isPublicHoliday, isDeleted, deletedAt,
       createdAt, updatedAt
FROM todos
WHERE todoId = $1;

-- 권한 확인을 포함한 조회
SELECT *
FROM todos
WHERE todoId = $1
  AND (userId = $2 OR userId IS NULL);
```

#### 할 일 수정 (UPDATE)

```sql
-- 할 일 내용 수정
UPDATE todos
SET title = $2,
    description = $3,
    startDate = $4,
    dueDate = $5,
    updatedAt = NOW()
WHERE todoId = $1 AND userId = $6
  AND isDeleted = FALSE
  AND isCompleted = FALSE
RETURNING *;

-- 부분 수정 (예: 제목만 수정)
UPDATE todos
SET title = $2, updatedAt = NOW()
WHERE todoId = $1 AND userId = $3
  AND isDeleted = FALSE
RETURNING *;
```

#### 완료 상태 토글

```sql
-- 완료 상태 변경
UPDATE todos
SET isCompleted = $2, updatedAt = NOW()
WHERE todoId = $1 AND userId = $3
  AND isDeleted = FALSE
RETURNING todoId, isCompleted, updatedAt;

-- 완료 상태 토글 (반전)
UPDATE todos
SET isCompleted = NOT isCompleted, updatedAt = NOW()
WHERE todoId = $1 AND userId = $2
  AND isDeleted = FALSE
RETURNING todoId, isCompleted;
```

#### 할 일 삭제 (DELETE - 소프트 삭제)

```sql
-- 휴지통으로 이동 (소프트 삭제)
UPDATE todos
SET isDeleted = TRUE,
    deletedAt = NOW(),
    updatedAt = NOW()
WHERE todoId = $1 AND userId = $2
  AND isDeleted = FALSE
  AND isCompleted = FALSE
RETURNING todoId, title, deletedAt;
```

### 4.3 소프트 삭제 및 복구 쿼리

#### 휴지통 조회

```sql
-- 사용자의 휴지통 항목 조회
SELECT todoId, title, description, dueDate, deletedAt, createdAt
FROM todos
WHERE userId = $1
  AND isDeleted = TRUE
ORDER BY deletedAt DESC;

-- 또는 뷰 사용
SELECT * FROM v_trash
WHERE userId = $1
ORDER BY deletedAt DESC;
```

#### 할 일 복구

```sql
-- 휴지통에서 복구
UPDATE todos
SET isDeleted = FALSE,
    deletedAt = NULL,
    updatedAt = NOW()
WHERE todoId = $1 AND userId = $2
  AND isDeleted = TRUE
RETURNING todoId, title, isDeleted, updatedAt;
```

#### 영구 삭제

```sql
-- 데이터베이스에서 완전히 삭제
DELETE FROM todos
WHERE todoId = $1 AND userId = $2
  AND isDeleted = TRUE;

-- 삭제 확인
SELECT EXISTS(SELECT 1 FROM todos WHERE todoId = $1) AS exists;
```

#### 휴지통 비우기

```sql
-- 사용자의 모든 휴지통 항목 영구 삭제
DELETE FROM todos
WHERE userId = $1 AND isDeleted = TRUE;

-- 30일 이상 지난 휴지통 항목 자동 삭제 (선택사항)
DELETE FROM todos
WHERE isDeleted = TRUE
  AND deletedAt < NOW() - INTERVAL '30 days';
```

### 4.4 국경일 조회 쿼리

#### 전체 국경일 조회

```sql
-- 모든 국경일 조회
SELECT todoId, title, description, dueDate, createdAt
FROM todos
WHERE userId IS NULL
  AND isPublicHoliday = TRUE
  AND isDeleted = FALSE
ORDER BY dueDate ASC;

-- 또는 뷰 사용
SELECT * FROM v_public_holidays
ORDER BY dueDate ASC;
```

#### 특정 연도의 국경일

```sql
-- 2025년 국경일 조회
SELECT todoId, title, dueDate
FROM todos
WHERE userId IS NULL
  AND isPublicHoliday = TRUE
  AND isDeleted = FALSE
  AND EXTRACT(YEAR FROM dueDate) = 2025
ORDER BY dueDate ASC;
```

#### 특정 월의 국경일

```sql
-- 2025년 1월 국경일 조회
SELECT todoId, title, dueDate
FROM todos
WHERE userId IS NULL
  AND isPublicHoliday = TRUE
  AND isDeleted = FALSE
  AND EXTRACT(YEAR FROM dueDate) = $1
  AND EXTRACT(MONTH FROM dueDate) = $2
ORDER BY dueDate ASC;
```

#### 다가오는 국경일 조회

```sql
-- 오늘 이후의 국경일 조회
SELECT todoId, title, dueDate
FROM todos
WHERE userId IS NULL
  AND isPublicHoliday = TRUE
  AND isDeleted = FALSE
  AND dueDate >= CURRENT_DATE
ORDER BY dueDate ASC
LIMIT 10;
```

### 4.5 캘린더 조회 쿼리

#### 월별 캘린더 데이터

```sql
-- 특정 월의 모든 할 일 (개인 할 일 + 국경일)
SELECT
    todoId,
    userId,
    title,
    description,
    dueDate,
    isCompleted,
    isPublicHoliday
FROM todos
WHERE isDeleted = FALSE
  AND (userId = $1 OR userId IS NULL)
  AND dueDate IS NOT NULL
  AND EXTRACT(YEAR FROM dueDate) = $2
  AND EXTRACT(MONTH FROM dueDate) = $3
ORDER BY dueDate ASC, isPublicHoliday DESC;
```

#### 특정 날짜의 할 일

```sql
-- 특정 날짜의 할 일 조회
SELECT todoId, title, description, isCompleted, isPublicHoliday
FROM todos
WHERE isDeleted = FALSE
  AND (userId = $1 OR userId IS NULL)
  AND dueDate = $2
ORDER BY isPublicHoliday DESC, createdAt ASC;
```

#### 주간 캘린더 데이터

```sql
-- 특정 주(월요일~일요일)의 할 일
SELECT
    todoId,
    title,
    dueDate,
    isCompleted,
    isPublicHoliday
FROM todos
WHERE isDeleted = FALSE
  AND (userId = $1 OR userId IS NULL)
  AND dueDate BETWEEN $2 AND $3
ORDER BY dueDate ASC, isPublicHoliday DESC;
```

#### 날짜별 할 일 개수

```sql
-- 월별 날짜별 할 일 개수 (캘린더 뱃지용)
SELECT
    dueDate,
    COUNT(*) as todo_count,
    COUNT(*) FILTER (WHERE isCompleted = TRUE) as completed_count,
    COUNT(*) FILTER (WHERE isPublicHoliday = TRUE) as holiday_count
FROM todos
WHERE isDeleted = FALSE
  AND (userId = $1 OR userId IS NULL)
  AND dueDate IS NOT NULL
  AND EXTRACT(YEAR FROM dueDate) = $2
  AND EXTRACT(MONTH FROM dueDate) = $3
GROUP BY dueDate
ORDER BY dueDate ASC;
```

### 4.6 통계 및 분석 쿼리

#### 사용자 할 일 통계

```sql
-- 함수 사용
SELECT * FROM get_user_todo_stats($1);

-- 또는 직접 쿼리
SELECT
    COUNT(*) FILTER (WHERE isDeleted = FALSE) as total_todos,
    COUNT(*) FILTER (WHERE isDeleted = FALSE AND isCompleted = TRUE) as completed_todos,
    COUNT(*) FILTER (WHERE isDeleted = FALSE AND isCompleted = FALSE) as pending_todos,
    COUNT(*) FILTER (WHERE isDeleted = TRUE) as deleted_todos,
    ROUND(
        (COUNT(*) FILTER (WHERE isDeleted = FALSE AND isCompleted = TRUE)::NUMERIC /
         NULLIF(COUNT(*) FILTER (WHERE isDeleted = FALSE), 0) * 100),
        2
    ) as completion_rate
FROM todos
WHERE userId = $1;
```

#### 만료 임박 할 일

```sql
-- 오늘 만료되는 할 일
SELECT todoId, title, dueDate
FROM todos
WHERE userId = $1
  AND isDeleted = FALSE
  AND isCompleted = FALSE
  AND dueDate = CURRENT_DATE;

-- 3일 이내 만료되는 할 일
SELECT todoId, title, dueDate
FROM todos
WHERE userId = $1
  AND isDeleted = FALSE
  AND isCompleted = FALSE
  AND dueDate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
ORDER BY dueDate ASC;
```

#### 기간별 완료 통계

```sql
-- 이번 주 완료한 할 일 수
SELECT COUNT(*) as completed_this_week
FROM todos
WHERE userId = $1
  AND isCompleted = TRUE
  AND updatedAt >= DATE_TRUNC('week', CURRENT_DATE);

-- 이번 달 완료한 할 일 수
SELECT COUNT(*) as completed_this_month
FROM todos
WHERE userId = $1
  AND isCompleted = TRUE
  AND updatedAt >= DATE_TRUNC('month', CURRENT_DATE);
```

---

## 5. 인덱스 설계 근거

### 5.1 인덱스 목록

#### Users 테이블 인덱스

| 인덱스명              | 컬럼      | 타입   | 목적                    |
| --------------------- | --------- | ------ | ----------------------- |
| users_pkey            | userId    | PK     | Primary Key             |
| uk_users_username     | username  | UNIQUE | 중복 방지 및 로그인 조회 |
| uk_users_email        | email     | UNIQUE | 중복 방지 및 이메일 조회 |
| idx_users_username    | username  | BTREE  | 로그인 쿼리 최적화       |
| idx_users_email       | email     | BTREE  | 이메일 조회 최적화       |
| idx_users_created_at  | createdAt | BTREE  | 가입일 기준 정렬         |

#### Todos 테이블 인덱스

| 인덱스명                  | 컬럼                         | 타입   | 목적                        |
| ------------------------- | ---------------------------- | ------ | --------------------------- |
| todos_pkey                | todoId                       | PK     | Primary Key                 |
| idx_todos_user_id         | userId                       | BTREE  | 사용자별 할 일 조회         |
| idx_todos_is_deleted      | isDeleted                    | BTREE  | 소프트 삭제 필터링          |
| idx_todos_is_completed    | isCompleted                  | BTREE  | 완료 여부 필터링            |
| idx_todos_is_public_holiday | isPublicHoliday            | BTREE  | 국경일 조회                 |
| idx_todos_due_date        | dueDate                      | BTREE  | 날짜 기반 조회 및 정렬      |
| idx_todos_start_date      | startDate                    | BTREE  | 시작일 조회                 |
| idx_todos_created_at      | createdAt                    | BTREE  | 생성일 기준 정렬            |
| idx_todos_updated_at      | updatedAt                    | BTREE  | 수정일 기준 정렬            |

#### Todos 테이블 복합 인덱스

| 인덱스명                  | 컬럼                                | 타입    | 목적                        |
| ------------------------- | ----------------------------------- | ------- | --------------------------- |
| idx_todos_user_active     | userId, isDeleted, isCompleted      | PARTIAL | 사용자별 활성 할 일 조회    |
| idx_todos_calendar        | dueDate, isDeleted, userId          | PARTIAL | 캘린더 조회 최적화          |
| idx_todos_public_holidays | dueDate, isPublicHoliday            | PARTIAL | 국경일 조회 최적화          |
| idx_todos_trash           | userId, isDeleted, deletedAt        | PARTIAL | 휴지통 조회 최적화          |

### 5.2 인덱스 생성 이유

#### 1. 단일 컬럼 인덱스

**idx_users_username, idx_users_email**
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**이유:**
- 사용자 로그인 시 username 또는 email로 조회 (빈번한 쿼리)
- UNIQUE 제약 조건만으로는 쿼리 성능 최적화 부족
- 로그인 요청은 매우 빈번하므로 빠른 조회 필수

**예상 쿼리:**
```sql
SELECT * FROM users WHERE username = 'testuser';
```

**idx_todos_user_id**
```sql
CREATE INDEX idx_todos_user_id ON todos(userId);
```

**이유:**
- 가장 빈번한 쿼리: "특정 사용자의 할 일 조회"
- Foreign Key 인덱스로 JOIN 성능 향상
- 사용자별 할 일 목록 조회 시 필수

**예상 쿼리:**
```sql
SELECT * FROM todos WHERE userId = '...';
```

**idx_todos_due_date**
```sql
CREATE INDEX idx_todos_due_date ON todos(dueDate);
```

**이유:**
- 캘린더 뷰에서 날짜 범위 조회 빈번
- 만료일 기준 정렬 시 사용
- 날짜 필터링 쿼리 성능 향상

**예상 쿼리:**
```sql
SELECT * FROM todos WHERE dueDate BETWEEN '2025-11-01' AND '2025-11-30';
```

#### 2. 복합 인덱스 (Composite Index)

**idx_todos_user_active**
```sql
CREATE INDEX idx_todos_user_active ON todos(userId, isDeleted, isCompleted)
WHERE isDeleted = FALSE;
```

**이유:**
- 가장 빈번한 쿼리 패턴: "사용자의 활성(삭제되지 않은) 할 일 조회"
- 세 컬럼을 함께 사용하는 쿼리 최적화
- Partial Index로 isDeleted=FALSE인 행만 인덱싱하여 인덱스 크기 감소

**예상 쿼리:**
```sql
SELECT * FROM todos
WHERE userId = '...' AND isDeleted = FALSE AND isCompleted = FALSE;
```

**idx_todos_calendar**
```sql
CREATE INDEX idx_todos_calendar ON todos(dueDate, isDeleted, userId)
WHERE isDeleted = FALSE AND dueDate IS NOT NULL;
```

**이유:**
- 캘린더 뷰의 핵심 쿼리 최적화
- 날짜별로 정렬된 활성 할 일 조회
- dueDate가 NULL인 항목 제외로 인덱스 크기 최소화

**예상 쿼리:**
```sql
SELECT * FROM todos
WHERE dueDate BETWEEN '2025-11-01' AND '2025-11-30'
  AND isDeleted = FALSE
  AND (userId = '...' OR userId IS NULL)
ORDER BY dueDate;
```

**idx_todos_public_holidays**
```sql
CREATE INDEX idx_todos_public_holidays ON todos(dueDate, isPublicHoliday)
WHERE userId IS NULL AND isPublicHoliday = TRUE AND isDeleted = FALSE;
```

**이유:**
- 국경일 조회 전용 최적화
- 매우 적은 행(연간 15개 정도)만 인덱싱
- 국경일 조회는 빈번하지만 데이터는 소량

**예상 쿼리:**
```sql
SELECT * FROM todos
WHERE userId IS NULL AND isPublicHoliday = TRUE AND isDeleted = FALSE
ORDER BY dueDate;
```

**idx_todos_trash**
```sql
CREATE INDEX idx_todos_trash ON todos(userId, isDeleted, deletedAt)
WHERE isDeleted = TRUE;
```

**이유:**
- 휴지통 조회 최적화
- 삭제된 할 일만 인덱싱 (Partial Index)
- deletedAt 기준 최신순 정렬 지원

**예상 쿼리:**
```sql
SELECT * FROM todos
WHERE userId = '...' AND isDeleted = TRUE
ORDER BY deletedAt DESC;
```

### 5.3 성능 최적화 전략

#### Partial Index (부분 인덱스) 사용

**개념:**
조건을 만족하는 행만 인덱싱하여 인덱스 크기를 줄이고 성능 향상

**장점:**
- 인덱스 크기 감소 (스토리지 절약)
- 인덱스 유지 비용 감소
- 쿼리 성능 향상 (작은 인덱스 = 빠른 검색)

**예시:**
```sql
-- 전체 인덱스 (비효율적)
CREATE INDEX idx_all_todos ON todos(userId, isDeleted);
-- → 모든 행을 인덱싱 (삭제된 행 포함)

-- 부분 인덱스 (효율적)
CREATE INDEX idx_active_todos ON todos(userId)
WHERE isDeleted = FALSE;
-- → 활성 행만 인덱싱 (약 90% 인덱스 크기 감소)
```

#### 인덱스 커버링 쿼리

**개념:**
쿼리가 필요한 모든 컬럼을 인덱스에서 직접 조회 (테이블 접근 불필요)

**예시:**
```sql
-- 인덱스: idx_todos_calendar (dueDate, isDeleted, userId)

-- 커버링 쿼리 (빠름)
SELECT dueDate, userId FROM todos
WHERE dueDate BETWEEN '...' AND '...' AND isDeleted = FALSE;

-- 비커버링 쿼리 (상대적으로 느림)
SELECT title, description FROM todos
WHERE dueDate BETWEEN '...' AND '...' AND isDeleted = FALSE;
```

### 5.4 인덱스 모니터링

#### 인덱스 사용률 확인

```sql
-- 인덱스 사용 통계 조회
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

#### 사용되지 않는 인덱스 확인

```sql
-- 사용되지 않는 인덱스 찾기
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### 인덱스 크기 확인

```sql
-- 테이블 및 인덱스 크기 조회
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) -
                   pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 6. 제약 조건 및 비즈니스 규칙

### 6.1 제약 조건 매핑

#### Users 테이블 제약 조건

| 제약 조건명              | 타입    | 컬럼     | 규칙                                | 비즈니스 규칙 |
| ------------------------ | ------- | -------- | ----------------------------------- | ------------- |
| users_pkey               | PK      | userId   | Primary Key, UUID                   | -             |
| uk_users_username        | UNIQUE  | username | 중복 불가                           | C-11          |
| uk_users_email           | UNIQUE  | email    | 중복 불가                           | C-11          |
| chk_users_username_length | CHECK  | username | LENGTH(username) >= 1 AND <= 50     | C-09 응용     |
| chk_users_email_format   | CHECK   | email    | 이메일 형식 검증 (정규식)           | -             |

**SQL 정의:**
```sql
CREATE TABLE users (
    userId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_username_length
        CHECK (LENGTH(username) >= 1 AND LENGTH(username) <= 50),
    CONSTRAINT chk_users_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
```

#### Todos 테이블 제약 조건

| 제약 조건명                   | 타입    | 컬럼                      | 규칙                                              | 비즈니스 규칙 |
| ----------------------------- | ------- | ------------------------- | ------------------------------------------------- | ------------- |
| todos_pkey                    | PK      | todoId                    | Primary Key, UUID                                 | -             |
| fk_todos_user_id              | FK      | userId                    | REFERENCES users(userId), NULL 허용               | BR-11         |
| chk_todos_title_length        | CHECK   | title                     | LENGTH(title) >= 1 AND <= 200                     | C-09, BR-04   |
| chk_todos_description_length  | CHECK   | description               | LENGTH(description) <= 2000 OR NULL               | C-10          |
| chk_todos_dates               | CHECK   | startDate, dueDate        | startDate <= dueDate OR NULL                      | C-12          |
| chk_todos_delete_consistency  | CHECK   | isDeleted, deletedAt      | isDeleted와 deletedAt 일관성 유지                 | BR-07         |
| chk_todos_public_holiday      | CHECK   | isPublicHoliday, userId   | 국경일은 userId = NULL                            | BR-11, BR-12  |

**SQL 정의:**
```sql
CREATE TABLE todos (
    todoId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    startDate DATE,
    dueDate DATE,
    isCompleted BOOLEAN NOT NULL DEFAULT FALSE,
    isPublicHoliday BOOLEAN NOT NULL DEFAULT FALSE,
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    deletedAt TIMESTAMP,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_todos_user_id
        FOREIGN KEY (userId) REFERENCES users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_todos_title_length
        CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200),

    CONSTRAINT chk_todos_description_length
        CHECK (description IS NULL OR LENGTH(description) <= 2000),

    CONSTRAINT chk_todos_dates
        CHECK (
            startDate IS NULL OR
            dueDate IS NULL OR
            startDate <= dueDate
        ),

    CONSTRAINT chk_todos_delete_consistency
        CHECK (
            (isDeleted = FALSE AND deletedAt IS NULL) OR
            (isDeleted = TRUE AND deletedAt IS NOT NULL)
        ),

    CONSTRAINT chk_todos_public_holiday
        CHECK (
            (isPublicHoliday = FALSE) OR
            (isPublicHoliday = TRUE AND userId IS NULL)
        )
);
```

### 6.2 비즈니스 규칙 상세

#### 인증 및 권한 규칙

**BR-01: 로그인한 사용자만 접근**
- **구현 위치**: 애플리케이션 레이어 (미들웨어)
- **검증 방법**: JWT 토큰 검증
- **SQL 영향**: 쿼리에 userId 조건 포함

```javascript
// 예시: Express 미들웨어
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}
```

**BR-02: 본인이 생성한 할 일만 수정/삭제 가능**
- **구현 위치**: 애플리케이션 레이어 + SQL
- **검증 방법**: userId 일치 확인

```sql
-- 권한 확인 포함 수정 쿼리
UPDATE todos
SET title = $2
WHERE todoId = $1 AND userId = $3;  -- userId 조건 필수
```

**BR-03: 관리자만 국경일 수정/삭제 가능**
- **구현 위치**: 애플리케이션 레이어
- **검증 방법**: 사용자 역할(role) 확인
- **확장 방안**: Users 테이블에 role 컬럼 추가 (향후)

#### 할 일 관리 규칙

**BR-04: 할 일 제목 필수**
- **구현 위치**: 데이터베이스 (NOT NULL) + 애플리케이션
- **제약 조건**: `title VARCHAR(200) NOT NULL`
- **에러 처리**: INSERT 시 제목 없으면 에러 발생

**BR-05: 과거 날짜 입력 가능**
- **구현 위치**: 제약 조건 없음 (허용)
- **이유**: 이미 지난 할 일 등록 허용
- **참고**: 만료일 유효성은 애플리케이션에서 선택적 경고

**BR-06: 자신의 할 일과 국경일 함께 조회**
- **구현 위치**: SQL 쿼리
- **쿼리 패턴**: `WHERE userId = $1 OR userId IS NULL`

```sql
SELECT * FROM todos
WHERE (userId = $1 OR userId IS NULL) AND isDeleted = FALSE;
```

#### 삭제 및 복구 규칙

**BR-07: 소프트 삭제 (휴지통)**
- **구현 위치**: 데이터베이스 + 애플리케이션
- **메커니즘**: isDeleted = TRUE, deletedAt = NOW()
- **제약 조건**: `chk_todos_delete_consistency`

```sql
-- 소프트 삭제 쿼리
UPDATE todos
SET isDeleted = TRUE, deletedAt = NOW()
WHERE todoId = $1 AND userId = $2;
```

**BR-08: 휴지통에서 복구 또는 영구 삭제**
- **복구**: isDeleted = FALSE, deletedAt = NULL
- **영구 삭제**: DELETE FROM todos WHERE ...

**BR-09: 영구 삭제된 할 일 복구 불가**
- **구현 위치**: 물리적 삭제 (데이터베이스에서 제거)
- **권장**: 영구 삭제 전 확인 프로세스

**BR-10: 휴지통 항목 일반 목록에서 제외**
- **구현 위치**: SQL 쿼리
- **쿼리 패턴**: `WHERE isDeleted = FALSE`

#### 국경일 규칙

**BR-11: 국경일은 userId = NULL**
- **구현 위치**: 데이터베이스 제약 조건
- **제약 조건**: `chk_todos_public_holiday`

```sql
CONSTRAINT chk_todos_public_holiday
    CHECK (
        (isPublicHoliday = FALSE) OR
        (isPublicHoliday = TRUE AND userId IS NULL)
    )
```

**BR-12: 관리자만 국경일 생성/수정/삭제**
- **구현 위치**: 애플리케이션 레이어
- **권장**: 별도 관리자 API 엔드포인트

**BR-13: 모든 사용자에게 국경일 동일하게 표시**
- **구현 위치**: SQL 쿼리
- **쿼리 패턴**: `WHERE userId IS NULL AND isPublicHoliday = TRUE`

#### 캘린더 표시 규칙

**BR-14: 개인 할 일과 국경일 함께 표시**
- **구현 위치**: SQL 쿼리
- **쿼리 패턴**: OR 조건 사용

**BR-15: 만료 기한 없는 할 일 캘린더에 표시 안 함**
- **구현 위치**: SQL 쿼리
- **쿼리 패턴**: `WHERE dueDate IS NOT NULL`

**BR-16: 삭제된 할 일 캘린더에 표시 안 함**
- **구현 위치**: SQL 쿼리
- **쿼리 패턴**: `WHERE isDeleted = FALSE`

### 6.3 데이터 제약사항

**C-01: 비밀번호 암호화**
- **구현**: bcrypt 사용 (애플리케이션 레이어)
- **강도**: bcrypt 라운드 10 권장
- **검증**: 평문 비밀번호 저장 방지

**C-09: 할 일 제목 최대 200자**
- **구현**: VARCHAR(200) + CHECK 제약
- **쿼리**: `CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200)`

**C-10: 할 일 설명 최대 2000자**
- **구현**: TEXT + CHECK 제약
- **쿼리**: `CHECK (description IS NULL OR LENGTH(description) <= 2000)`

**C-11: 사용자명 중복 불가**
- **구현**: UNIQUE 제약
- **쿼리**: `UNIQUE (username)`

**C-12: 만료일 >= 시작일**
- **구현**: CHECK 제약
- **쿼리**: `CHECK (startDate IS NULL OR dueDate IS NULL OR startDate <= dueDate)`

**C-15: 완료된 할 일 수정/삭제 불가**
- **구현**: 애플리케이션 레이어
- **SQL**: `WHERE isCompleted = FALSE` 조건 추가

```sql
-- 완료된 할 일은 수정 불가
UPDATE todos
SET title = $2
WHERE todoId = $1 AND userId = $3 AND isCompleted = FALSE;
```

### 6.4 제약 조건 위반 처리

#### PostgreSQL 에러 코드

| 에러 코드 | 설명                  | 원인                      |
| --------- | --------------------- | ------------------------- |
| 23505     | unique_violation      | UNIQUE 제약 위반          |
| 23503     | foreign_key_violation | Foreign Key 제약 위반     |
| 23514     | check_violation       | CHECK 제약 위반           |
| 23502     | not_null_violation    | NOT NULL 제약 위반        |

#### 에러 처리 예시

```javascript
// Node.js 예시
try {
    await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
                     [username, email, hashedPassword]);
} catch (error) {
    if (error.code === '23505') {
        if (error.constraint === 'uk_users_username') {
            return res.status(400).json({ error: '이미 사용 중인 사용자명입니다.' });
        } else if (error.constraint === 'uk_users_email') {
            return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
        }
    } else if (error.code === '23514') {
        return res.status(400).json({ error: '입력 데이터가 유효하지 않습니다.' });
    }
    throw error;
}
```

---

## 7. 백업 및 복원 절차

### 7.1 Supabase 자동 백업

#### 개요

Supabase는 자동으로 데이터베이스 백업을 수행합니다:

- **백업 주기**: 매일 자동 백업
- **보관 기간**:
  - Free 플랜: 7일
  - Pro 플랜: 30일
  - Team/Enterprise 플랜: 커스터마이징 가능
- **백업 위치**: Supabase 인프라 내부

#### 백업 확인 방법

1. Supabase 대시보드 접속
2. **Settings** → **Database** → **Backups** 클릭
3. 백업 목록 및 상태 확인

### 7.2 수동 백업 (로컬)

#### pg_dump를 사용한 전체 백업

**전체 데이터베이스 백업**

```bash
# 로컬 환경 백업
pg_dump -h localhost -U postgres -d cjy_todolist -F c -f backup_$(date +%Y%m%d).dump

# Supabase 백업
pg_dump -h db.xxxxxxxxxxxxx.supabase.co -U postgres -d postgres -F c -f backup_$(date +%Y%m%d).dump

# 압축 백업 (더 작은 파일 크기)
pg_dump -h localhost -U postgres -d cjy_todolist -F c -Z 9 -f backup_$(date +%Y%m%d).dump
```

**SQL 포맷 백업 (텍스트 파일)**

```bash
# SQL 파일로 백업
pg_dump -h localhost -U postgres -d cjy_todolist -f backup_$(date +%Y%m%d).sql

# 특정 테이블만 백업
pg_dump -h localhost -U postgres -d cjy_todolist -t users -t todos -f backup_tables.sql
```

#### 스키마만 백업

```bash
# 스키마 구조만 백업 (데이터 제외)
pg_dump -h localhost -U postgres -d cjy_todolist -s -f schema_backup.sql
```

#### 데이터만 백업

```bash
# 데이터만 백업 (스키마 제외)
pg_dump -h localhost -U postgres -d cjy_todolist -a -f data_backup.sql
```

### 7.3 백업 자동화

#### Windows 예약 작업 (Task Scheduler)

**배치 스크립트 작성: backup.bat**

```batch
@echo off
SET PGPASSWORD=your_password
SET BACKUP_DIR=C:\backups\cjy_todolist
SET DATE=%date:~0,4%%date:~5,2%%date:~8,2%

REM 백업 디렉토리 생성
IF NOT EXIST %BACKUP_DIR% mkdir %BACKUP_DIR%

REM 백업 실행
pg_dump -h localhost -U postgres -d cjy_todolist -F c -f %BACKUP_DIR%\backup_%DATE%.dump

REM 7일 이상 된 백업 삭제
forfiles /p %BACKUP_DIR% /s /m *.dump /d -7 /c "cmd /c del @path"

echo Backup completed: %DATE%
```

**예약 작업 설정**

1. Windows 작업 스케줄러 실행
2. **작업 만들기** 클릭
3. **일반** 탭: 이름 입력 (예: "cjy-todolist-backup")
4. **트리거** 탭:
   - 새로 만들기 → 매일, 새벽 2시
5. **작업** 탭:
   - 프로그램: `C:\backups\backup.bat`
6. 확인 클릭

#### Linux/Mac Cron Job

**백업 스크립트: backup.sh**

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/cjy_todolist"
DATE=$(date +%Y%m%d_%H%M%S)
PGPASSWORD="your_password"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 백업 실행
pg_dump -h localhost -U postgres -d cjy_todolist -F c -f $BACKUP_DIR/backup_$DATE.dump

# 7일 이상 된 백업 삭제
find $BACKUP_DIR -name "backup_*.dump" -mtime +7 -delete

echo "Backup completed: $DATE"
```

**실행 권한 부여**

```bash
chmod +x backup.sh
```

**Cron 설정 (매일 새벽 2시)**

```bash
crontab -e

# 다음 줄 추가
0 2 * * * /path/to/backup.sh >> /var/log/cjy_todolist_backup.log 2>&1
```

### 7.4 복원 절차

#### 전체 데이터베이스 복원

**방법 A: pg_restore 사용 (커스텀 포맷)**

```bash
# 1. 기존 데이터베이스 삭제 (주의!)
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS cjy_todolist;"

# 2. 새 데이터베이스 생성
psql -h localhost -U postgres -c "CREATE DATABASE cjy_todolist;"

# 3. 백업 복원
pg_restore -h localhost -U postgres -d cjy_todolist -F c backup_20251126.dump
```

**방법 B: psql 사용 (SQL 포맷)**

```bash
# SQL 파일 복원
psql -h localhost -U postgres -d cjy_todolist -f backup_20251126.sql
```

#### 부분 복원 (특정 테이블만)

```bash
# 특정 테이블만 복원
pg_restore -h localhost -U postgres -d cjy_todolist -t users -F c backup.dump
pg_restore -h localhost -U postgres -d cjy_todolist -t todos -F c backup.dump
```

#### Supabase 복원

**방법 A: Supabase 대시보드 (Point-in-Time Recovery)**

1. Supabase 대시보드 접속
2. **Settings** → **Database** → **Backups**
3. 복원할 백업 선택
4. **"Restore"** 클릭
5. 확인 후 대기 (약 5-10분)

**방법 B: 수동 복원**

```bash
# 1. 로컬에서 복원용 데이터베이스 생성
psql -h db.xxxxxxxxxxxxx.supabase.co -U postgres -c "DROP DATABASE IF EXISTS postgres_restore;"
psql -h db.xxxxxxxxxxxxx.supabase.co -U postgres -c "CREATE DATABASE postgres_restore;"

# 2. 백업 복원
pg_restore -h db.xxxxxxxxxxxxx.supabase.co -U postgres -d postgres_restore -F c backup.dump

# 3. 데이터 검증 후 운영 DB로 전환
```

### 7.5 재해 복구 계획 (Disaster Recovery)

#### 복구 시나리오

**시나리오 1: 실수로 데이터 삭제**

1. 영향 범위 파악
2. 가장 최근 백업 확인
3. 테스트 환경에서 복원 테스트
4. 프로덕션 환경 복원
5. 데이터 무결성 검증

**시나리오 2: 데이터베이스 손상**

1. 즉시 읽기 전용 모드 전환
2. 손상 정도 평가
3. 백업에서 복원
4. 트랜잭션 로그 재적용 (가능한 경우)
5. 서비스 재개

**시나리오 3: 전체 시스템 장애**

1. Supabase 자동 복구 대기
2. 백업을 새 Supabase 프로젝트에 복원
3. DNS/연결 문자열 업데이트
4. 서비스 재개

#### 복구 시간 목표 (RTO/RPO)

| 지표 | 목표   | 설명                      |
| ---- | ------ | ------------------------- |
| RTO  | 2시간  | Recovery Time Objective   |
| RPO  | 24시간 | Recovery Point Objective  |

### 7.6 백업 검증

#### 정기 복원 테스트

**월간 백업 검증 절차**

1. **테스트 환경 준비**
   ```bash
   psql -U postgres -c "CREATE DATABASE cjy_todolist_test;"
   ```

2. **백업 복원**
   ```bash
   pg_restore -U postgres -d cjy_todolist_test -F c latest_backup.dump
   ```

3. **데이터 검증**
   ```sql
   -- 테이블 개수 확인
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM todos;

   -- 최근 데이터 확인
   SELECT * FROM todos ORDER BY createdAt DESC LIMIT 10;
   ```

4. **테스트 환경 정리**
   ```bash
   psql -U postgres -c "DROP DATABASE cjy_todolist_test;"
   ```

#### 백업 무결성 체크

```bash
# 백업 파일 무결성 검증
pg_restore -l backup.dump > /dev/null

# 성공 시: (아무 출력 없음)
# 실패 시: 에러 메시지 출력
```

---

## 8. 성능 튜닝 가이드

### 8.1 쿼리 최적화

#### EXPLAIN ANALYZE 사용

**기본 사용법**

```sql
-- 쿼리 실행 계획 확인
EXPLAIN SELECT * FROM todos WHERE userId = '...';

-- 실제 실행 시간 포함
EXPLAIN ANALYZE SELECT * FROM todos WHERE userId = '...';

-- 버퍼 사용량 포함
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM todos WHERE userId = '...';
```

**출력 해석**

```
QUERY PLAN
-----------------------------------------------------------------
Index Scan using idx_todos_user_id on todos  (cost=0.15..8.17 rows=1 width=xxx) (actual time=0.025..0.026 rows=5 loops=1)
  Index Cond: (userId = '...'::uuid)
  Buffers: shared hit=8
Planning Time: 0.123 ms
Execution Time: 0.045 ms
```

**주요 지표:**
- **cost**: 예상 비용 (낮을수록 좋음)
- **rows**: 예상 반환 행 수
- **actual time**: 실제 실행 시간 (ms)
- **Buffers**: 메모리/디스크 I/O

#### 슬로우 쿼리 식별

**1. PostgreSQL 슬로우 쿼리 로그 활성화**

```sql
-- 현재 설정 확인
SHOW log_min_duration_statement;

-- 1초 이상 걸리는 쿼리 로그 기록
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- 설정 적용
SELECT pg_reload_conf();
```

**2. pg_stat_statements 확장 사용**

```sql
-- 확장 설치
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 가장 느린 쿼리 Top 10
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 가장 많이 호출되는 쿼리
SELECT
    query,
    calls,
    total_exec_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

#### 쿼리 최적화 기법

**1. 불필요한 SELECT * 제거**

```sql
-- 비효율적
SELECT * FROM todos WHERE userId = '...';

-- 효율적 (필요한 컬럼만 선택)
SELECT todoId, title, dueDate, isCompleted FROM todos WHERE userId = '...';
```

**2. 인덱스 활용**

```sql
-- 비효율적 (인덱스 미사용)
SELECT * FROM todos WHERE EXTRACT(YEAR FROM dueDate) = 2025;

-- 효율적 (인덱스 사용)
SELECT * FROM todos
WHERE dueDate BETWEEN '2025-01-01' AND '2025-12-31';
```

**3. EXISTS vs IN**

```sql
-- IN 사용 (큰 결과셋에서 비효율적)
SELECT * FROM todos
WHERE userId IN (SELECT userId FROM users WHERE username LIKE 'test%');

-- EXISTS 사용 (더 효율적)
SELECT * FROM todos t
WHERE EXISTS (
    SELECT 1 FROM users u
    WHERE u.userId = t.userId AND u.username LIKE 'test%'
);
```

**4. 페이지네이션 최적화**

```sql
-- OFFSET 사용 (큰 오프셋에서 비효율적)
SELECT * FROM todos
WHERE userId = '...'
ORDER BY createdAt DESC
LIMIT 20 OFFSET 10000;  -- 느림

-- Keyset Pagination (더 효율적)
SELECT * FROM todos
WHERE userId = '...'
  AND createdAt < $1  -- 이전 페이지의 마지막 createdAt
ORDER BY createdAt DESC
LIMIT 20;
```

### 8.2 인덱스 최적화

#### 인덱스 사용 확인

```sql
-- 특정 쿼리의 인덱스 사용 확인
EXPLAIN SELECT * FROM todos WHERE userId = '...';

-- 인덱스 스캔이 나타나면 사용 중
-- Seq Scan이 나타나면 인덱스 미사용
```

#### 인덱스 재구축

시간이 지나면서 인덱스가 비대해질 수 있습니다. 정기적으로 재구축 권장.

```sql
-- 인덱스 재구축
REINDEX INDEX idx_todos_user_id;

-- 테이블의 모든 인덱스 재구축
REINDEX TABLE todos;

-- 데이터베이스의 모든 인덱스 재구축 (주의: 시간 소요)
REINDEX DATABASE cjy_todolist;
```

#### 인덱스 Bloat 확인

```sql
-- 인덱스 비대화 확인 쿼리
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 8.3 VACUUM 및 ANALYZE

#### VACUUM 개념

PostgreSQL은 삭제된 행을 즉시 제거하지 않고 "dead tuple"로 표시합니다. VACUUM은 이를 정리합니다.

#### 자동 VACUUM

```sql
-- 자동 VACUUM 설정 확인
SHOW autovacuum;

-- 테이블별 VACUUM 통계
SELECT
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    n_dead_tup,
    n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

#### 수동 VACUUM

```sql
-- 기본 VACUUM
VACUUM todos;

-- VACUUM ANALYZE (통계 업데이트 포함)
VACUUM ANALYZE todos;

-- VACUUM FULL (테이블 재구축, 더 많은 시간 소요)
VACUUM FULL todos;
```

#### ANALYZE

쿼리 플래너가 최적의 실행 계획을 수립하도록 테이블 통계를 업데이트합니다.

```sql
-- 특정 테이블 통계 업데이트
ANALYZE todos;

-- 모든 테이블 통계 업데이트
ANALYZE;

-- 통계 확인
SELECT
    schemaname,
    tablename,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

### 8.4 연결 풀링 (Connection Pooling)

#### 개념

데이터베이스 연결 생성은 비용이 큽니다. 연결 풀을 사용하면 성능이 크게 향상됩니다.

#### Node.js pg 라이브러리 설정

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,

    // 연결 풀 설정
    max: 20,                    // 최대 연결 수
    min: 5,                     // 최소 유지 연결 수
    idleTimeoutMillis: 30000,   // 30초 동안 유휴 시 연결 종료
    connectionTimeoutMillis: 2000, // 2초 내 연결 실패 시 타임아웃
});

// 쿼리 실행
async function getUser(userId) {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE userId = $1', [userId]);
        return result.rows[0];
    } finally {
        client.release();  // 반드시 연결 반환
    }
}
```

#### Supabase Connection Pooling

Supabase는 PgBouncer를 통한 연결 풀링을 제공합니다.

**설정 방법:**

1. Supabase 대시보드 → Settings → Database
2. Connection Pooling 섹션에서 "Session Mode" 연결 문자열 사용
3. 포트 6543 사용 (직접 연결은 5432)

```env
# 직접 연결 (제한적)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Connection Pooling (권장)
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:6543/postgres
```

### 8.5 캐싱 전략

#### 애플리케이션 레벨 캐싱

**Redis를 사용한 쿼리 결과 캐싱**

```javascript
const redis = require('redis');
const client = redis.createClient();

async function getUserTodos(userId) {
    const cacheKey = `user:${userId}:todos`;

    // 1. 캐시 확인
    const cached = await client.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }

    // 2. 데이터베이스 조회
    const result = await pool.query(
        'SELECT * FROM todos WHERE userId = $1 AND isDeleted = FALSE',
        [userId]
    );

    // 3. 캐시 저장 (5분 TTL)
    await client.setex(cacheKey, 300, JSON.stringify(result.rows));

    return result.rows;
}
```

#### 데이터베이스 레벨 캐싱

PostgreSQL은 자동으로 쿼리 결과를 캐싱합니다 (shared_buffers).

```sql
-- 캐시 설정 확인
SHOW shared_buffers;
SHOW effective_cache_size;

-- 캐시 히트율 확인
SELECT
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit) as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- 목표: cache_hit_ratio > 0.99 (99% 이상)
```

### 8.6 성능 모니터링

#### 주요 지표

**1. 쿼리 응답 시간**
```sql
SELECT
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**2. 테이블 크기**
```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**3. 인덱스 효율성**
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

**4. 데드 튜플**
```sql
SELECT
    schemaname,
    tablename,
    n_live_tup,
    n_dead_tup,
    n_dead_tup::float / NULLIF(n_live_tup, 0) as dead_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;
```

#### 정기 점검 체크리스트

**일일 점검:**
- [ ] 슬로우 쿼리 로그 확인
- [ ] 에러 로그 확인
- [ ] 연결 수 모니터링

**주간 점검:**
- [ ] 인덱스 사용률 확인
- [ ] 캐시 히트율 확인
- [ ] 데드 튜플 비율 확인

**월간 점검:**
- [ ] 백업 검증
- [ ] 인덱스 재구축
- [ ] VACUUM FULL (필요 시)
- [ ] 성능 벤치마크

---

## 9. 트러블슈팅 가이드

### 9.1 연결 문제

#### 문제: "connection refused"

**증상:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**원인:**
1. PostgreSQL 서비스가 실행되지 않음
2. 잘못된 호스트/포트
3. 방화벽 차단

**해결 방법:**

**Windows:**
```bash
# PostgreSQL 서비스 상태 확인
sc query postgresql-x64-14

# 서비스 시작
net start postgresql-x64-14
```

**Linux/Mac:**
```bash
# 서비스 상태 확인
sudo systemctl status postgresql

# 서비스 시작
sudo systemctl start postgresql

# 포트 리스닝 확인
sudo netstat -tuln | grep 5432
```

#### 문제: "password authentication failed"

**증상:**
```
Error: password authentication failed for user "postgres"
```

**원인:**
잘못된 비밀번호 또는 인증 설정

**해결 방법:**

1. **비밀번호 재설정:**
   ```sql
   -- psql에 postgres 사용자로 접속 (인증 없이)
   psql -U postgres

   -- 비밀번호 변경
   ALTER USER postgres WITH PASSWORD 'new_password';
   ```

2. **pg_hba.conf 확인:**
   ```bash
   # 파일 위치 찾기
   psql -U postgres -c "SHOW hba_file;"

   # 파일 편집 (관리자 권한 필요)
   # 다음 라인 추가
   # host    all             all             127.0.0.1/32            md5
   ```

#### 문제: "too many connections"

**증상:**
```
Error: sorry, too many clients already
```

**원인:**
최대 연결 수 초과

**해결 방법:**

1. **현재 연결 수 확인:**
   ```sql
   SELECT COUNT(*) FROM pg_stat_activity;

   -- 최대 연결 수 확인
   SHOW max_connections;
   ```

2. **유휴 연결 종료:**
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
     AND state_change < NOW() - INTERVAL '10 minutes';
   ```

3. **max_connections 증가 (재시작 필요):**
   ```sql
   ALTER SYSTEM SET max_connections = 200;

   -- PostgreSQL 재시작 필요
   ```

### 9.2 성능 문제

#### 문제: 쿼리가 너무 느림

**증상:**
특정 쿼리가 수초 이상 소요

**원인:**
1. 인덱스 누락
2. 잘못된 쿼리 작성
3. 통계 정보 오래됨

**해결 방법:**

1. **EXPLAIN ANALYZE로 분석:**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM todos WHERE userId = '...';
   ```

2. **Seq Scan이 나타나면 인덱스 추가:**
   ```sql
   CREATE INDEX idx_new_column ON todos(column_name);
   ```

3. **통계 업데이트:**
   ```sql
   ANALYZE todos;
   ```

#### 문제: 인덱스가 사용되지 않음

**증상:**
EXPLAIN에서 "Seq Scan" 표시

**원인:**
1. 통계가 오래됨
2. WHERE 절에 함수 사용
3. 데이터가 너무 적음 (인덱스 불필요)

**해결 방법:**

1. **통계 업데이트:**
   ```sql
   ANALYZE todos;
   ```

2. **함수 사용 피하기:**
   ```sql
   -- 비효율적 (인덱스 미사용)
   WHERE LOWER(username) = 'testuser';

   -- 효율적 (인덱스 사용)
   WHERE username = 'testuser';
   ```

3. **함수 기반 인덱스:**
   ```sql
   CREATE INDEX idx_username_lower ON users(LOWER(username));
   ```

### 9.3 데이터 무결성 문제

#### 문제: Foreign Key 제약 위반

**증상:**
```
Error: insert or update on table "todos" violates foreign key constraint "fk_todos_user_id"
```

**원인:**
존재하지 않는 userId 참조

**해결 방법:**

1. **userId 존재 확인:**
   ```sql
   SELECT EXISTS(SELECT 1 FROM users WHERE userId = '...');
   ```

2. **고아 레코드 찾기:**
   ```sql
   SELECT t.* FROM todos t
   LEFT JOIN users u ON t.userId = u.userId
   WHERE u.userId IS NULL AND t.userId IS NOT NULL;
   ```

3. **고아 레코드 삭제:**
   ```sql
   DELETE FROM todos
   WHERE userId NOT IN (SELECT userId FROM users)
     AND userId IS NOT NULL;
   ```

#### 문제: UNIQUE 제약 위반

**증상:**
```
Error: duplicate key value violates unique constraint "uk_users_username"
```

**원인:**
중복된 username 또는 email 입력

**해결 방법:**

1. **중복 확인 쿼리:**
   ```sql
   SELECT username, COUNT(*)
   FROM users
   GROUP BY username
   HAVING COUNT(*) > 1;
   ```

2. **애플리케이션에서 사전 확인:**
   ```javascript
   const exists = await pool.query(
       'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)',
       [username]
   );
   if (exists.rows[0].exists) {
       throw new Error('Username already exists');
   }
   ```

#### 문제: CHECK 제약 위반

**증상:**
```
Error: new row for relation "todos" violates check constraint "chk_todos_dates"
```

**원인:**
startDate > dueDate

**해결 방법:**

애플리케이션에서 입력 검증:
```javascript
if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
    throw new Error('Start date must be before due date');
}
```

### 9.4 Supabase 관련 문제

#### 문제: SSL connection error

**증상:**
```
Error: self signed certificate in certificate chain
```

**원인:**
Node.js에서 Supabase SSL 인증서 검증 실패

**해결 방법:**

```javascript
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false  // 프로덕션에서는 true 권장
    }
});
```

#### 문제: Connection timeout

**증상:**
```
Error: timeout expired
```

**원인:**
1. 네트워크 문제
2. Supabase 서비스 문제
3. 잘못된 연결 문자열

**해결 방법:**

1. **Supabase 상태 확인:**
   - [Supabase Status Page](https://status.supabase.com)

2. **연결 문자열 확인:**
   - Supabase 대시보드 → Settings → Database
   - Connection string 재확인

3. **Connection Pooling 사용:**
   - 포트 6543 사용 (5432 대신)

### 9.5 마이그레이션 문제

#### 문제: 마이그레이션 실행 실패

**증상:**
```
ERROR: relation "users" already exists
```

**원인:**
이미 스키마가 존재함

**해결 방법:**

1. **기존 스키마 확인:**
   ```sql
   \dt  -- 테이블 목록
   ```

2. **선택 A: 기존 스키마 삭제 (주의!)**
   ```sql
   DROP TABLE IF EXISTS todos CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```

3. **선택 B: IF NOT EXISTS 사용:**
   ```sql
   CREATE TABLE IF NOT EXISTS users (...);
   ```

#### 문제: 데이터 손실

**증상:**
마이그레이션 후 데이터가 사라짐

**원인:**
DROP TABLE 실행

**해결 방법:**

1. **백업에서 복원:**
   ```bash
   pg_restore -d cjy_todolist backup.dump
   ```

2. **향후 예방:**
   - 마이그레이션 전 반드시 백업
   - 테스트 환경에서 먼저 테스트
   - 트랜잭션 사용

### 9.6 일반적인 에러 코드

| 에러 코드 | 설명                  | 해결 방법                     |
| --------- | --------------------- | ----------------------------- |
| 08001     | sqlclient_unable_to_establish_sqlconnection | 연결 문자열 확인, 서비스 상태 확인 |
| 08006     | connection_failure    | 네트워크 확인, 방화벽 설정     |
| 23505     | unique_violation      | 중복 데이터 확인, UNIQUE 제약  |
| 23503     | foreign_key_violation | 참조 무결성 확인, Foreign Key  |
| 23514     | check_violation       | 입력 검증, CHECK 제약          |
| 42P01     | undefined_table       | 테이블 존재 확인, 마이그레이션 |
| 42703     | undefined_column      | 컬럼명 오타 확인, 스키마 확인  |

### 9.7 로그 확인 방법

#### PostgreSQL 로그 위치

**Windows:**
```
C:\Program Files\PostgreSQL\14\data\log\
```

**Linux:**
```
/var/log/postgresql/
```

#### 로그 확인 명령어

```bash
# 최근 100줄 확인
tail -n 100 postgresql-2025-11-26.log

# 실시간 로그 모니터링
tail -f postgresql-2025-11-26.log

# 에러만 필터링
grep "ERROR" postgresql-2025-11-26.log
```

#### Supabase 로그

1. Supabase 대시보드 접속
2. **Logs** 메뉴 클릭
3. **PostgreSQL Logs** 선택
4. 시간 범위 및 필터 설정

---

## 10. 추가 리소스

### 10.1 공식 문서

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Node.js pg 라이브러리](https://node-postgres.com/)

### 10.2 도구

- **pgAdmin 4**: GUI 관리 도구
- **DBeaver**: 범용 데이터베이스 클라이언트
- **TablePlus**: 가벼운 데이터베이스 클라이언트
- **Postico**: Mac 전용 PostgreSQL 클라이언트

### 10.3 관련 문서

- [도메인 정의서](../docs/1-domain-definition.md)
- [PRD](../docs/3-prd.md)
- [ERD](../docs/6-erd.md)
- [프로젝트 구조](../docs/5-project-structure-principles.md)

---

## 변경 이력

| 버전 | 날짜       | 작성자 | 변경 내용      |
| ---- | ---------- | ------ | -------------- |
| 1.0  | 2025-11-26 | Technical Writer | 초안 작성 완료 |

---

**END OF DOCUMENT**
