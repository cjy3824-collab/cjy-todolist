# cjy-todolist API 명세서

## 개요

 cjy-todolist 백엔드 API는 사용자 인증 기반의 할 일 관리 시스템을 제공합니다. RESTful API를 따르며, JSON 형식으로 요청 및 응답을 처리합니다.

## 기본 URL

- Development: `http://localhost:3000`
- Production: `https://cjy-todolist-backend.vercel.app`

## 인증

API는 JWT 토큰 기반의 인증 방식(Bearer Token)을 사용합니다. 인증이 필요한 엔드포인트는 `Authorization` 헤더에 `Bearer <access_token>` 형식으로 토큰을 포함해야 합니다.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 토큰 갱신

Access Token이 만료되면, Refresh Token을 사용하여 새로운 Access Token을 발급 받을 수 있습니다.

## 공통 응답 형식

성공 응답:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

에러 응답:
```json
{
  "success": false,
  "error": {
    "type": "ErrorType",
    "message": "Error message",
    "details": { ... }
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 엔드포인트

### 인증 관련

#### `POST /api/auth/signup`

회원가입

**요청 본문:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

**요청 검증:**
- username: 3-50자, 영문/숫자/밑줄 허용
- email: 유효한 이메일 형식
- password: 8자 이상, 대문자/소문자/숫자/특수문자 포함

**성공 응답:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "access-token",
    "refreshToken": "refresh-token",
    "user": {
      "userId": "uuid",
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

**에러 응답:**
- 400: 입력 검증 실패
- 409: 사용자명 또는 이메일 중복

---

#### `POST /api/auth/signin`

로그인

**요청 본문:**
```json
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "access-token",
    "refreshToken": "refresh-token",
    "user": {
      "userId": "uuid",
      "username": "testuser",
      "email": "test@example.com"
    }
  }
}
```

**에러 응답:**
- 400: 입력 검증 실패
- 401: 이메일 또는 비밀번호 오류

---

#### `POST /api/auth/signout`

로그아웃 (Refresh Token 폐기)

**헤더:**
```
Authorization: Bearer <access_token>
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Successfully signed out"
}
```

**에러 응답:**
- 401: 인증 실패

---

#### `POST /api/auth/refresh`

Access Token 갱신

**요청 본문:**
```json
{
  "refreshToken": "refresh-token"
}
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Access token refreshed",
  "data": {
    "accessToken": "new-access-token"
  }
}
```

**에러 응답:**
- 400: 입력값 누락
- 401: Refresh 토큰 유효하지 않음 또는 만료

---

### 할 일 관련

#### `GET /api/todos`

할 일 목록 조회

**헤더:**
```
Authorization: Bearer <access_token>
```

**쿼리 파라미터:**
- `startDate` (선택): 조회 시작일 (YYYY-MM-DD)
- `endDate` (선택): 조회 종료일 (YYYY-MM-DD)
- `isCompleted` (선택): 완료 상태 필터 ('true', 'false', 'all')
- `keyword` (선택): 제목 또는 설명 검색 키워드

**성공 응답:**
```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [
    {
      "todoId": "uuid",
      "userId": "uuid",
      "title": "Sample Todo",
      "description": "Sample Description",
      "startDate": "2025-01-01",
      "dueDate": "2025-01-31",
      "isCompleted": false,
      "isPublicHoliday": false,
      "isDeleted": false,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/todos/{id}`

특정 할 일 조회

**헤더:**
```
Authorization: Bearer <access_token>
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Todo retrieved successfully",
  "data": { ...todo_object }
}
```

**에러 응답:**
- 401: 인증 실패
- 404: 할 일 없음

---

#### `POST /api/todos`

할 일 생성

**헤더:**
```
Authorization: Bearer <access_token>
```

**요청 본문:**
```json
{
  "title": "New Todo",
  "description": "New Description",
  "startDate": "2025-01-01",
  "dueDate": "2025-01-31"
}
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": { ...todo_object }
}
```

---

#### `PUT /api/todos/{id}`

할 일 수정

**헤더:**
```
Authorization: Bearer <access_token>
```

**요청 본문:**
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "startDate": "2025-01-01",
  "dueDate": "2025-01-31"
}
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "data": { ...todo_object }
}
```

**에러 응답:**
- 401: 인증 실패
- 404: 할 일 없음
- 422: 완료된 할 일 수정 시도

---

#### `DELETE /api/todos/{id}`

할 일 삭제 (소프트 삭제, 휴지통으로 이동)

**헤더:**
```
Authorization: Bearer <access_token>
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

---

#### `PATCH /api/todos/{id}/complete`

할 일 완료 상태 토글

**헤더:**
```
Authorization: Bearer <access_token>
```

**요청 본문:**
```json
{
  "isCompleted": true
}
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Todo marked as completed successfully",
  "data": { ...todo_object }
}
```

---

### 휴지통 관련

#### `GET /api/trash`

삭제된 할 일 목록 조회

**헤더:**
```
Authorization: Bearer <access_token>
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Trash todos retrieved successfully",
  "data": [ ... ]
}
```

---

#### `POST /api/trash/{id}/restore`

할 일 복원

**헤더:**
```
Authorization: Bearer <access_token>
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Todo restored successfully",
  "data": { ...todo_object }
}
```

---

#### `DELETE /api/trash/{id}`

할 일 영구 삭제

**헤더:**
```
Authorization: Bearer <access_token>
```

**성공 응답:**
```json
{
  "success": true,
  "message": "Todo permanently deleted successfully"
}
```

---

### 캘린더 관련

#### `GET /api/calendar`

캘린더 데이터 조회

**헤더:**
```
Authorization: Bearer <access_token>
```

**쿼리 파라미터:**
- `startDate` (필수): 시작 날짜
- `endDate` (필수): 종료 날짜

**성공 응답:**
```json
{
  "success": true,
  "message": "Calendar data retrieved successfully",
  "data": [
    {
      "date": "2025-01-01",
      "todos": [ ... ],
      "holidays": [ ... ]
    }
  ]
}
```

---

#### `GET /api/holidays`

국경일 목록 조회

**성공 응답:**
```json
{
  "success": true,
  "message": "Public holidays retrieved successfully",
  "data": [ ...holiday_objects... ]
}
```

## Rate Limiting

- 인증 관련 API: 5회/15분
- 기타 일반 API: 100회/15분

## 에러 코드 정의

| HTTP 상태 코드 | 에러 타입 | 설명 |
|---|---|---|
| 400 | ValidationError | 요청 데이터 검증 실패 |
| 401 | AuthenticationError | 인증 실패 또는 토큰 만료 |
| 403 | AuthorizationError | 권한 없음 |
| 404 | NotFoundError | 요청한 리소스 없음 |
| 409 | ConflictError | 데이터 중복 (예: 사용자명 중복) |
| 422 | UnprocessableEntityError | 요청 데이터는 올바르지만 처리 불가 (예: 완료된 할 일 수정 시도) |
| 429 | RateLimitError | 요청 제한 초과 |
| 500 | InternalServerError | 서버 내부 오류 |

---

## 헬스 체크

서버 상태 확인:
- `GET /health` - 서버 상태 확인 엔드포인트

## 로깅

API 요청 및 오류는 로그 파일에 기록됩니다. 로그 레벨은 환경 변수 `LOG_LEVEL`로 설정할 수 있습니다.
