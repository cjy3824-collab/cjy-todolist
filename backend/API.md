# CJY TodoList API 문서

## 개요

CJY TodoList API는 할 일 관리 애플리케이션을 위한 RESTful API입니다.

- **Base URL**: `http://localhost:3000` (개발), `https://your-domain.vercel.app` (프로덕션)
- **Swagger UI**: `/api-docs`
- **Swagger JSON**: `/api-docs.json`

## 인증

대부분의 API 엔드포인트는 JWT 기반 인증이 필요합니다.

### 헤더 형식

```
Authorization: Bearer <access_token>
```

### 토큰 유효기간

- **Access Token**: 15분
- **Refresh Token**: 7일

## 엔드포인트

### 1. 인증 API (`/api/auth`)

#### 회원가입

```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "username": "홍길동",
  "email": "user@example.com",
  "password": "password123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "User created successfully"
  }
}
```

#### 로그인

```http
POST /api/auth/signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

#### 토큰 갱신

```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

#### 로그아웃

```http
POST /api/auth/signout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

### 2. 할 일 API (`/api/todos`)

**인증 필요**: 모든 엔드포인트

#### 할 일 목록 조회

```http
GET /api/todos?startDate=2025-01-01&endDate=2025-01-31&isCompleted=false
```

**Query Parameters:**
- `startDate` (optional): 시작 날짜 (YYYY-MM-DD)
- `endDate` (optional): 종료 날짜 (YYYY-MM-DD)
- `isCompleted` (optional): 완료 상태 (true, false, all)
- `keyword` (optional): 검색 키워드

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "프로젝트 마감일 확인",
      "description": "상세 내용",
      "dueDate": "2025-12-31",
      "isCompleted": false,
      "createdAt": "2025-11-27T00:00:00.000Z",
      "updatedAt": "2025-11-27T00:00:00.000Z"
    }
  ]
}
```

#### 할 일 생성

```http
POST /api/todos
```

**Request Body:**
```json
{
  "title": "프로젝트 마감일 확인",
  "description": "상세 내용",
  "startDate": "2025-11-27",
  "dueDate": "2025-12-31",
  "priority": "high"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "프로젝트 마감일 확인",
    "description": "상세 내용",
    "dueDate": "2025-12-31",
    "isCompleted": false,
    "createdAt": "2025-11-27T00:00:00.000Z"
  }
}
```

#### 할 일 수정

```http
PUT /api/todos/:id
```

**Request Body:**
```json
{
  "title": "수정된 제목",
  "description": "수정된 내용",
  "dueDate": "2025-12-31",
  "isCompleted": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "수정된 제목",
    "updatedAt": "2025-11-27T01:00:00.000Z"
  }
}
```

#### 할 일 삭제 (소프트 삭제)

```http
DELETE /api/todos/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

#### 완료 상태 토글

```http
PATCH /api/todos/:id/complete
```

**Request Body:**
```json
{
  "isCompleted": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isCompleted": true,
    "updatedAt": "2025-11-27T01:00:00.000Z"
  }
}
```

---

### 3. 휴지통 API (`/api/trash`)

**인증 필요**: 모든 엔드포인트

#### 휴지통 목록 조회

```http
GET /api/trash
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "삭제된 할 일",
      "deletedAt": "2025-11-27T00:00:00.000Z"
    }
  ]
}
```

#### 할 일 복원

```http
POST /api/trash/:id/restore
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "복원된 할 일",
    "deletedAt": null
  }
}
```

#### 영구 삭제

```http
DELETE /api/trash/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

### 4. 캘린더 API (`/api/calendar`)

**인증 필요**: 모든 엔드포인트

#### 캘린더 데이터 조회

```http
GET /api/calendar?start=2025-11-01&end=2025-11-30
```

**Query Parameters:**
- `start` (required): 시작 날짜 (YYYY-MM-DD)
- `end` (required): 종료 날짜 (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-11-27",
      "todos": [
        {
          "id": 1,
          "title": "할 일 1"
        }
      ],
      "holidays": [
        {
          "title": "크리스마스",
          "dueDate": "2025-12-25"
        }
      ]
    }
  ]
}
```

---

### 5. 공휴일 API (`/api/holidays`)

#### 공휴일 목록 조회

```http
GET /api/holidays?year=2025
```

**Query Parameters:**
- `year` (optional): 연도 (YYYY)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "title": "신정",
      "dueDate": "2025-01-01",
      "isPublicHoliday": true
    }
  ]
}
```

#### 공휴일 추가 (관리자 전용)

```http
POST /api/holidays
```

**Request Body:**
```json
{
  "title": "임시공휴일",
  "dueDate": "2025-12-31"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "title": "임시공휴일",
    "dueDate": "2025-12-31",
    "isPublicHoliday": true
  }
}
```

---

## 에러 응답

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": {
    "type": "ErrorType",
    "message": "에러 메시지",
    "details": []
  }
}
```

### 에러 코드

| 상태 코드 | 설명 |
|---------|------|
| 400 | Bad Request - 잘못된 요청 |
| 401 | Unauthorized - 인증 실패 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found - 리소스를 찾을 수 없음 |
| 422 | Unprocessable Entity - 유효성 검증 실패 |
| 429 | Too Many Requests - Rate limit 초과 |
| 500 | Internal Server Error - 서버 오류 |

### 에러 타입

- `ValidationError`: 입력 검증 실패
- `AuthenticationError`: 인증 실패
- `AuthorizationError`: 권한 없음
- `NotFoundError`: 리소스를 찾을 수 없음
- `RateLimitError`: Rate limit 초과
- `DatabaseError`: 데이터베이스 오류

---

## Rate Limiting

### 인증 API

- 15분당 5회 요청 제한
- 실패한 시도만 카운트

### 일반 API

- 15분당 100회 요청 제한

### 휴지통 API

- 15분당 20회 요청 제한

### 캘린더 API

- 15분당 50회 요청 제한

---

## 보안

### CORS

- 프로덕션: 특정 도메인만 허용
- 개발: 모든 도메인 허용

### 헤더

- `helmet`을 사용한 보안 헤더 설정
- Content Security Policy 적용

### 입력 검증

- XSS 방어: 모든 입력 이스케이프 처리
- SQL Injection 방어: Parameterized Queries 사용

---

## 헬스 체크

```http
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-27T00:00:00.000Z",
  "uptime": 12345.67
}
```

---

## 추가 정보

- **Swagger UI**: 더 자세한 API 문서는 `/api-docs`에서 확인하세요
- **GitHub**: [프로젝트 저장소](https://github.com/your-username/cjy-todolist)
