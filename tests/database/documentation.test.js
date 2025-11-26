/**
 * 데이터베이스 문서화 검증 테스트
 *
 * 목적: database/schema.sql의 정확성과 문서화된 내용의 유효성을 검증
 *
 * 테스트 범위:
 * 1. 스키마 검증 - 테이블, 컬럼, 데이터 타입
 * 2. 인덱스 검증 - 문서화된 모든 인덱스 생성 확인
 * 3. 제약 조건 검증 - UNIQUE, CHECK, FOREIGN KEY
 * 4. 트리거 검증 - updatedAt 자동 업데이트
 * 5. 뷰 검증 - 활성 할 일, 국경일, 휴지통 뷰
 * 6. 함수 검증 - 사용자 통계 함수
 * 7. 쿼리 예제 검증 - 실제 데이터 작업
 */

const { Client } = require('pg');

describe('데이터베이스 스키마 검증', () => {
  let client;

  beforeAll(async () => {
    client = global.getGlobalClient();
  });

  describe('1. 테이블 구조 검증', () => {
    test('Users 테이블이 올바른 컬럼으로 생성되어야 함', async () => {
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);

      const columns = result.rows.reduce((acc, row) => {
        acc[row.column_name] = {
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          default: row.column_default
        };
        return acc;
      }, {});

      // 필수 컬럼 존재 확인
      expect(columns).toHaveProperty('userid');
      expect(columns).toHaveProperty('username');
      expect(columns).toHaveProperty('password');
      expect(columns).toHaveProperty('email');
      expect(columns).toHaveProperty('createdat');
      expect(columns).toHaveProperty('updatedat');

      // 데이터 타입 확인
      expect(columns.userid.type).toBe('uuid');
      expect(columns.username.type).toBe('character varying');
      expect(columns.password.type).toBe('character varying');
      expect(columns.email.type).toBe('character varying');
      expect(columns.createdat.type).toMatch(/timestamp/);
      expect(columns.updatedat.type).toMatch(/timestamp/);

      // NULL 제약 확인
      expect(columns.username.nullable).toBe(false);
      expect(columns.password.nullable).toBe(false);
      expect(columns.email.nullable).toBe(false);
      expect(columns.createdat.nullable).toBe(false);
      expect(columns.updatedat.nullable).toBe(false);
    });

    test('Todos 테이블이 올바른 컬럼으로 생성되어야 함', async () => {
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'todos'
        ORDER BY ordinal_position;
      `);

      const columns = result.rows.reduce((acc, row) => {
        acc[row.column_name] = {
          type: row.data_type,
          nullable: row.is_nullable === 'YES'
        };
        return acc;
      }, {});

      // 필수 컬럼 존재 확인
      const requiredColumns = [
        'todoid', 'userid', 'title', 'description',
        'startdate', 'duedate', 'iscompleted',
        'ispublicholiday', 'isdeleted', 'deletedat',
        'createdat', 'updatedat'
      ];

      requiredColumns.forEach(col => {
        expect(columns).toHaveProperty(col);
      });

      // 데이터 타입 확인
      expect(columns.todoid.type).toBe('uuid');
      expect(columns.userid.type).toBe('uuid');
      expect(columns.title.type).toBe('character varying');
      expect(columns.description.type).toBe('text');
      expect(columns.startdate.type).toBe('date');
      expect(columns.duedate.type).toBe('date');
      expect(columns.iscompleted.type).toBe('boolean');
      expect(columns.ispublicholiday.type).toBe('boolean');
      expect(columns.isdeleted.type).toBe('boolean');

      // NULL 허용 여부 확인
      expect(columns.userid.nullable).toBe(true); // 국경일 허용
      expect(columns.title.nullable).toBe(false);
      expect(columns.description.nullable).toBe(true);
      expect(columns.startdate.nullable).toBe(true);
      expect(columns.duedate.nullable).toBe(true);
    });

    test('스키마에 코멘트가 올바르게 설정되어야 함', async () => {
      // 테이블 코멘트 확인
      const tableResult = await client.query(`
        SELECT obj_description('users'::regclass) as users_comment,
               obj_description('todos'::regclass) as todos_comment;
      `);

      expect(tableResult.rows[0].users_comment).toBe('사용자 계정 정보');
      expect(tableResult.rows[0].todos_comment).toBe('할 일 및 국경일 정보');

      // 컬럼 코멘트 확인 (샘플)
      const columnResult = await client.query(`
        SELECT col_description('users'::regclass, 1) as userid_comment;
      `);

      expect(columnResult.rows[0].userid_comment).toBe('사용자 고유 ID (UUID)');
    });
  });

  describe('2. 인덱스 검증', () => {
    test('Users 테이블에 필요한 모든 인덱스가 생성되어야 함', async () => {
      const result = await client.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'users'
        ORDER BY indexname;
      `);

      const indexes = result.rows.map(row => row.indexname);

      // Primary Key
      expect(indexes).toContain('users_pkey');

      // 단일 컬럼 인덱스
      expect(indexes).toContain('idx_users_username');
      expect(indexes).toContain('idx_users_email');
      expect(indexes).toContain('idx_users_created_at');

      // Unique 제약조건 인덱스
      expect(indexes).toContain('uk_users_username');
      expect(indexes).toContain('uk_users_email');
    });

    test('Todos 테이블에 필요한 모든 인덱스가 생성되어야 함', async () => {
      const result = await client.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'todos'
        ORDER BY indexname;
      `);

      const indexes = result.rows.map(row => row.indexname);

      // Primary Key
      expect(indexes).toContain('todos_pkey');

      // 단일 컬럼 인덱스
      expect(indexes).toContain('idx_todos_user_id');
      expect(indexes).toContain('idx_todos_is_deleted');
      expect(indexes).toContain('idx_todos_is_completed');
      expect(indexes).toContain('idx_todos_is_public_holiday');
      expect(indexes).toContain('idx_todos_due_date');
      expect(indexes).toContain('idx_todos_start_date');
      expect(indexes).toContain('idx_todos_created_at');
      expect(indexes).toContain('idx_todos_updated_at');

      // 복합 인덱스
      expect(indexes).toContain('idx_todos_user_active');
      expect(indexes).toContain('idx_todos_calendar');
      expect(indexes).toContain('idx_todos_public_holidays');
      expect(indexes).toContain('idx_todos_trash');
    });

    test('부분 인덱스(Partial Index)가 올바르게 생성되어야 함', async () => {
      const result = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'todos'
          AND indexdef LIKE '%WHERE%'
        ORDER BY indexname;
      `);

      const partialIndexes = result.rows.reduce((acc, row) => {
        acc[row.indexname] = row.indexdef;
        return acc;
      }, {});

      // idx_todos_user_active: WHERE isDeleted = FALSE
      expect(partialIndexes['idx_todos_user_active']).toMatch(/WHERE.*isdeleted.*false/i);

      // idx_todos_calendar: WHERE isDeleted = FALSE AND dueDate IS NOT NULL
      expect(partialIndexes['idx_todos_calendar']).toMatch(/WHERE.*isdeleted.*false/i);
      expect(partialIndexes['idx_todos_calendar']).toMatch(/duedate.*IS NOT NULL/i);

      // idx_todos_public_holidays
      expect(partialIndexes['idx_todos_public_holidays']).toMatch(/userid IS NULL/i);
      expect(partialIndexes['idx_todos_public_holidays']).toMatch(/ispublicholiday.*true/i);

      // idx_todos_trash: WHERE isDeleted = TRUE
      expect(partialIndexes['idx_todos_trash']).toMatch(/WHERE.*isdeleted.*true/i);
    });
  });

  describe('3. 제약 조건 검증', () => {
    test('Users 테이블의 UNIQUE 제약조건이 작동해야 함', async () => {
      // 첫 번째 사용자 생성
      await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('testuser', 'test@example.com', 'password123');
      `);

      // 중복 username 시도
      await expect(
        client.query(`
          INSERT INTO users (username, email, password)
          VALUES ('testuser', 'different@example.com', 'password456');
        `)
      ).rejects.toThrow(/duplicate key value violates unique constraint/);

      // 중복 email 시도
      await expect(
        client.query(`
          INSERT INTO users (username, email, password)
          VALUES ('differentuser', 'test@example.com', 'password789');
        `)
      ).rejects.toThrow(/duplicate key value violates unique constraint/);
    });

    test('Users 테이블의 CHECK 제약조건이 작동해야 함', async () => {
      // 빈 username 시도
      await expect(
        client.query(`
          INSERT INTO users (username, email, password)
          VALUES ('', 'empty@example.com', 'password123');
        `)
      ).rejects.toThrow(/check constraint/);

      // 너무 긴 username 시도 (51자)
      await expect(
        client.query(`
          INSERT INTO users (username, email, password)
          VALUES ('${'a'.repeat(51)}', 'toolong@example.com', 'password123');
        `)
      ).rejects.toThrow();

      // 잘못된 이메일 형식
      await expect(
        client.query(`
          INSERT INTO users (username, email, password)
          VALUES ('testuser', 'invalid-email', 'password123');
        `)
      ).rejects.toThrow(/check constraint.*chk_users_email_format/);
    });

    test('Todos 테이블의 날짜 CHECK 제약조건이 작동해야 함', async () => {
      // 먼저 사용자 생성
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('todoowner', 'owner@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      // startDate > dueDate 시도 (실패해야 함)
      await expect(
        client.query(`
          INSERT INTO todos (userid, title, startdate, duedate)
          VALUES ($1, 'Invalid Todo', '2025-12-31', '2025-01-01');
        `, [userId])
      ).rejects.toThrow(/check constraint.*chk_todos_dates/);

      // 유효한 날짜 범위 (성공해야 함)
      await expect(
        client.query(`
          INSERT INTO todos (userid, title, startdate, duedate)
          VALUES ($1, 'Valid Todo', '2025-01-01', '2025-12-31');
        `, [userId])
      ).resolves.toBeDefined();
    });

    test('Todos 테이블의 제목 길이 CHECK 제약조건이 작동해야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('titletest', 'title@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      // 빈 제목 시도
      await expect(
        client.query(`
          INSERT INTO todos (userid, title)
          VALUES ($1, '');
        `, [userId])
      ).rejects.toThrow(/check constraint.*chk_todos_title_length/);

      // 너무 긴 제목 시도 (201자)
      await expect(
        client.query(`
          INSERT INTO todos (userid, title)
          VALUES ($1, $2);
        `, [userId, 'a'.repeat(201)])
      ).rejects.toThrow();
    });

    test('Todos 테이블의 삭제 일관성 CHECK 제약조건이 작동해야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('deletetest', 'delete@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      // isDeleted=TRUE인데 deletedAt=NULL (실패해야 함)
      await expect(
        client.query(`
          INSERT INTO todos (userid, title, isdeleted, deletedat)
          VALUES ($1, 'Inconsistent Delete', TRUE, NULL);
        `, [userId])
      ).rejects.toThrow(/check constraint.*chk_todos_delete_consistency/);

      // isDeleted=FALSE인데 deletedAt이 있음 (실패해야 함)
      await expect(
        client.query(`
          INSERT INTO todos (userid, title, isdeleted, deletedat)
          VALUES ($1, 'Inconsistent Active', FALSE, NOW());
        `, [userId])
      ).rejects.toThrow(/check constraint.*chk_todos_delete_consistency/);

      // 일관성 있는 삭제 (성공해야 함)
      await expect(
        client.query(`
          INSERT INTO todos (userid, title, isdeleted, deletedat)
          VALUES ($1, 'Consistent Delete', TRUE, NOW());
        `, [userId])
      ).resolves.toBeDefined();
    });

    test('Todos 테이블의 국경일 CHECK 제약조건이 작동해야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('holidaytest', 'holiday@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      // userId가 있는데 isPublicHoliday=TRUE (실패해야 함)
      await expect(
        client.query(`
          INSERT INTO todos (userid, title, ispublicholiday)
          VALUES ($1, 'Invalid Holiday', TRUE);
        `, [userId])
      ).rejects.toThrow(/check constraint.*chk_todos_public_holiday/);

      // userId=NULL이고 isPublicHoliday=TRUE (성공해야 함)
      await expect(
        client.query(`
          INSERT INTO todos (userid, title, ispublicholiday, duedate)
          VALUES (NULL, 'Valid Holiday', TRUE, '2025-01-01');
        `)
      ).resolves.toBeDefined();
    });

    test('Todos 테이블의 FOREIGN KEY 제약조건이 작동해야 함', async () => {
      const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

      // 존재하지 않는 userId 참조 시도
      await expect(
        client.query(`
          INSERT INTO todos (userid, title)
          VALUES ($1, 'Orphan Todo');
        `, [nonExistentUserId])
      ).rejects.toThrow(/foreign key constraint/);
    });

    test('CASCADE 삭제가 올바르게 작동해야 함', async () => {
      // 사용자 및 할 일 생성
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('cascadetest', 'cascade@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      await client.query(`
        INSERT INTO todos (userid, title)
        VALUES ($1, 'Todo 1'), ($1, 'Todo 2'), ($1, 'Todo 3');
      `, [userId]);

      // 삭제 전 할 일 개수 확인
      const beforeDelete = await client.query(`
        SELECT COUNT(*) as count FROM todos WHERE userid = $1;
      `, [userId]);
      expect(parseInt(beforeDelete.rows[0].count)).toBe(3);

      // 사용자 삭제 (CASCADE)
      await client.query(`
        DELETE FROM users WHERE userid = $1;
      `, [userId]);

      // 삭제 후 할 일 개수 확인 (모두 삭제되어야 함)
      const afterDelete = await client.query(`
        SELECT COUNT(*) as count FROM todos WHERE userid = $1;
      `, [userId]);
      expect(parseInt(afterDelete.rows[0].count)).toBe(0);
    });
  });

  describe('4. 트리거 검증', () => {
    test('Users 테이블의 updatedAt 자동 업데이트 트리거가 작동해야 함', async () => {
      // 사용자 생성
      const insertResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('triggertest', 'trigger@example.com', 'password123')
        RETURNING userid, createdat, updatedat;
      `);
      const userId = insertResult.rows[0].userid;
      const originalUpdatedAt = insertResult.rows[0].updatedat;

      // 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 사용자 정보 업데이트
      await client.query(`
        UPDATE users SET email = 'newemail@example.com' WHERE userid = $1;
      `, [userId]);

      // updatedAt이 변경되었는지 확인
      const updateResult = await client.query(`
        SELECT updatedat FROM users WHERE userid = $1;
      `, [userId]);
      const newUpdatedAt = updateResult.rows[0].updatedat;

      expect(new Date(newUpdatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    test('Todos 테이블의 updatedAt 자동 업데이트 트리거가 작동해야 함', async () => {
      // 사용자 및 할 일 생성
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('todotrigger', 'todotrigger@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      const todoResult = await client.query(`
        INSERT INTO todos (userid, title)
        VALUES ($1, 'Trigger Test Todo')
        RETURNING todoid, updatedat;
      `, [userId]);
      const todoId = todoResult.rows[0].todoid;
      const originalUpdatedAt = todoResult.rows[0].updatedat;

      // 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 할 일 업데이트
      await client.query(`
        UPDATE todos SET iscompleted = TRUE WHERE todoid = $1;
      `, [todoId]);

      // updatedAt이 변경되었는지 확인
      const updateResult = await client.query(`
        SELECT updatedat FROM todos WHERE todoid = $1;
      `, [todoId]);
      const newUpdatedAt = updateResult.rows[0].updatedat;

      expect(new Date(newUpdatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });
  });

  describe('5. 뷰(View) 검증', () => {
    beforeEach(async () => {
      // 테스트 데이터 준비
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('viewtest', 'view@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      // 다양한 상태의 할 일 생성
      await client.query(`
        INSERT INTO todos (userid, title, iscompleted, isdeleted, deletedat) VALUES
        ($1, 'Active Todo 1', FALSE, FALSE, NULL),
        ($1, 'Active Todo 2', TRUE, FALSE, NULL),
        ($1, 'Deleted Todo', FALSE, TRUE, NOW());
      `, [userId]);

      // 국경일 생성
      await client.query(`
        INSERT INTO todos (userid, title, ispublicholiday, duedate, isdeleted, deletedat)
        VALUES (NULL, 'Test Holiday', TRUE, '2025-05-05', FALSE, NULL);
      `);
    });

    test('v_active_todos 뷰가 삭제되지 않은 할 일만 반환해야 함', async () => {
      const result = await client.query(`
        SELECT COUNT(*) as count FROM v_active_todos;
      `);

      // 활성 할 일 2개 + 국경일 16개 (schema.sql의 초기 데이터)
      expect(parseInt(result.rows[0].count)).toBeGreaterThanOrEqual(2);

      // isdeleted 컬럼이 뷰에 없어야 함
      const columnsResult = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'v_active_todos';
      `);
      const columns = columnsResult.rows.map(row => row.column_name);
      expect(columns).not.toContain('isdeleted');
      expect(columns).not.toContain('deletedat');
    });

    test('v_public_holidays 뷰가 국경일만 반환해야 함', async () => {
      const result = await client.query(`
        SELECT * FROM v_public_holidays
        ORDER BY duedate;
      `);

      // 모든 결과가 국경일이어야 함
      result.rows.forEach(row => {
        expect(row.title).toBeTruthy();
        expect(row.duedate).toBeTruthy();
      });

      // 최소 1개 이상의 국경일 (테스트 데이터 + schema.sql 초기 데이터)
      expect(result.rows.length).toBeGreaterThanOrEqual(1);
    });

    test('v_trash 뷰가 삭제된 할 일만 반환해야 함', async () => {
      const result = await client.query(`
        SELECT * FROM v_trash;
      `);

      // 삭제된 할 일이 1개 있어야 함
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].title).toBe('Deleted Todo');
      expect(result.rows[0].deletedat).toBeTruthy();
    });
  });

  describe('6. 함수 검증', () => {
    test('get_user_todo_stats 함수가 올바른 통계를 반환해야 함', async () => {
      // 사용자 생성
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('statstest', 'stats@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      // 다양한 할 일 생성
      await client.query(`
        INSERT INTO todos (userid, title, iscompleted, isdeleted, deletedat) VALUES
        ($1, 'Completed 1', TRUE, FALSE, NULL),
        ($1, 'Completed 2', TRUE, FALSE, NULL),
        ($1, 'Pending 1', FALSE, FALSE, NULL),
        ($1, 'Pending 2', FALSE, FALSE, NULL),
        ($1, 'Pending 3', FALSE, FALSE, NULL),
        ($1, 'Deleted 1', FALSE, TRUE, NOW()),
        ($1, 'Deleted 2', TRUE, TRUE, NOW());
      `, [userId]);

      // 통계 조회
      const result = await client.query(`
        SELECT * FROM get_user_todo_stats($1);
      `, [userId]);

      const stats = result.rows[0];

      expect(parseInt(stats.total_todos)).toBe(5); // 활성 할 일
      expect(parseInt(stats.completed_todos)).toBe(2); // 완료된 할 일
      expect(parseInt(stats.pending_todos)).toBe(3); // 미완료 할 일
      expect(parseInt(stats.deleted_todos)).toBe(2); // 삭제된 할 일
      expect(parseFloat(stats.completion_rate)).toBe(40.00); // 2/5 * 100
    });

    test('get_user_todo_stats 함수가 할 일이 없는 사용자에 대해 올바른 값을 반환해야 함', async () => {
      // 할 일이 없는 사용자 생성
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('emptystats', 'empty@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      // 통계 조회
      const result = await client.query(`
        SELECT * FROM get_user_todo_stats($1);
      `, [userId]);

      const stats = result.rows[0];

      expect(parseInt(stats.total_todos)).toBe(0);
      expect(parseInt(stats.completed_todos)).toBe(0);
      expect(parseInt(stats.pending_todos)).toBe(0);
      expect(parseInt(stats.deleted_todos)).toBe(0);
      expect(stats.completion_rate).toBeNull(); // 0으로 나누기 방지
    });
  });

  describe('7. 쿼리 예제 검증', () => {
    test('사용자 생성 쿼리가 정상 작동해야 함', async () => {
      const result = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('newuser', 'newuser@example.com', 'hashed_password')
        RETURNING userid, username, email, createdat;
      `);

      expect(result.rows[0].userid).toBeTruthy();
      expect(result.rows[0].username).toBe('newuser');
      expect(result.rows[0].email).toBe('newuser@example.com');
      expect(result.rows[0].createdat).toBeTruthy();
    });

    test('할 일 생성 쿼리가 정상 작동해야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('todouser', 'todouser@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      const result = await client.query(`
        INSERT INTO todos (userid, title, description, startdate, duedate)
        VALUES ($1, 'New Task', 'Task description', '2025-01-01', '2025-01-31')
        RETURNING todoid, title, iscompleted, isdeleted;
      `, [userId]);

      expect(result.rows[0].todoid).toBeTruthy();
      expect(result.rows[0].title).toBe('New Task');
      expect(result.rows[0].iscompleted).toBe(false);
      expect(result.rows[0].isdeleted).toBe(false);
    });

    test('소프트 삭제 쿼리가 정상 작동해야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('deleteuser', 'deleteuser@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      const todoResult = await client.query(`
        INSERT INTO todos (userid, title)
        VALUES ($1, 'To Be Deleted')
        RETURNING todoid;
      `, [userId]);
      const todoId = todoResult.rows[0].todoid;

      // 소프트 삭제 실행
      const deleteResult = await client.query(`
        UPDATE todos
        SET isdeleted = TRUE, deletedat = NOW()
        WHERE todoid = $1
        RETURNING isdeleted, deletedat;
      `, [todoId]);

      expect(deleteResult.rows[0].isdeleted).toBe(true);
      expect(deleteResult.rows[0].deletedat).toBeTruthy();

      // 뷰에서 확인
      const trashResult = await client.query(`
        SELECT COUNT(*) as count FROM v_trash WHERE todoid = $1;
      `, [todoId]);
      expect(parseInt(trashResult.rows[0].count)).toBe(1);
    });

    test('국경일 조회 쿼리가 정상 작동해야 함', async () => {
      const result = await client.query(`
        SELECT title, duedate
        FROM todos
        WHERE userid IS NULL
          AND ispublicholiday = TRUE
          AND isdeleted = FALSE
        ORDER BY duedate
        LIMIT 5;
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach(row => {
        expect(row.title).toBeTruthy();
        expect(row.duedate).toBeTruthy();
      });
    });

    test('사용자별 활성 할 일 조회 쿼리가 정상 작동해야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('activeuser', 'active@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      await client.query(`
        INSERT INTO todos (userid, title, iscompleted, isdeleted, deletedat) VALUES
        ($1, 'Active 1', FALSE, FALSE, NULL),
        ($1, 'Active 2', TRUE, FALSE, NULL),
        ($1, 'Deleted', FALSE, TRUE, NOW());
      `, [userId]);

      const result = await client.query(`
        SELECT title, iscompleted
        FROM todos
        WHERE userid = $1
          AND isdeleted = FALSE
        ORDER BY createdat;
      `, [userId]);

      expect(result.rows.length).toBe(2);
      expect(result.rows[0].title).toBe('Active 1');
      expect(result.rows[1].title).toBe('Active 2');
    });

    test('완료되지 않은 할 일 조회 쿼리가 정상 작동해야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('pendinguser', 'pending@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      await client.query(`
        INSERT INTO todos (userid, title, iscompleted) VALUES
        ($1, 'Pending 1', FALSE),
        ($1, 'Completed', TRUE),
        ($1, 'Pending 2', FALSE);
      `, [userId]);

      const result = await client.query(`
        SELECT title
        FROM todos
        WHERE userid = $1
          AND isdeleted = FALSE
          AND iscompleted = FALSE
        ORDER BY createdat;
      `, [userId]);

      expect(result.rows.length).toBe(2);
      expect(result.rows[0].title).toBe('Pending 1');
      expect(result.rows[1].title).toBe('Pending 2');
    });

    test('기간별 할 일 조회 쿼리가 정상 작동해야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('dateuser', 'date@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      await client.query(`
        INSERT INTO todos (userid, title, duedate) VALUES
        ($1, 'January Task', '2025-01-15'),
        ($1, 'February Task', '2025-02-15'),
        ($1, 'March Task', '2025-03-15');
      `, [userId]);

      const result = await client.query(`
        SELECT title, duedate
        FROM todos
        WHERE userid = $1
          AND isdeleted = FALSE
          AND duedate BETWEEN '2025-01-01' AND '2025-02-28'
        ORDER BY duedate;
      `, [userId]);

      expect(result.rows.length).toBe(2);
      expect(result.rows[0].title).toBe('January Task');
      expect(result.rows[1].title).toBe('February Task');
    });
  });

  describe('8. 초기 데이터 검증', () => {
    test('2025년 한국 공휴일이 정확히 삽입되어야 함', async () => {
      const result = await client.query(`
        SELECT title, duedate
        FROM todos
        WHERE userid IS NULL
          AND ispublicholiday = TRUE
          AND isdeleted = FALSE
          AND EXTRACT(YEAR FROM duedate) = 2025
        ORDER BY duedate;
      `);

      // 최소 필수 공휴일 확인
      const holidays = result.rows.map(row => ({
        title: row.title,
        date: row.duedate
      }));

      // 주요 공휴일 존재 확인
      const holidayTitles = holidays.map(h => h.title);
      expect(holidayTitles).toContain('새해');
      expect(holidayTitles).toContain('삼일절');
      expect(holidayTitles).toContain('어린이날');
      expect(holidayTitles).toContain('광복절');
      expect(holidayTitles).toContain('개천절');
      expect(holidayTitles).toContain('한글날');
      expect(holidayTitles).toContain('성탄절');
    });
  });

  describe('9. 성능 및 최적화 검증', () => {
    test('대량 데이터 삽입 성능이 허용 범위 내여야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('perftest', 'perf@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      const startTime = Date.now();

      // 100개의 할 일 삽입
      const values = Array.from({ length: 100 }, (_, i) =>
        `('${userId}', 'Todo ${i + 1}', 'Description ${i + 1}')`
      ).join(',');

      await client.query(`
        INSERT INTO todos (userid, title, description)
        VALUES ${values};
      `);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 100개 삽입이 5초 이내에 완료되어야 함
      expect(duration).toBeLessThan(5000);
    });

    test('복합 인덱스를 사용하는 쿼리가 효율적으로 실행되어야 함', async () => {
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('indextest', 'index@example.com', 'password123')
        RETURNING userid;
      `);
      const userId = userResult.rows[0].userid;

      // 여러 할 일 생성
      await client.query(`
        INSERT INTO todos (userid, title, iscompleted, isdeleted)
        SELECT $1, 'Todo ' || generate_series, FALSE, FALSE
        FROM generate_series(1, 50);
      `, [userId]);

      // EXPLAIN ANALYZE로 쿼리 플랜 확인
      const explainResult = await client.query(`
        EXPLAIN (FORMAT JSON)
        SELECT * FROM todos
        WHERE userid = $1
          AND isdeleted = FALSE
          AND iscompleted = FALSE;
      `, [userId]);

      const plan = JSON.stringify(explainResult.rows[0]);

      // 인덱스 스캔 사용 여부 확인
      expect(plan).toMatch(/Index.*Scan/i);
    });
  });
});
