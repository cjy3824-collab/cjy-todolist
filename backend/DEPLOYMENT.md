# Vercel 배포 가이드

## 배포 방법

Vercel에 백엔드 API를 배포하는 두 가지 방법을 제공합니다.

---

## 방법 1: Vercel Dashboard를 통한 배포 (권장)

이 방법은 가장 간단하고 자동화된 배포 방식입니다.

### 1단계: GitHub에 코드 푸시

```bash
# 프로젝트 루트 디렉토리에서
git add .
git commit -m "Backend ready for deployment"
git push origin main
```

### 2단계: Vercel Dashboard에서 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 연결
4. `cjy-todolist` 저장소 선택
5. **Root Directory 설정**: `backend` 입력 (중요!)
6. **Framework Preset**: Other 선택
7. **Build Command**: 비워두기 (Node.js 프로젝트는 빌드 불필요)
8. **Output Directory**: 비워두기
9. **Install Command**: `npm install`

### 3단계: 환경 변수 설정

Project Settings → Environment Variables에서 다음 환경 변수를 추가하세요:

#### 필수 환경 변수

```env
# 서버 설정
NODE_ENV=production

# 데이터베이스 설정 (Supabase에서 확인)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT 설정 (강력한 시크릿 키 사용)
JWT_SECRET=your-very-strong-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-very-strong-refresh-secret-key-at-least-32-characters-long
JWT_REFRESH_EXPIRES_IN=7d

# CORS 설정 (프론트엔드 도메인)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Bcrypt
BCRYPT_ROUNDS=10

# 로깅
LOG_LEVEL=info
LOG_FILE_PATH=/tmp/logs
```

#### 환경 변수 값 확인 방법

**DATABASE_URL 확인:**
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. Settings → Database
4. Connection String → URI 복사
5. `[YOUR-PASSWORD]`를 실제 데이터베이스 비밀번호로 교체

**JWT 시크릿 키 생성:**
```bash
# Node.js로 랜덤 시크릿 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4단계: 배포 시작

"Deploy" 버튼을 클릭하여 배포를 시작합니다.

### 5단계: 배포 확인

배포가 완료되면 다음을 확인하세요:

1. **Deployment URL**: `https://your-project-name.vercel.app`
2. **Health Check**: `https://your-project-name.vercel.app/health`
   - 응답: `{"status":"ok","timestamp":"...","environment":"production"}`
3. **API Docs**: `https://your-project-name.vercel.app/api-docs`

---

## 방법 2: Vercel CLI를 통한 배포

로컬에서 직접 배포하고 싶다면 이 방법을 사용하세요.

### 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

### 2단계: Vercel 로그인

```bash
vercel login
```

### 3단계: 백엔드 디렉토리로 이동

```bash
cd backend
```

### 4단계: 첫 배포 (개발 환경)

```bash
vercel
```

프롬프트에 따라 다음을 설정:
- Set up and deploy?: `Y`
- Which scope?: 사용할 팀 선택
- Link to existing project?: `N`
- Project name: `cjy-todolist-backend`
- In which directory is your code located?: `./`

### 5단계: 환경 변수 설정

```bash
# 방법 1: 대화형으로 추가
vercel env add DATABASE_URL

# 방법 2: Vercel Dashboard에서 추가
# https://vercel.com/[your-team]/cjy-todolist-backend/settings/environment-variables
```

### 6단계: 프로덕션 배포

```bash
vercel --prod
```

---

## 배포 후 확인 사항

### 1. Health Check 테스트

```bash
curl https://your-project-name.vercel.app/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T10:00:00.000Z",
  "environment": "production"
}
```

### 2. 데이터베이스 연결 테스트

Supabase 데이터베이스에 연결되는지 확인:

```bash
# 회원가입 테스트
curl -X POST https://your-project-name.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**예상 응답:**
```json
{
  "success": true,
  "data": {
    "userId": "...",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### 3. 로그 확인

Vercel Dashboard → Deployments → 최신 배포 선택 → Functions 탭에서 로그 확인

### 4. API 문서 확인

브라우저에서 접속:
```
https://your-project-name.vercel.app/api-docs
```

---

## 환경별 배포 전략

### Development (개발)
- Branch: `develop`
- URL: `https://cjy-todolist-backend-dev.vercel.app`
- 환경 변수: Development용 설정

### Staging (스테이징)
- Branch: `staging`
- URL: `https://cjy-todolist-backend-staging.vercel.app`
- 환경 변수: Staging용 설정

### Production (프로덕션)
- Branch: `main`
- URL: `https://cjy-todolist-backend.vercel.app`
- 환경 변수: Production용 설정

---

## 자주 발생하는 문제

### 1. 데이터베이스 연결 실패

**증상:**
```
Error: connect ETIMEDOUT
```

**해결 방법:**
1. Vercel Dashboard → Settings → Environment Variables에서 `DATABASE_URL` 확인
2. Supabase에서 IPv6 지원 확인 (Vercel은 IPv6 사용)
3. Supabase 프로젝트가 활성화되어 있는지 확인

### 2. CORS 오류

**증상:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**해결 방법:**
1. `CORS_ORIGIN` 환경 변수에 프론트엔드 도메인 추가
2. 여러 도메인 허용 시: `https://domain1.com,https://domain2.com`

### 3. JWT 토큰 오류

**증상:**
```
JsonWebTokenError: invalid signature
```

**해결 방법:**
1. `JWT_SECRET`과 `JWT_REFRESH_SECRET`이 프로덕션 환경에 설정되어 있는지 확인
2. 시크릿 키가 충분히 강력한지 확인 (최소 32자)

### 4. Function Timeout

**증상:**
```
FUNCTION_INVOCATION_TIMEOUT
```

**해결 방법:**
1. 데이터베이스 쿼리 최적화
2. 인덱스 확인
3. Vercel Pro 플랜 고려 (타임아웃 60초)

### 5. Cold Start 지연

**증상:**
첫 요청이 느림 (5-10초)

**해결 방법:**
1. Vercel Pro 플랜 사용 (콜드 스타트 감소)
2. 데이터베이스 연결 풀 최적화
3. Serverless 함수 웜업 전략 구현

---

## 배포 최적화 팁

### 1. 데이터베이스 연결 풀 설정

`src/config/database.js`:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. 로그 레벨 조정

프로덕션에서는 불필요한 로그 최소화:
```env
LOG_LEVEL=warn
```

### 3. Rate Limiting 조정

프로덕션 트래픽에 맞게 조정:
```env
RATE_LIMIT_MAX_REQUESTS=1000
```

### 4. Vercel 함수 리전 설정

`vercel.json`:
```json
{
  "functions": {
    "src/server.js": {
      "maxDuration": 10
    }
  },
  "regions": ["icn1"]
}
```

---

## Custom Domain 설정 (선택사항)

### 1. 도메인 추가

Vercel Dashboard → Settings → Domains

### 2. DNS 레코드 추가

도메인 제공업체에서 다음 레코드 추가:
```
Type: CNAME
Name: api (또는 원하는 서브도메인)
Value: cname.vercel-dns.com
```

### 3. SSL/TLS 자동 설정

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다.

---

## 모니터링 및 알림

### 1. Vercel Analytics

Vercel Dashboard → Analytics에서 확인:
- 요청 수
- 응답 시간
- 에러율

### 2. 로그 모니터링

실시간 로그 확인:
```bash
vercel logs [deployment-url]
```

### 3. Uptime 모니터링

외부 모니터링 서비스 사용 권장:
- UptimeRobot (무료)
- Pingdom
- StatusCake

---

## 롤백 절차

문제 발생 시 이전 버전으로 롤백:

### Vercel Dashboard에서
1. Deployments 탭
2. 이전 배포 선택
3. "..." → "Promote to Production"

### CLI에서
```bash
vercel rollback [deployment-url]
```

---

## 보안 체크리스트

배포 전 확인사항:

- [ ] 모든 환경 변수가 프로덕션에 설정됨
- [ ] JWT 시크릿이 강력하고 유니크함
- [ ] DATABASE_URL에 비밀번호가 노출되지 않음
- [ ] CORS_ORIGIN이 정확한 프론트엔드 도메인으로 설정됨
- [ ] Rate Limiting이 활성화됨
- [ ] Helmet 미들웨어가 활성화됨
- [ ] 프로덕션 로그 레벨이 적절함
- [ ] .env 파일이 .gitignore에 추가됨
- [ ] API 키나 시크릿이 코드에 하드코딩되지 않음

---

## 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel Node.js 가이드](https://vercel.com/docs/frameworks/node)
- [Supabase 연동 가이드](https://supabase.com/docs/guides/getting-started)
- [Express.js 프로덕션 Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 지원

문제가 발생하면:
1. 이 가이드의 "자주 발생하는 문제" 섹션 확인
2. Vercel 로그 확인
3. GitHub Issues에 문제 보고
