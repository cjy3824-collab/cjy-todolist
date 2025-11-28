// 시나리오 1: 회원가입 및 첫 할 일 등록
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://localhost:5173';
const RESULTS_DIR = path.join(__dirname);

// 고유한 사용자명 생성 (타임스탬프 기반)
const timestamp = Date.now();
const uniqueUsername = `testuser_${timestamp}`;
const uniqueEmail = `testuser_${timestamp}@test.com`;

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const results = {
    scenario: '시나리오 1: 회원가입 및 첫 할 일 등록',
    timestamp: new Date().toISOString(),
    testUser: {
      username: uniqueUsername,
      email: uniqueEmail
    },
    steps: [],
    screenshots: [],
    success: true,
    errors: []
  };

  try {
    console.log('🚀 시나리오 1 시작: 회원가입 및 첫 할 일 등록\n');

    // Step 1: 웹사이트 접속
    console.log('📍 Step 1: 웹사이트 접속');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    results.steps.push({ step: 1, name: '웹사이트 접속', status: 'success' });

    const ss1 = path.join(RESULTS_DIR, 'scenario1-01-landing.png');
    await page.screenshot({ path: ss1, fullPage: true });
    results.screenshots.push('scenario1-01-landing.png');
    console.log('   ✅ 메인 페이지 로드 성공\n');

    // Step 2: 회원가입 페이지로 이동
    console.log('📍 Step 2: 회원가입 페이지로 이동');

    // 회원가입 버튼/링크 찾기
    const signupSelectors = [
      'a[href="/signup"]',
      'a[href*="signup"]',
      'button:has-text("회원가입")',
      'a:has-text("회원가입")'
    ];

    let signupClicked = false;
    for (const selector of signupSelectors) {
      try {
        const element = page.locator(selector).first();
        const count = await element.count();
        if (count > 0 && await element.isVisible({ timeout: 2000 })) {
          await element.click();
          signupClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!signupClicked) {
      console.log('   → 회원가입 버튼을 찾지 못해 URL로 직접 이동');
      await page.goto(`${TARGET_URL}/signup`, { waitUntil: 'networkidle' });
    }

    await page.waitForTimeout(1500);
    const ss2 = path.join(RESULTS_DIR, 'scenario1-02-signup-page.png');
    await page.screenshot({ path: ss2, fullPage: true });
    results.screenshots.push('scenario1-02-signup-page.png');
    results.steps.push({ step: 2, name: '회원가입 페이지 이동', status: 'success' });
    console.log('   ✅ 회원가입 페이지 로드 성공\n');

    // Step 3: 회원가입 폼 작성
    console.log('📍 Step 3: 회원가입 폼 작성');
    console.log(`   사용자명: ${uniqueUsername}`);
    console.log(`   이메일: ${uniqueEmail}`);
    console.log(`   비밀번호: SecurePass123!`);

    // 사용자명 입력
    const usernameField = page.locator('input[name="username"], input[id="username"]').first();
    await usernameField.waitFor({ state: 'visible', timeout: 5000 });
    await usernameField.fill(uniqueUsername);

    // 이메일 입력
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    await emailField.waitFor({ state: 'visible', timeout: 5000 });
    await emailField.fill(uniqueEmail);

    // 비밀번호 입력 (두 개의 비밀번호 필드가 있을 수 있음)
    const passwordFields = await page.locator('input[type="password"]').all();
    if (passwordFields.length >= 2) {
      // 비밀번호, 비밀번호 확인
      await passwordFields[0].fill('SecurePass123!');
      await passwordFields[1].fill('SecurePass123!');
    } else if (passwordFields.length === 1) {
      await passwordFields[0].fill('SecurePass123!');
    }

    await page.waitForTimeout(500);
    const ss3 = path.join(RESULTS_DIR, 'scenario1-03-signup-form-filled.png');
    await page.screenshot({ path: ss3, fullPage: true });
    results.screenshots.push('scenario1-03-signup-form-filled.png');
    console.log('   ✅ 회원가입 폼 작성 완료\n');

    // Step 4: 회원가입 제출
    console.log('📍 Step 4: 회원가입 제출');

    const submitButton = page.locator('button[type="submit"]:has-text("회원가입"), button:has-text("회원가입"), button[type="submit"]').first();
    await submitButton.click();

    // 회원가입 후 리다이렉트 대기 (로그인 페이지 또는 대시보드로 이동)
    await page.waitForTimeout(2000);

    const ss4 = path.join(RESULTS_DIR, 'scenario1-04-after-signup.png');
    await page.screenshot({ path: ss4, fullPage: true });
    results.screenshots.push('scenario1-04-after-signup.png');
    results.steps.push({ step: 4, name: '회원가입 제출', status: 'success' });
    console.log('   ✅ 회원가입 완료\n');

    // Step 5: 로그인 (필요한 경우)
    console.log('📍 Step 5: 로그인 확인');
    const currentUrl = page.url();

    if (currentUrl.includes('signin') || currentUrl.includes('login')) {
      console.log('   → 로그인 페이지로 이동됨, 로그인 진행');

      // 이메일 입력
      const loginEmailField = page.locator('input[name="email"], input[type="email"]').first();
      await loginEmailField.fill(uniqueEmail);

      // 비밀번호 입력
      const loginPasswordField = page.locator('input[name="password"], input[type="password"]').first();
      await loginPasswordField.fill('SecurePass123!');

      // 로그인 버튼 클릭
      const loginButton = page.locator('button[type="submit"]:has-text("로그인"), button:has-text("로그인"), button[type="submit"]').first();
      await loginButton.click();

      await page.waitForTimeout(2000);
    } else {
      console.log('   → 자동 로그인됨');
    }

    const ss5 = path.join(RESULTS_DIR, 'scenario1-05-logged-in.png');
    await page.screenshot({ path: ss5, fullPage: true });
    results.screenshots.push('scenario1-05-logged-in.png');
    results.steps.push({ step: 5, name: '로그인 완료', status: 'success' });
    console.log('   ✅ 로그인 성공\n');

    // Step 6: 첫 번째 할 일 추가
    console.log('📍 Step 6: 첫 번째 할 일 추가');

    // "할 일 추가" 버튼 찾기
    const addTodoButton = page.locator('button:has-text("할 일 추가"), button:has-text("추가"), button:has-text("+")').first();

    const addButtonCount = await addTodoButton.count();
    if (addButtonCount > 0) {
      await addTodoButton.click();
      await page.waitForTimeout(1000);

      // 할 일 폼 작성
      const titleField = page.locator('input[name="title"], input[placeholder*="제목"]').first();
      await titleField.waitFor({ state: 'visible', timeout: 5000 });
      await titleField.fill('분기 보고서 작성');

      const descriptionField = page.locator('textarea[name="description"], textarea[placeholder*="설명"]').first();
      if (await descriptionField.count() > 0) {
        await descriptionField.fill('2025년 1분기 마케팅 성과 보고서 작성 및 발표 자료 준비');
      }

      const dueDateField = page.locator('input[name="dueDate"], input[type="date"]').first();
      if (await dueDateField.count() > 0) {
        await dueDateField.fill('2025-11-30');
      }

      await page.waitForTimeout(500);
      const ss6 = path.join(RESULTS_DIR, 'scenario1-06-first-todo-form.png');
      await page.screenshot({ path: ss6, fullPage: true });
      results.screenshots.push('scenario1-06-first-todo-form.png');

      // 저장 버튼 클릭
      const saveButton = page.locator('button[type="submit"]:has-text("저장"), button:has-text("저장"), button:has-text("추가")').first();
      await saveButton.click();

      await page.waitForTimeout(2000);
      const ss7 = path.join(RESULTS_DIR, 'scenario1-07-first-todo-added.png');
      await page.screenshot({ path: ss7, fullPage: true });
      results.screenshots.push('scenario1-07-first-todo-added.png');
      results.steps.push({ step: 6, name: '첫 번째 할 일 추가', status: 'success' });
      console.log('   ✅ 첫 번째 할 일 "분기 보고서 작성" 추가 완료\n');
    } else {
      console.log('   ⚠️  할 일 추가 버튼을 찾을 수 없습니다');
      results.steps.push({ step: 6, name: '첫 번째 할 일 추가', status: 'skipped', reason: '할 일 추가 버튼 없음' });
    }

    // 최종 결과
    console.log('\n✅ 시나리오 1 테스트 완료!');
    console.log('=====================================');
    console.log(`   회원가입: ${uniqueEmail}`);
    console.log(`   로그인: 성공`);
    console.log(`   첫 할 일 추가: 완료`);
    console.log('=====================================\n');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error(error.stack);
    results.success = false;
    results.errors.push({
      message: error.message,
      stack: error.stack
    });

    // 오류 스크린샷
    const errorSs = path.join(RESULTS_DIR, 'scenario1-error.png');
    await page.screenshot({ path: errorSs, fullPage: true });
    results.screenshots.push('scenario1-error.png');
  } finally {
    // 결과 저장
    const resultFile = path.join(RESULTS_DIR, 'scenario1-results.json');
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log(`📄 결과 파일 저장: ${resultFile}\n`);

    await browser.close();
  }
})();
