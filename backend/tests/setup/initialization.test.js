/**
 * 백엔드 프로젝트 초기화 검증 테스트
 *
 * 목적: 백엔드 프로젝트가 올바르게 초기화되었는지 검증
 * 범위:
 * - 필수 파일 존재 검증
 * - package.json 구조 및 의존성 검증
 * - npm scripts 검증
 * - .gitignore 설정 검증
 * - .env.example 환경 변수 검증
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../');

describe('백엔드 프로젝트 초기화 검증', () => {
  describe('1. 필수 파일 존재 검증', () => {
    test('backend 디렉토리가 존재해야 함', () => {
      expect(fs.existsSync(backendRoot)).toBe(true);
      const stats = fs.statSync(backendRoot);
      expect(stats.isDirectory()).toBe(true);
    });

    test('package.json 파일이 존재해야 함', () => {
      const packageJsonPath = path.join(backendRoot, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      const stats = fs.statSync(packageJsonPath);
      expect(stats.isFile()).toBe(true);
    });

    test('.gitignore 파일이 존재해야 함', () => {
      const gitignorePath = path.join(backendRoot, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
      const stats = fs.statSync(gitignorePath);
      expect(stats.isFile()).toBe(true);
    });

    test('.env.example 파일이 존재해야 함', () => {
      const envExamplePath = path.join(backendRoot, '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);
      const stats = fs.statSync(envExamplePath);
      expect(stats.isFile()).toBe(true);
    });

    test('src 디렉토리가 존재해야 함', () => {
      const srcPath = path.join(backendRoot, 'src');
      expect(fs.existsSync(srcPath)).toBe(true);
      const stats = fs.statSync(srcPath);
      expect(stats.isDirectory()).toBe(true);
    });

    test('tests 디렉토리가 존재해야 함', () => {
      const testsPath = path.join(backendRoot, 'tests');
      expect(fs.existsSync(testsPath)).toBe(true);
      const stats = fs.statSync(testsPath);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('2. package.json 구조 검증', () => {
    let packageJson;

    beforeAll(() => {
      const packageJsonPath = path.join(backendRoot, 'package.json');
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(content);
    });

    test('기본 메타데이터가 정의되어야 함', () => {
      expect(packageJson).toHaveProperty('name');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('description');
      expect(packageJson).toHaveProperty('main');

      expect(packageJson.name).toBe('cjy-todolist-backend');
      expect(packageJson.version).toBeTruthy();
      expect(packageJson.main).toBeTruthy();
    });

    test('ES 모듈 타입이 설정되어야 함', () => {
      expect(packageJson).toHaveProperty('type');
      expect(packageJson.type).toBe('module');
    });

    describe('필수 프로덕션 의존성', () => {
      const requiredDependencies = [
        'express',
        'pg',
        'dotenv',
        'bcrypt',
        'jsonwebtoken',
        'cors',
        'helmet',
        'express-validator',
        'express-rate-limit',
      ];

      requiredDependencies.forEach((dep) => {
        test(`${dep}이(가) dependencies에 포함되어야 함`, () => {
          expect(packageJson.dependencies).toHaveProperty(dep);
          expect(packageJson.dependencies[dep]).toBeTruthy();
        });
      });

      test('모든 필수 의존성이 버전 정보를 포함해야 함', () => {
        requiredDependencies.forEach((dep) => {
          expect(packageJson.dependencies[dep]).toMatch(/^\^?\d+\.\d+\.\d+/);
        });
      });
    });

    describe('필수 개발 의존성', () => {
      const requiredDevDependencies = [
        'nodemon',
        'jest',
        'supertest',
        'eslint',
        'prettier',
      ];

      requiredDevDependencies.forEach((dep) => {
        test(`${dep}이(가) devDependencies에 포함되어야 함`, () => {
          expect(packageJson.devDependencies).toHaveProperty(dep);
          expect(packageJson.devDependencies[dep]).toBeTruthy();
        });
      });
    });

    describe('npm scripts 검증', () => {
      const requiredScripts = {
        start: 'start 스크립트',
        dev: 'dev 스크립트',
        test: 'test 스크립트',
        lint: 'lint 스크립트',
      };

      Object.entries(requiredScripts).forEach(([scriptName, description]) => {
        test(`${description}가 정의되어야 함`, () => {
          expect(packageJson.scripts).toHaveProperty(scriptName);
          expect(packageJson.scripts[scriptName]).toBeTruthy();
        });
      });

      test('start 스크립트가 server.js를 실행해야 함', () => {
        expect(packageJson.scripts.start).toContain('server.js');
      });

      test('dev 스크립트가 nodemon을 사용해야 함', () => {
        expect(packageJson.scripts.dev).toContain('nodemon');
      });

      test('test 스크립트가 jest를 실행해야 함', () => {
        expect(packageJson.scripts.test).toContain('jest');
      });

      test('lint 스크립트가 eslint를 실행해야 함', () => {
        expect(packageJson.scripts.lint).toContain('eslint');
      });
    });
  });

  describe('3. .gitignore 설정 검증', () => {
    let gitignoreContent;

    beforeAll(() => {
      const gitignorePath = path.join(backendRoot, '.gitignore');
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    });

    const requiredIgnorePatterns = [
      { pattern: 'node_modules', description: 'node_modules 디렉토리' },
      { pattern: '.env', description: '.env 파일' },
      { pattern: '*.log', description: '로그 파일' },
      { pattern: 'coverage', description: '커버리지 디렉토리' },
    ];

    requiredIgnorePatterns.forEach(({ pattern, description }) => {
      test(`${description}가 포함되어야 함`, () => {
        expect(gitignoreContent).toContain(pattern);
      });
    });

    test('민감한 정보 파일들이 제외되어야 함', () => {
      const sensitivePatterns = ['.env', '.env.local'];
      sensitivePatterns.forEach((pattern) => {
        expect(gitignoreContent).toContain(pattern);
      });
    });

    test('개발 도구 관련 파일들이 제외되어야 함', () => {
      const devPatterns = ['coverage', 'node_modules'];
      devPatterns.forEach((pattern) => {
        expect(gitignoreContent).toContain(pattern);
      });
    });
  });

  describe('4. .env.example 환경 변수 검증', () => {
    let envExampleContent;

    beforeAll(() => {
      const envExamplePath = path.join(backendRoot, '.env.example');
      envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');
    });

    const requiredEnvVars = [
      // 서버 설정
      { name: 'NODE_ENV', category: '서버' },
      { name: 'PORT', category: '서버' },

      // 데이터베이스 설정
      { name: 'DATABASE_URL', category: '데이터베이스' },

      // JWT 설정
      { name: 'JWT_SECRET', category: 'JWT' },
      { name: 'JWT_EXPIRES_IN', category: 'JWT' },
      { name: 'JWT_REFRESH_SECRET', category: 'JWT' },
      { name: 'JWT_REFRESH_EXPIRES_IN', category: 'JWT' },

      // Bcrypt 설정
      { name: 'BCRYPT_ROUNDS', category: 'Bcrypt' },

      // CORS 설정
      { name: 'CORS_ORIGIN', category: 'CORS' },

      // Rate Limiting
      { name: 'RATE_LIMIT_WINDOW_MS', category: 'Rate Limiting' },
      { name: 'RATE_LIMIT_MAX_REQUESTS', category: 'Rate Limiting' },
    ];

    requiredEnvVars.forEach(({ name, category }) => {
      test(`${category} 카테고리의 ${name} 환경 변수가 정의되어야 함`, () => {
        expect(envExampleContent).toContain(name);
      });
    });

    test('환경 변수들이 올바른 형식으로 정의되어야 함', () => {
      const lines = envExampleContent.split('\n').filter((line) => line.trim());
      const envVarPattern = /^[A-Z_]+=.+$/;

      lines.forEach((line) => {
        // 주석이나 빈 줄은 건너뛰기
        if (line.startsWith('#') || line.trim() === '') {
          return;
        }
        expect(line).toMatch(envVarPattern);
      });
    });

    test('JWT_SECRET이 예시 값을 가져야 함', () => {
      expect(envExampleContent).toMatch(/JWT_SECRET=.+/);
    });

    test('DATABASE_URL이 PostgreSQL 형식이어야 함', () => {
      expect(envExampleContent).toMatch(/DATABASE_URL=postgresql:\/\/.+/);
    });

    test('PORT가 숫자 값을 가져야 함', () => {
      const portMatch = envExampleContent.match(/PORT=(\d+)/);
      expect(portMatch).toBeTruthy();
      if (portMatch) {
        const port = parseInt(portMatch[1], 10);
        expect(port).toBeGreaterThan(0);
        expect(port).toBeLessThan(65536);
      }
    });
  });

  describe('5. 의존성 설치 검증', () => {
    test('node_modules 디렉토리가 존재해야 함', () => {
      const nodeModulesPath = path.join(backendRoot, 'node_modules');
      expect(fs.existsSync(nodeModulesPath)).toBe(true);
      const stats = fs.statSync(nodeModulesPath);
      expect(stats.isDirectory()).toBe(true);
    });

    test('주요 의존성 패키지가 설치되어 있어야 함', () => {
      const majorPackages = [
        'express',
        'pg',
        'dotenv',
        'bcrypt',
        'jsonwebtoken',
        'jest',
      ];

      majorPackages.forEach((packageName) => {
        const packagePath = path.join(
          backendRoot,
          'node_modules',
          packageName
        );
        expect(fs.existsSync(packagePath)).toBe(true);
      });
    });
  });

  describe('6. 프로젝트 구조 검증', () => {
    test('권장 디렉토리 구조가 준비되어야 함', () => {
      const recommendedDirs = ['src', 'tests'];

      recommendedDirs.forEach((dir) => {
        const dirPath = path.join(backendRoot, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });

    test('src 디렉토리가 비어있지 않거나 준비 상태여야 함', () => {
      const srcPath = path.join(backendRoot, 'src');
      expect(fs.existsSync(srcPath)).toBe(true);
    });

    test('tests 디렉토리 구조가 준비되어야 함', () => {
      const testsPath = path.join(backendRoot, 'tests');
      expect(fs.existsSync(testsPath)).toBe(true);
    });
  });

  describe('7. 설정 파일 검증', () => {
    test('jest.config.js가 존재해야 함', () => {
      const jestConfigPath = path.join(backendRoot, 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });
  });
});

describe('통합 검증', () => {
  test('백엔드 프로젝트가 개발 시작 가능한 상태여야 함', () => {
    const backendPath = path.resolve(__dirname, '../../');

    // 필수 파일 존재
    const requiredFiles = [
      'package.json',
      '.gitignore',
      '.env.example',
    ];

    requiredFiles.forEach((file) => {
      const filePath = path.join(backendPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    // 필수 디렉토리 존재
    const requiredDirs = ['src', 'tests', 'node_modules'];

    requiredDirs.forEach((dir) => {
      const dirPath = path.join(backendPath, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    // package.json 유효성
    const packageJsonPath = path.join(backendPath, 'package.json');
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf-8')
    );

    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts).toHaveProperty('test');
    expect(packageJson.dependencies).toBeTruthy();
    expect(packageJson.devDependencies).toBeTruthy();
  });

  test('환경 변수 예시가 완전해야 함', () => {
    const envExamplePath = path.join(backendRoot, '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf-8');

    // 최소 10개 이상의 환경 변수가 정의되어야 함
    const envVarLines = content
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#') && line.includes('='));

    expect(envVarLines.length).toBeGreaterThanOrEqual(10);
  });

  test('gitignore가 민감한 파일을 적절히 제외해야 함', () => {
    const gitignorePath = path.join(backendRoot, '.gitignore');
    const content = fs.readFileSync(gitignorePath, 'utf-8');

    const criticalPatterns = ['node_modules', '.env'];

    criticalPatterns.forEach((pattern) => {
      expect(content).toContain(pattern);
    });
  });
});
