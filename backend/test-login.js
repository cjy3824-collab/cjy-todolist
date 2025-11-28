// 로그인 테스트 스크립트
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testLogin() {
  const client = await pool.connect();

  try {
    const email = 'test@example.com';
    const password = 'Test1234!';

    // 1. 기존 사용자 삭제
    await client.query('DELETE FROM users WHERE email = $1', [email]);
    console.log('기존 사용자 삭제 완료');

    // 2. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('해싱된 비밀번호:', hashedPassword);

    // 3. 사용자 생성
    const insertQuery = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING userid, username, email
    `;
    const result = await client.query(insertQuery, ['testuser', email, hashedPassword]);
    console.log('사용자 생성 완료:', result.rows[0]);

    // 4. 로그인 시뮬레이션 - DB에서 사용자 조회
    const selectQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await client.query(selectQuery, [email]);
    const user = userResult.rows[0];
    console.log('\n조회된 사용자:', { userid: user.userid, username: user.username, email: user.email });

    // 5. 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('비밀번호 검증 결과:', isPasswordValid);

    if (isPasswordValid) {
      console.log('\n✅ 로그인 성공!');
      console.log('테스트 계정:');
      console.log('  이메일:', email);
      console.log('  비밀번호:', password);
    } else {
      console.log('\n❌ 로그인 실패');
    }

  } catch (error) {
    console.error('테스트 실패:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testLogin();
