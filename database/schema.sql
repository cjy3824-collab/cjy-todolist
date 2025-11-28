-- ============================================================================
-- cjy-todoList Database Schema (PostgreSQL)
-- ============================================================================
-- 버전: 1.0
-- 작성일: 2025-11-26
-- 설명: cjy-todoList 애플리케이션의 데이터베이스 스키마 정의
-- 참고: docs/6-erd.md
-- ============================================================================

-- UUID 확장 모듈 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Users 테이블
-- ============================================================================
-- 설명: 사용자 계정 정보를 관리하는 테이블
-- 주요 기능:
--   - 사용자 인증 및 권한 관리
--   - 할 일 소유자 식별
-- ============================================================================

CREATE TABLE users (
    -- Primary Key
    userId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- 사용자 정보
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,

    -- 타임스탬프
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

    -- 제약 조건
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_username_length CHECK (LENGTH(username) >= 1 AND LENGTH(username) <= 50),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 사용자 테이블 코멘트
COMMENT ON TABLE users IS '사용자 계정 정보';
COMMENT ON COLUMN users.userId IS '사용자 고유 ID (UUID)';
COMMENT ON COLUMN users.username IS '사용자명 (최대 50자, 고유값)';
COMMENT ON COLUMN users.password IS 'bcrypt로 암호화된 비밀번호';
COMMENT ON COLUMN users.email IS '이메일 주소 (최대 100자, 고유값)';
COMMENT ON COLUMN users.createdAt IS '계정 생성 일시';
COMMENT ON COLUMN users.updatedAt IS '계정 마지막 수정 일시';

-- Users 테이블 인덱스
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(createdAt);

-- ============================================================================
-- 2. Todos 테이블
-- ============================================================================
-- 설명: 사용자의 할 일 및 국경일 정보를 관리하는 테이블
-- 주요 기능:
--   - 할 일 CRUD
--   - 소프트 삭제 (휴지통)
--   - 국경일 관리 (userId = NULL)
-- ============================================================================

CREATE TABLE todos (
    -- Primary Key
    todoId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign Key (NULL 허용 - 국경일)
    userId UUID,

    -- 할 일 정보
    title VARCHAR(200) NOT NULL,
    description TEXT,

    -- 날짜 정보
    startDate DATE,
    dueDate DATE,

    -- 상태 플래그
    isCompleted BOOLEAN NOT NULL DEFAULT FALSE,
    isPublicHoliday BOOLEAN NOT NULL DEFAULT FALSE,
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- 타임스탬프
    deletedAt TIMESTAMP,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

    -- 제약 조건
    CONSTRAINT fk_todos_user_id
        FOREIGN KEY (userId)
        REFERENCES users(userId)
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

-- ============================================================================
-- 3. Refresh Tokens 테이블
-- ============================================================================
-- 설명: JWT Refresh 토큰을 저장하는 테이블
-- 주요 기능:
--   - Refresh 토큰 관리
--   - 자동 로그인 기능 지원
-- ============================================================================

CREATE TABLE refresh_tokens (
    -- Primary Key
    tokenId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign Key
    userId UUID NOT NULL,

    -- 토큰 정보
    token VARCHAR(255) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,

    -- 타임스탬프
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),

    -- 제약 조건
    CONSTRAINT fk_refresh_tokens_user_id
        FOREIGN KEY (userId)
        REFERENCES users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uk_refresh_tokens_token UNIQUE (token)
);

-- Refresh Tokens 테이블 코멘트
COMMENT ON TABLE refresh_tokens IS 'JWT Refresh 토큰 정보';
COMMENT ON COLUMN refresh_tokens.tokenId IS 'Refresh 토큰 고유 ID (UUID)';
COMMENT ON COLUMN refresh_tokens.userId IS '사용자 ID (FK)';
COMMENT ON COLUMN refresh_tokens.token IS 'Refresh 토큰 값 (JWT)';
COMMENT ON COLUMN refresh_tokens.expiresAt IS '토큰 만료 일시';
COMMENT ON COLUMN refresh_tokens.createdAt IS '토큰 생성 일시';
COMMENT ON COLUMN refresh_tokens.updatedAt IS '토큰 마지막 수정 일시';

-- Refresh Tokens 테이블 인덱스
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(userId);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expiresAt);

-- 트리거 적용 (updatedAt 자동 업데이트)
CREATE TRIGGER trg_refresh_tokens_updated_at
    BEFORE UPDATE ON refresh_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Todos 테이블 코멘트
COMMENT ON TABLE todos IS '할 일 및 국경일 정보';
COMMENT ON COLUMN todos.todoId IS '할 일 고유 ID (UUID)';
COMMENT ON COLUMN todos.userId IS '소유자 ID (NULL이면 국경일)';
COMMENT ON COLUMN todos.title IS '할 일 제목 (최대 200자, 필수)';
COMMENT ON COLUMN todos.description IS '할 일 상세 설명 (최대 2000자, 선택사항)';
COMMENT ON COLUMN todos.startDate IS '시작일 (선택사항)';
COMMENT ON COLUMN todos.dueDate IS '만료 기한 (선택사항, startDate 이후여야 함)';
COMMENT ON COLUMN todos.isCompleted IS '완료 여부 (기본값: false)';
COMMENT ON COLUMN todos.isPublicHoliday IS '국경일 여부 (기본값: false)';
COMMENT ON COLUMN todos.isDeleted IS '소프트 삭제 여부 (기본값: false)';
COMMENT ON COLUMN todos.deletedAt IS '삭제 일시 (삭제 시에만 기록)';
COMMENT ON COLUMN todos.createdAt IS '생성 일시';
COMMENT ON COLUMN todos.updatedAt IS '마지막 수정 일시';

-- Todos 테이블 인덱스
-- 단일 컬럼 인덱스
CREATE INDEX idx_todos_user_id ON todos(userId);
CREATE INDEX idx_todos_is_deleted ON todos(isDeleted);
CREATE INDEX idx_todos_is_completed ON todos(isCompleted);
CREATE INDEX idx_todos_is_public_holiday ON todos(isPublicHoliday);
CREATE INDEX idx_todos_due_date ON todos(dueDate);
CREATE INDEX idx_todos_start_date ON todos(startDate);
CREATE INDEX idx_todos_created_at ON todos(createdAt);
CREATE INDEX idx_todos_updated_at ON todos(updatedAt);

-- 복합 인덱스 (쿼리 최적화)
-- 사용자별 정상 할 일 조회용
CREATE INDEX idx_todos_user_active ON todos(userId, isDeleted, isCompleted)
    WHERE isDeleted = FALSE;

-- 캘린더 조회용
CREATE INDEX idx_todos_calendar ON todos(dueDate, isDeleted, userId)
    WHERE isDeleted = FALSE AND dueDate IS NOT NULL;

-- 국경일 조회용
CREATE INDEX idx_todos_public_holidays ON todos(dueDate, isPublicHoliday)
    WHERE userId IS NULL AND isPublicHoliday = TRUE AND isDeleted = FALSE;

-- 휴지통 조회용
CREATE INDEX idx_todos_trash ON todos(userId, isDeleted, deletedAt)
    WHERE isDeleted = TRUE;

-- ============================================================================
-- 3. 트리거 함수
-- ============================================================================
-- 설명: updatedAt 자동 업데이트 트리거
-- ============================================================================

-- updatedAt 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users 테이블에 트리거 적용
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Todos 테이블에 트리거 적용
CREATE TRIGGER trg_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. 뷰 (View) - 자주 사용되는 쿼리 최적화
-- ============================================================================

-- 활성 할 일 뷰 (삭제되지 않은 할 일)
CREATE OR REPLACE VIEW v_active_todos AS
SELECT
    todoId,
    userId,
    title,
    description,
    startDate,
    dueDate,
    isCompleted,
    isPublicHoliday,
    createdAt,
    updatedAt
FROM todos
WHERE isDeleted = FALSE;

COMMENT ON VIEW v_active_todos IS '삭제되지 않은 활성 할 일 목록';

-- 국경일 뷰
CREATE OR REPLACE VIEW v_public_holidays AS
SELECT
    todoId,
    title,
    description,
    dueDate,
    createdAt,
    updatedAt
FROM todos
WHERE userId IS NULL
    AND isPublicHoliday = TRUE
    AND isDeleted = FALSE;

COMMENT ON VIEW v_public_holidays IS '국경일 목록';

-- 휴지통 뷰
CREATE OR REPLACE VIEW v_trash AS
SELECT
    todoId,
    userId,
    title,
    description,
    startDate,
    dueDate,
    isCompleted,
    deletedAt,
    createdAt,
    updatedAt
FROM todos
WHERE isDeleted = TRUE;

COMMENT ON VIEW v_trash IS '휴지통에 있는 할 일 목록';

-- ============================================================================
-- 5. 초기 데이터 (샘플)
-- ============================================================================
-- 설명: 개발 및 테스트를 위한 초기 데이터
-- 주의: 프로덕션 환경에서는 이 섹션을 제거하거나 주석 처리할 것
-- ============================================================================

-- 샘플 사용자 (비밀번호는 bcrypt로 암호화된 값으로 대체 필요)
-- 아래는 예시이며, 실제 환경에서는 애플리케이션 레이어에서 처리
/*
INSERT INTO users (username, email, password) VALUES
('testuser', 'test@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456'),
('admin', 'admin@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456');
*/

-- 샘플 국경일 데이터 (2025년 한국 공휴일)
INSERT INTO todos (userId, title, description, dueDate, isPublicHoliday) VALUES
(NULL, '새해', '새해 첫날', '2025-01-01', TRUE),
(NULL, '설날', '음력 1월 1일', '2025-01-28', TRUE),
(NULL, '설날 연휴', '설날 다음날', '2025-01-29', TRUE),
(NULL, '설날 연휴', '설날 다다음날', '2025-01-30', TRUE),
(NULL, '삼일절', '3.1 독립운동 기념일', '2025-03-01', TRUE),
(NULL, '어린이날', '어린이날', '2025-05-05', TRUE),
(NULL, '부처님 오신 날', '석가탄신일', '2025-05-05', TRUE),
(NULL, '현충일', '나라를 위해 목숨을 바치신 분들을 기리는 날', '2025-06-06', TRUE),
(NULL, '광복절', '광복 기념일', '2025-08-15', TRUE),
(NULL, '추석', '음력 8월 15일', '2025-10-06', TRUE),
(NULL, '추석 연휴', '추석 전날', '2025-10-05', TRUE),
(NULL, '추석 연휴', '추석 다음날', '2025-10-07', TRUE),
(NULL, '개천절', '대한민국 건국 기념일', '2025-10-03', TRUE),
(NULL, '한글날', '한글 창제 기념일', '2025-10-09', TRUE),
(NULL, '성탄절', '크리스마스', '2025-12-25', TRUE);

-- ============================================================================
-- 6. 권한 설정 (선택사항)
-- ============================================================================
-- 설명: 애플리케이션 전용 데이터베이스 사용자 생성 및 권한 부여
-- 주의: 실제 환경에 맞게 사용자명과 비밀번호를 수정할 것
-- ============================================================================

/*
-- 애플리케이션 사용자 생성
CREATE USER todolist_app WITH PASSWORD 'your_secure_password_here';

-- 데이터베이스 연결 권한
GRANT CONNECT ON DATABASE todolist TO todolist_app;

-- 스키마 사용 권한
GRANT USAGE ON SCHEMA public TO todolist_app;

-- 테이블 권한
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO todolist_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE todos TO todolist_app;

-- 시퀀스 권한 (UUID 사용 시 불필요)
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todolist_app;

-- 뷰 권한
GRANT SELECT ON v_active_todos TO todolist_app;
GRANT SELECT ON v_public_holidays TO todolist_app;
GRANT SELECT ON v_trash TO todolist_app;
*/

-- ============================================================================
-- 7. 유용한 쿼리 함수
-- ============================================================================

-- 사용자별 할 일 통계 함수
CREATE OR REPLACE FUNCTION get_user_todo_stats(p_user_id UUID)
RETURNS TABLE (
    total_todos BIGINT,
    completed_todos BIGINT,
    pending_todos BIGINT,
    deleted_todos BIGINT,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
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
    WHERE userId = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_todo_stats IS '사용자별 할 일 통계 조회';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
