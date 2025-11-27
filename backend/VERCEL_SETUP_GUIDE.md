# Vercel 배포 단계별 가이드

이 가이드는 **지금 바로** Vercel Dashboard를 통해 백엔드를 배포하는 방법을 안내합니다.

---

## 📋 준비된 환경 변수

배포 시 다음 환경 변수들을 사용하세요:

```env
# 필수 환경 변수
NODE_ENV=production
DATABASE_URL=postgresql://postgres.qjtoldebmqaaxaozpmre:jy151618@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
JWT_SECRET=97a058e7b34fdc7796134ba4fafcb9477e11f44eb410ca259de943d860ddaaee1d0e58f3627449fa9bb3f9d442db3e57cad081ac1113667bfb0040fe25720a39
JWT_REFRESH_SECRET=ea89a2e8877c3bfd61a54a95a663d1ba3c4a9fb3e06fade820d76fde41ac1f63599950866054875d398eecc8394889c27307c6070e8c87bade0d8f541e9c9f48
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE_PATH=/tmp/logs
```

> ⚠️ **보안 주의**: 프론트엔드 배포 후 `CORS_ORIGIN`을 실제 프론트엔드 도메인으로 변경하세요!

---

## 🚀 Vercel Dashboard를 통한 배포 (5분 소요)

### Step 1: GitHub에 코드 푸시 (현재 위치에서)

먼저 코드를 GitHub에 푸시해야 합니다:

```bash
# 프로젝트 루트로 이동
cd /c/test/cjy-todolist

# 변경사항 커밋
git add .
git commit -m "Add Vercel deployment configuration and guides"
git push origin feature-9
```

### Step 2: Vercel Dashboard 접속

1. 브라우저에서 https://vercel.com/dashboard 접속
2. 우측 상단 **"Add New..."** 클릭
3. **"Project"** 선택

### Step 3: GitHub 저장소 Import

1. **Import Git Repository** 섹션에서 GitHub 저장소 검색
2. `cjy-todolist` 저장소 찾기
3. **"Import"** 클릭

### Step 4: 프로젝트 설정

Configure Project 화면에서:

#### General Settings
- **Project Name**: `cjy-todolist-backend` (원하는 이름 입력 가능)
- **Framework Preset**: `Other` 선택
- **Root Directory**: `backend` 입력 후 **Edit** 클릭하여 확인 ⭐ **중요!**

#### Build and Output Settings
- **Build Command**: 비워두기 (Node.js는 빌드 불필요)
- **Output Directory**: 비워두기
- **Install Command**: `npm install` (기본값)

### Step 5: 환경 변수 설정

**Environment Variables** 섹션에서 다음 변수들을 **하나씩** 추가하세요:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres.qjtoldebmqaaxaozpmre:jy151618@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | `97a058e7b34fdc7796134ba4fafcb9477e11f44eb410ca259de943d860ddaaee1d0e58f3627449fa9bb3f9d442db3e57cad081ac1113667bfb0040fe25720a39` |
| `JWT_REFRESH_SECRET` | `ea89a2e8877c3bfd61a54a95a663d1ba3c4a9fb3e06fade820d76fde41ac1f63599950866054875d398eecc8394889c27307c6070e8c87bade0d8f541e9c9f48` |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `BCRYPT_ROUNDS` | `10` |
| `CORS_ORIGIN` | `*` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `LOG_LEVEL` | `info` |
| `LOG_FILE_PATH` | `/tmp/logs` |

각 환경 변수 추가 방법:
1. **Name** 입력
2. **Value** 입력
3. **Environment** 선택: `Production`, `Preview`, `Development` 모두 체크 ✅
4. **Add** 버튼 클릭

### Step 6: 배포 시작

모든 설정 완료 후:
1. **"Deploy"** 버튼 클릭
2. 배포 진행 상황 모니터링 (약 2-3분 소요)

---

## ✅ 배포 확인 체크리스트

배포 완료 후 다음 사항들을 확인하세요:

### 1. 배포 URL 확인
```
https://cjy-todolist-backend.vercel.app (예시)
```

### 2. Health Check 테스트

브라우저나 curl로 테스트:
```bash
curl https://cjy-todolist-backend.vercel.app/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-27T...",
  "environment": "production"
}
```

### 3. API Docs 확인

브라우저에서 접속:
```
https://cjy-todolist-backend.vercel.app/api-docs
```

Swagger UI가 표시되어야 합니다.

### 4. 데이터베이스 연결 테스트

회원가입 API 테스트:
```bash
curl -X POST https://cjy-todolist-backend.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**성공 응답:**
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

### 5. 로그인 테스트

```bash
curl -X POST https://cjy-todolist-backend.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test1234!"
  }'
```

**성공 응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "...",
      "username": "testuser",
      "email": "test@example.com"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

---

## 🔧 배포 후 설정

### CORS 설정 업데이트

프론트엔드 배포 후:
1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. `CORS_ORIGIN` 찾기
4. **Edit** 클릭
5. 값을 프론트엔드 도메인으로 변경:
   ```
   https://cjy-todolist-frontend.vercel.app
   ```
6. **Save** 클릭
7. **Redeploy** 필요 (자동 또는 수동)

### Custom Domain 설정 (선택사항)

1. Vercel Dashboard → 프로젝트 선택
2. **Settings** → **Domains**
3. **Add Domain** 클릭
4. 원하는 도메인 입력 (예: `api.yourdomain.com`)
5. DNS 레코드 추가 안내 따라하기

---

## 📊 모니터링

### 실시간 로그 확인

1. Vercel Dashboard → 프로젝트 선택
2. **Deployments** 탭
3. 최신 배포 클릭
4. **Functions** 탭에서 실시간 로그 확인

### 에러 발생 시

배포 중 에러가 발생하면:
1. **Deployment** → **Building** 로그 확인
2. 환경 변수 설정 재확인
3. `vercel.json` 파일 확인
4. Node.js 버전 확인 (package.json의 engines)

---

## 🆘 문제 해결

### 문제 1: "Error: connect ETIMEDOUT"
**원인**: DATABASE_URL이 잘못되었거나 Supabase 연결 실패
**해결**:
- DATABASE_URL 환경 변수 재확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- Supabase Connection Pooling 사용 확인

### 문제 2: "Cannot find module 'express'"
**원인**: 의존성 설치 실패
**해결**:
- Root Directory가 `backend`로 설정되어 있는지 확인
- `package.json`이 backend 폴더에 있는지 확인

### 문제 3: 404 에러
**원인**: 라우팅 설정 문제
**해결**:
- `vercel.json` 파일 확인
- `src/server.js` 경로 확인

### 문제 4: CORS 에러 (프론트엔드 연결 시)
**원인**: CORS_ORIGIN 설정 문제
**해결**:
- 일단 `*`로 설정하여 모든 도메인 허용 (개발 중)
- 프로덕션에서는 실제 프론트엔드 도메인으로 변경

---

## 📝 배포 완료 후 할 일

- [x] Health Check 확인
- [x] API Docs 확인
- [x] 회원가입/로그인 테스트
- [ ] 배포 URL을 프론트엔드 팀에 공유
- [ ] CORS_ORIGIN을 실제 프론트엔드 도메인으로 업데이트
- [ ] Custom Domain 설정 (선택사항)
- [ ] 모니터링 설정 (UptimeRobot 등)

---

## 🎉 배포 성공!

축하합니다! 백엔드 API가 성공적으로 배포되었습니다.

**배포 URL**: `https://your-project-name.vercel.app`

이제 프론트엔드 개발을 진행하고 이 API 엔드포인트를 사용할 수 있습니다.

---

## 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- `DEPLOYMENT.md` - 상세한 배포 가이드
- `README.md` - 프로젝트 개요
- `API.md` - API 상세 문서
