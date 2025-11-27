/**
 * Jest 전역 설정 파일
 * 모든 테스트 전에 실행됩니다.
 */

// 테스트 타임아웃 설정
jest.setTimeout(10000);

// 전역 beforeAll
beforeAll(() => {
  // 테스트 환경 설정
  process.env.NODE_ENV = 'test';
});

// 전역 afterAll
afterAll(() => {
  // 정리 작업
});
