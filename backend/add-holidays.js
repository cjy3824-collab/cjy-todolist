// 국경일 데이터를 데이터베이스에 추가하는 스크립트
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2025년 한국 공휴일 데이터
const holidays = [
  { title: '새해', description: '새해 첫날', dueDate: '2025-01-01' },
  { title: '설날', description: '음력 1월 1일', dueDate: '2025-01-28' },
  { title: '설날 연휴', description: '설날 다음날', dueDate: '2025-01-29' },
  { title: '설날 연휴', description: '설날 다다음날', dueDate: '2025-01-30' },
  { title: '삼일절', description: '3.1 독립운동 기념일', dueDate: '2025-03-01' },
  { title: '어린이날', description: '어린이날', dueDate: '2025-05-05' },
  { title: '부처님 오신 날', description: '석가탄신일', dueDate: '2025-05-05' },
  { title: '현충일', description: '나라를 위해 목숨을 바치신 분들을 기리는 날', dueDate: '2025-06-06' },
  { title: '광복절', description: '광복 기념일', dueDate: '2025-08-15' },
  { title: '개천절', description: '대한민국 건국 기념일', dueDate: '2025-10-03' },
  { title: '추석 연휴', description: '추석 전날', dueDate: '2025-10-05' },
  { title: '추석', description: '음력 8월 15일', dueDate: '2025-10-06' },
  { title: '추석 연휴', description: '추석 다음날', dueDate: '2025-10-07' },
  { title: '한글날', description: '한글 창제 기념일', dueDate: '2025-10-09' },
  { title: '성탄절', description: '크리스마스', dueDate: '2025-12-25' },
];

async function addHolidays() {
  const client = await pool.connect();

  try {
    console.log('🏛️  국경일 데이터 추가를 시작합니다...\n');

    // 기존 국경일 삭제 (중복 방지)
    console.log('기존 국경일 데이터 삭제 중...');
    const deleteResult = await client.query(
      'DELETE FROM todos WHERE ispublicholiday = true AND userid IS NULL'
    );
    console.log(`✓ ${deleteResult.rowCount}개의 기존 국경일 데이터 삭제 완료\n`);

    // 새 국경일 추가
    console.log('새 국경일 데이터 추가 중...');
    let addedCount = 0;

    for (const holiday of holidays) {
      const query = `
        INSERT INTO todos (userid, title, description, duedate, ispublicholiday, iscompleted, isdeleted)
        VALUES (NULL, $1, $2, $3, true, false, false)
        RETURNING todoid, title, duedate
      `;

      const result = await client.query(query, [
        holiday.title,
        holiday.description,
        holiday.dueDate,
      ]);

      const inserted = result.rows[0];
      console.log(`  ✓ ${inserted.title} (${inserted.duedate})`);
      addedCount++;
    }

    console.log(`\n✅ 총 ${addedCount}개의 국경일 데이터가 추가되었습니다!`);

    // 추가된 국경일 확인
    console.log('\n📋 추가된 국경일 목록:');
    const checkResult = await client.query(
      `SELECT title, duedate, description
       FROM todos
       WHERE ispublicholiday = true AND userid IS NULL
       ORDER BY duedate`
    );

    checkResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.title} - ${row.duedate} (${row.description})`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 스크립트 실행
addHolidays()
  .then(() => {
    console.log('\n✅ 국경일 데이터 추가 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 국경일 데이터 추가 실패:', error.message);
    process.exit(1);
  });
