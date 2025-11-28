import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createRefreshTokensTable() {
  try {
    await client.connect();
    console.log('데이터베이스 연결 성공');

    // refresh_tokens 테이블 생성 쿼리
    const createTableQuery = `
      -- ============================================================================
      -- Refresh Tokens 테이블
      -- ============================================================================
      -- 설명: JWT Refresh 토큰을 저장하는 테이블
      -- 주요 기능:
      --   - Refresh 토큰 관리
      --   - 자동 로그인 기능 지원
      -- ============================================================================

      CREATE TABLE IF NOT EXISTS refresh_tokens (
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
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(userId);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expiresAt);

      -- 트리거 적용 (updatedAt 자동 업데이트) - 이미 존재하는 경우를 대비해 예외 처리
      DO $$
      BEGIN
          CREATE TRIGGER trg_refresh_tokens_updated_at
              BEFORE UPDATE ON refresh_tokens
              FOR EACH ROW
              EXECUTE FUNCTION update_updated_at_column();
      EXCEPTION
          WHEN duplicate_object THEN
              NULL; -- 이미 트리거가 존재하면 무시
      END $$;
    `;

    await client.query(createTableQuery);
    console.log('refresh_tokens 테이블 생성 완료');

    // 생성된 테이블 확인
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'refresh_tokens';
    `);
    
    console.log(`refresh_tokens 테이블 존재 여부: ${result.rows.length > 0 ? 'true' : 'false'}`);

    await client.end();
  } catch (err) {
    console.error('오류 발생:', err);
    if (client) {
      await client.end();
    }
  }
}

createRefreshTokensTable();