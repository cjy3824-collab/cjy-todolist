# cjy-todoList 프로젝트 구조 설계 원칙

---

## 문서 정보

| 항목       | 내용                          |
| ---------- | ----------------------------- |
| **문서명** | 프로젝트 구조 설계 원칙       |
| **버전**   | 1.0                           |
| **작성일** | 2025-11-25                    |
| **작성자** | Claude (Architecture Reviewer) |
| **상태**   | 초안                          |

---

## 목차

1. [최상위 공통 원칙](#1-최상위-공통-원칙)
2. [의존성/레이어 원칙](#2-의존성레이어-원칙)
3. [코드/네이밍 원칙](#3-코드네이밍-원칙)
4. [테스트/품질 원칙](#4-테스트품질-원칙)
5. [설정/보안/운영 원칙](#5-설정보안운영-원칙)
6. [프론트엔드 디렉토리 구조](#6-프론트엔드-디렉토리-구조)
7. [백엔드 디렉토리 구조](#7-백엔드-디렉토리-구조)
8. [부록: 파일 명명 규칙](#부록-파일-명명-규칙)

---

## 1. 최상위 공통 원칙

### 1.1 아키텍처 철학

**핵심 가치**:
- **단순성 (Simplicity)**: 불필요한 복잡도를 제거하고 명확한 구조 유지
- **명확성 (Clarity)**: 코드의 의도가 명확하게 드러나도록 작성
- **유지보수성 (Maintainability)**: 변경과 확장이 용이한 구조
- **일관성 (Consistency)**: 프로젝트 전체에 일관된 패턴 적용

**설계 철학**:
```
"복잡함보다 단순함을, 영리함보다 명확함을, 추상화보다 구체성을 우선한다."
```

### 1.2 SOLID 원칙 적용

#### S - 단일 책임 원칙 (Single Responsibility Principle)

각 모듈, 클래스, 함수는 단 하나의 책임만 가져야 합니다.

**좋은 예시** (백엔드):
```javascript
// controllers/todoController.js - 요청/응답 처리에만 집중
const getTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.query;

    const todos = await todoService.getTodos(userId, filters);

    res.status(200).json({ data: todos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// services/todoService.js - 비즈니스 로직에만 집중
const getTodos = async (userId, filters) => {
  const todos = await todoModel.findByUserId(userId);

  if (filters.isCompleted !== undefined) {
    return todos.filter(t => t.isCompleted === filters.isCompleted);
  }

  return todos;
};
```

**나쁜 예시**:
```javascript
// 하나의 함수가 너무 많은 책임을 가짐
const getTodos = async (req, res) => {
  // 인증 확인 (미들웨어가 해야 할 일)
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // DB 직접 조회 (모델/서비스가 해야 할 일)
  const todos = await db.query('SELECT * FROM todos WHERE userId = $1', [req.user.id]);

  // 복잡한 비즈니스 로직 (서비스가 해야 할 일)
  const filtered = todos.filter(/* ... */);

  // 데이터 변환 (유틸리티가 해야 할 일)
  const formatted = filtered.map(/* ... */);

  res.status(200).json(formatted);
};
```

#### O - 개방-폐쇄 원칙 (Open-Closed Principle)

확장에는 열려있고 수정에는 닫혀있어야 합니다.

**좋은 예시** (프론트엔드):
```javascript
// components/TodoList/TodoList.jsx
// 새로운 필터 전략을 추가해도 컴포넌트 수정 불필요

const filterStrategies = {
  all: (todos) => todos,
  completed: (todos) => todos.filter(t => t.isCompleted),
  active: (todos) => todos.filter(t => !t.isCompleted),
  overdue: (todos) => todos.filter(t => isOverdue(t.dueDate))
};

const TodoList = ({ todos, filterType = 'all' }) => {
  const filterStrategy = filterStrategies[filterType] || filterStrategies.all;
  const filteredTodos = filterStrategy(todos);

  return (
    <ul>
      {filteredTodos.map(todo => <TodoItem key={todo.todoId} todo={todo} />)}
    </ul>
  );
};
```

#### L - 리스코프 치환 원칙 (Liskov Substitution Principle)

하위 타입은 상위 타입을 대체할 수 있어야 합니다.

**적용 사례**:
```javascript
// 모든 Service는 동일한 인터페이스 규약을 따름
class BaseService {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async create(data) {
    throw new Error('Method not implemented');
  }
}

class TodoService extends BaseService {
  async findById(id) {
    return await todoModel.findById(id);
  }

  async create(data) {
    return await todoModel.create(data);
  }
}

class UserService extends BaseService {
  async findById(id) {
    return await userModel.findById(id);
  }

  async create(data) {
    return await userModel.create(data);
  }
}
```

#### I - 인터페이스 분리 원칙 (Interface Segregation Principle)

클라이언트는 자신이 사용하지 않는 메서드에 의존하지 않아야 합니다.

**좋은 예시**:
```javascript
// hooks/useTodoActions.js - Todo 액션만 제공
export const useTodoActions = () => {
  const { createTodo, updateTodo, deleteTodo } = useTodoStore();
  return { createTodo, updateTodo, deleteTodo };
};

// hooks/useTodoFilters.js - 필터링 기능만 제공
export const useTodoFilters = () => {
  const { todos, filterType, setFilterType } = useTodoStore();
  const filteredTodos = applyFilter(todos, filterType);
  return { filteredTodos, filterType, setFilterType };
};
```

#### D - 의존성 역전 원칙 (Dependency Inversion Principle)

고수준 모듈은 저수준 모듈에 의존하지 않아야 하며, 둘 다 추상화에 의존해야 합니다.

**좋은 예시**:
```javascript
// services/todoService.js
// 구체적인 DB 구현이 아닌 추상화된 Repository에 의존
class TodoService {
  constructor(todoRepository) {
    this.repository = todoRepository;
  }

  async getTodos(userId) {
    return await this.repository.findByUserId(userId);
  }
}

// repositories/todoRepository.js
// DB 접근을 추상화
class TodoRepository {
  async findByUserId(userId) {
    // PostgreSQL 구현
    return await db.query('SELECT * FROM todos WHERE userId = $1', [userId]);
  }
}

// 나중에 MongoDB로 변경해도 Service는 수정 불필요
class MongoTodoRepository {
  async findByUserId(userId) {
    // MongoDB 구현
    return await TodoModel.find({ userId });
  }
}
```

### 1.3 DRY, KISS, YAGNI 원칙

#### DRY (Don't Repeat Yourself)

중복을 제거하고 재사용 가능한 코드를 작성합니다.

**적용 전**:
```javascript
// pages/TodoList.jsx
const handleCreateTodo = async (todoData) => {
  try {
    setLoading(true);
    const response = await axios.post('/api/todos', todoData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setLoading(false);
    return response.data;
  } catch (error) {
    setLoading(false);
    console.error(error);
  }
};

const handleUpdateTodo = async (id, todoData) => {
  try {
    setLoading(true);
    const response = await axios.put(`/api/todos/${id}`, todoData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setLoading(false);
    return response.data;
  } catch (error) {
    setLoading(false);
    console.error(error);
  }
};
```

**적용 후**:
```javascript
// services/api.js - 공통 로직 추출
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// services/todoService.js
export const todoService = {
  create: (data) => apiClient.post('/todos', data),
  update: (id, data) => apiClient.put(`/todos/${id}`, data),
  delete: (id) => apiClient.delete(`/todos/${id}`)
};
```

#### KISS (Keep It Simple, Stupid)

단순하고 이해하기 쉬운 코드를 작성합니다.

**복잡한 예시**:
```javascript
const isValidTodo = (todo) => {
  return (todo && typeof todo === 'object' && 'title' in todo &&
    todo.title && typeof todo.title === 'string' && todo.title.length > 0 &&
    todo.title.length <= 200 && (!todo.dueDate || (todo.dueDate instanceof Date ||
    typeof todo.dueDate === 'string' && !isNaN(Date.parse(todo.dueDate))))) ?
    true : false;
};
```

**단순한 예시**:
```javascript
const isValidTodo = (todo) => {
  if (!todo || typeof todo !== 'object') return false;
  if (!todo.title || typeof todo.title !== 'string') return false;
  if (todo.title.length === 0 || todo.title.length > 200) return false;

  if (todo.dueDate) {
    const date = new Date(todo.dueDate);
    if (isNaN(date.getTime())) return false;
  }

  return true;
};
```

#### YAGNI (You Aren't Gonna Need It)

현재 필요하지 않은 기능은 구현하지 않습니다.

**나쁜 예시**:
```javascript
// 현재 사용하지 않는 복잡한 기능들
class TodoService {
  async getTodos() { /* ... */ }
  async getTodosByPriority() { /* 우선순위 기능은 아직 요구사항에 없음 */ }
  async getTodosByTag() { /* 태그 기능은 Phase 3에 계획됨 */ }
  async shareTodo() { /* 공유 기능은 Could-Have */ }
  async exportTodos() { /* 내보내기 기능은 요구사항에 없음 */ }
}
```

**좋은 예시**:
```javascript
// 현재 필요한 기능만 구현
class TodoService {
  async getTodos() { /* ... */ }
  async getTodoById(id) { /* ... */ }
  async createTodo(data) { /* ... */ }
  async updateTodo(id, data) { /* ... */ }
  async deleteTodo(id) { /* ... */ }
}
```

### 1.4 모듈화 및 관심사의 분리

**계층별 책임 분리**:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (UI)             │
│  - 사용자 인터랙션 처리                      │
│  - 화면 렌더링                               │
│  - 입력 검증 (클라이언트)                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Application Layer (Services)        │
│  - 비즈니스 로직 처리                        │
│  - 데이터 변환                               │
│  - 트랜잭션 관리                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Data Access Layer (Models)          │
│  - 데이터 CRUD                               │
│  - 쿼리 실행                                 │
│  - 데이터 매핑                               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Database (PostgreSQL)               │
└─────────────────────────────────────────────┘
```

**모듈화 예시**:
```javascript
// 각 모듈은 명확한 책임과 경계를 가짐

// auth 모듈 - 인증/인가 관련 모든 로직
auth/
  ├── authController.js    // 인증 요청 처리
  ├── authService.js       // 인증 비즈니스 로직
  ├── authMiddleware.js    // 인증 미들웨어
  └── tokenService.js      // JWT 토큰 관리

// todo 모듈 - 할 일 관련 모든 로직
todos/
  ├── todoController.js    // 할 일 요청 처리
  ├── todoService.js       // 할 일 비즈니스 로직
  ├── todoModel.js         // 할 일 데이터 접근
  └── todoValidator.js     // 할 일 검증 로직
```

---

## 2. 의존성/레이어 원칙

### 2.1 레이어드 아키텍처

프로젝트는 명확한 레이어 구조를 따릅니다.

```
┌──────────────────────────────────────────────────┐
│                 Presentation Layer               │
│  React Components, Pages, UI Logic               │
│  의존: Service Layer, State Management           │
└──────────────────────────────────────────────────┘
                      ↓ (HTTP/API)
┌──────────────────────────────────────────────────┐
│                   API Layer                      │
│  Controllers, Routes, Request/Response Handling  │
│  의존: Service Layer, Middleware                 │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│                 Service Layer                    │
│  Business Logic, Use Cases, Data Transformation  │
│  의존: Data Access Layer, External Services      │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│              Data Access Layer                   │
│  Models, Repositories, Database Queries          │
│  의존: Database, ORM                             │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│                   Database                       │
│  PostgreSQL, Data Storage                        │
└──────────────────────────────────────────────────┘
```

### 2.2 의존성 방향 규칙

**원칙**: 상위 레이어는 하위 레이어에만 의존할 수 있습니다.

**허용되는 의존성**:
```
Controller → Service → Model ✓
Component → Service (API) ✓
Service → Utils ✓
```

**금지되는 의존성**:
```
Model → Service ✗
Service → Controller ✗
Utils → Service ✗
```

**실제 예시**:

**올바른 의존성**:
```javascript
// controllers/todoController.js
const todoService = require('../services/todoService'); // ✓

const getTodos = async (req, res) => {
  const todos = await todoService.getTodos(req.user.id);
  res.json({ data: todos });
};

// services/todoService.js
const todoModel = require('../models/todoModel'); // ✓
const { formatDate } = require('../utils/dateUtils'); // ✓

const getTodos = async (userId) => {
  const todos = await todoModel.findByUserId(userId);
  return todos.map(todo => ({
    ...todo,
    dueDate: formatDate(todo.dueDate)
  }));
};
```

**잘못된 의존성**:
```javascript
// models/todoModel.js
const todoService = require('../services/todoService'); // ✗ 순환 참조 위험

const findByUserId = async (userId) => {
  const todos = await db.query('SELECT * FROM todos WHERE userId = $1', [userId]);
  return todoService.processTodos(todos); // ✗ Model이 Service를 호출하면 안됨
};
```

### 2.3 순환 참조 방지

**문제 상황**:
```javascript
// A.js
const B = require('./B');
module.exports = { funcA: () => B.funcB() };

// B.js
const A = require('./A');
module.exports = { funcB: () => A.funcA() }; // 순환 참조!
```

**해결 방법 1 - 공통 모듈 추출**:
```javascript
// shared.js
module.exports = {
  commonFunc: () => { /* ... */ }
};

// A.js
const { commonFunc } = require('./shared');
module.exports = { funcA: () => commonFunc() };

// B.js
const { commonFunc } = require('./shared');
module.exports = { funcB: () => commonFunc() };
```

**해결 방법 2 - 의존성 주입**:
```javascript
// A.js
module.exports = (dependencies) => ({
  funcA: () => dependencies.funcB()
});

// B.js
module.exports = {
  funcB: () => { /* ... */ }
};

// index.js
const B = require('./B');
const A = require('./A')({ funcB: B.funcB });
```

### 2.4 인터페이스 분리 원칙

각 모듈은 명확한 Public API를 제공합니다.

**좋은 예시**:
```javascript
// services/todoService.js
// 명확하고 최소한의 public API만 export
module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  restoreTodo
};

// 내부 헬퍼 함수는 export하지 않음
function validateTodoData(data) { /* ... */ }
function formatTodoResponse(todo) { /* ... */ }
```

**나쁜 예시**:
```javascript
// services/todoService.js
// 너무 많은 것을 export
module.exports = {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  // 내부 구현까지 노출
  validateTodoData,
  formatTodoResponse,
  _privateHelper,
  _internalCache,
  _dbConnection
};
```

---

## 3. 코드/네이밍 원칙

### 3.1 네이밍 컨벤션

#### 변수 및 함수명

**JavaScript/Node.js**:
- **camelCase** 사용
- 동사 + 명사 조합 (함수의 경우)
- 명사 또는 형용사 (변수의 경우)

```javascript
// 좋은 예시
const userId = '123';
const isCompleted = false;
const todoList = [];

function getTodoById(id) { }
function createTodo(data) { }
function validateEmail(email) { }

// 나쁜 예시
const UserID = '123';          // PascalCase는 클래스용
const is_completed = false;    // snake_case는 JS에서 사용 안함
const todo_list = [];

function GetTodoById(id) { }   // PascalCase는 클래스용
function create(data) { }      // 너무 모호함
function valid_email(email) { } // snake_case 사용 안함
```

**Boolean 변수**:
```javascript
// is, has, can, should 등의 prefix 사용
const isLoading = true;
const hasError = false;
const canEdit = true;
const shouldUpdate = false;
```

**상수**:
```javascript
// 대문자 + 언더스코어
const MAX_TITLE_LENGTH = 200;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;
```

#### 클래스 및 컴포넌트명

**PascalCase** 사용:
```javascript
// React Components
function TodoList() { }
function TodoItem() { }
function CalendarView() { }

// Classes
class TodoService { }
class UserRepository { }
class AuthMiddleware { }
```

#### 파일명

**프론트엔드 (React)**:
- 컴포넌트: PascalCase (TodoList.jsx)
- Hook: camelCase (useTodos.js)
- 유틸리티: camelCase (dateUtils.js)
- Store: camelCase (todoStore.js)
- Service: camelCase (todoService.js)

```
components/
  ├── TodoList.jsx          // React Component
  ├── TodoItem.jsx
  └── Calendar.jsx

hooks/
  ├── useTodos.js           // Custom Hook
  └── useAuth.js

utils/
  ├── dateUtils.js          // Utility
  └── formatters.js

stores/
  └── todoStore.js          // Zustand Store
```

**백엔드 (Node.js)**:
- 모든 파일: camelCase
- 명확한 suffix 사용 (Controller, Service, Model, etc.)

```
src/
  ├── controllers/
  │   ├── todoController.js
  │   └── authController.js
  ├── services/
  │   ├── todoService.js
  │   └── authService.js
  ├── models/
  │   ├── todoModel.js
  │   └── userModel.js
  └── routes/
      ├── todoRoutes.js
      └── authRoutes.js
```

### 3.2 코드 스타일 가이드

#### 들여쓰기 및 포맷팅

```javascript
// 2 spaces 들여쓰기 (Prettier 기본값)
function getTodos(userId, filters) {
  const todos = await fetchTodos(userId);

  if (filters.isCompleted !== undefined) {
    return todos.filter(t => t.isCompleted === filters.isCompleted);
  }

  return todos;
}

// 한 줄당 최대 80-100자
// 긴 체이닝은 줄바꿈
const filteredTodos = todos
  .filter(todo => !todo.isDeleted)
  .filter(todo => todo.userId === currentUserId)
  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
```

#### 중괄호 규칙

```javascript
// 항상 중괄호 사용 (조건문이 한 줄이어도)
if (isCompleted) {
  updateCount();
}

// 나쁜 예시
if (isCompleted) updateCount(); // 가독성 떨어짐
```

#### 문자열

```javascript
// 템플릿 리터럴 사용
const message = `할 일 ${todo.title}이 완료되었습니다.`;

// 단순 문자열은 작은따옴표
const status = 'pending';
```

#### 함수 선언

```javascript
// Named function (재사용 가능)
function calculateDueDate(startDate, days) {
  return new Date(startDate.getTime() + days * 86400000);
}

// Arrow function (콜백, 간단한 로직)
const getTodoIds = (todos) => todos.map(t => t.todoId);

// Async/await 사용
async function fetchTodos(userId) {
  try {
    const response = await apiClient.get(`/todos?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    throw error;
  }
}
```

### 3.3 주석 작성 규칙

#### JSDoc 주석

```javascript
/**
 * 사용자의 할 일 목록을 조회합니다.
 *
 * @param {string} userId - 사용자 고유 식별자
 * @param {Object} filters - 필터 옵션
 * @param {boolean} [filters.isCompleted] - 완료 여부 필터
 * @param {string} [filters.startDate] - 시작일 필터
 * @param {string} [filters.endDate] - 종료일 필터
 * @returns {Promise<Array<Todo>>} 할 일 목록
 * @throws {Error} 데이터베이스 조회 실패 시
 */
async function getTodos(userId, filters = {}) {
  // 구현...
}
```

#### 인라인 주석

```javascript
// 필요한 경우에만 작성 (코드가 명확하면 주석 불필요)

// 좋은 예시 - 복잡한 로직 설명
function calculateOverdueDays(dueDate) {
  // 만료일이 없으면 연체 없음
  if (!dueDate) return 0;

  // 오늘 날짜와의 차이를 일 단위로 계산
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

// 나쁜 예시 - 불필요한 주석
function getTodos() {
  // 할 일 목록을 가져옴
  const todos = await todoModel.findAll(); // 모든 할 일 조회

  // 결과를 반환
  return todos; // 할 일 목록 반환
}
```

#### TODO 주석

```javascript
// TODO: 페이지네이션 구현 필요
// FIXME: 동시성 제어 이슈 해결 필요
// HACK: 임시 해결책, 추후 리팩토링 필요
// NOTE: 이 로직은 BR-07 비즈니스 규칙을 따름
```

### 3.4 ESLint/Prettier 설정

#### ESLint 설정 (.eslintrc.json)

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["warn"],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

#### Prettier 설정 (.prettierrc)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## 4. 테스트/품질 원칙

### 4.1 테스트 전략

#### 테스트 피라미드

```
         /\
        /  \       E2E Tests (10%)
       /____\      - 주요 사용자 플로우
      /      \
     /________\    Integration Tests (30%)
    /          \   - API 통합, DB 연동
   /____________\
  /              \ Unit Tests (60%)
 /________________\ - 함수, 컴포넌트, 서비스
```

#### 레이어별 테스트 전략

**프론트엔드**:
- **Unit Tests**: 개별 컴포넌트, 커스텀 훅, 유틸리티 함수
- **Integration Tests**: 페이지 단위, API 통합
- **E2E Tests**: 주요 사용자 시나리오 (로그인 → 할 일 생성 → 완료)

**백엔드**:
- **Unit Tests**: Service, Model, Utility 함수
- **Integration Tests**: API 엔드포인트, DB 쿼리
- **E2E Tests**: 전체 API 플로우

### 4.2 테스트 작성 가이드

#### Unit Test 예시 (Jest)

**프론트엔드 컴포넌트 테스트**:
```javascript
// __tests__/components/TodoItem.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '../components/TodoItem';

describe('TodoItem', () => {
  const mockTodo = {
    todoId: '1',
    title: 'Test Todo',
    isCompleted: false,
    dueDate: '2025-12-31'
  };

  it('should render todo title', () => {
    render(<TodoItem todo={mockTodo} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox is clicked', () => {
    const onToggle = jest.fn();
    render(<TodoItem todo={mockTodo} onToggle={onToggle} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('should show overdue indicator when past due date', () => {
    const overdueTodo = { ...mockTodo, dueDate: '2020-01-01' };
    render(<TodoItem todo={overdueTodo} />);

    expect(screen.getByText(/연체/i)).toBeInTheDocument();
  });
});
```

**백엔드 Service 테스트**:
```javascript
// __tests__/services/todoService.test.js
const todoService = require('../services/todoService');
const todoModel = require('../models/todoModel');

jest.mock('../models/todoModel');

describe('TodoService', () => {
  describe('getTodos', () => {
    it('should return user todos excluding deleted ones', async () => {
      const mockTodos = [
        { todoId: '1', title: 'Todo 1', isDeleted: false },
        { todoId: '2', title: 'Todo 2', isDeleted: true },
        { todoId: '3', title: 'Todo 3', isDeleted: false }
      ];

      todoModel.findByUserId.mockResolvedValue(mockTodos);

      const result = await todoService.getTodos('user123');

      expect(result).toHaveLength(2);
      expect(result[0].todoId).toBe('1');
      expect(result[1].todoId).toBe('3');
    });

    it('should throw error when userId is invalid', async () => {
      await expect(todoService.getTodos(null))
        .rejects
        .toThrow('Invalid userId');
    });
  });

  describe('createTodo', () => {
    it('should validate required fields', async () => {
      const invalidTodo = { description: 'No title' };

      await expect(todoService.createTodo('user123', invalidTodo))
        .rejects
        .toThrow('Title is required');
    });

    it('should validate title length', async () => {
      const longTitle = 'a'.repeat(201);
      const invalidTodo = { title: longTitle };

      await expect(todoService.createTodo('user123', invalidTodo))
        .rejects
        .toThrow('Title must be less than 200 characters');
    });
  });
});
```

#### Integration Test 예시

**API 통합 테스트**:
```javascript
// __tests__/integration/todos.test.js
const request = require('supertest');
const app = require('../app');
const { setupTestDb, teardownTestDb } = require('./helpers/db');

describe('Todo API Integration Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await setupTestDb();

    // 테스트 사용자 생성 및 로그인
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = response.body.token;
    userId = response.body.userId;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Todo',
          description: 'Test Description',
          dueDate: '2025-12-31'
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('todoId');
      expect(response.body.data.title).toBe('Test Todo');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/todos')
        .send({ title: 'Test Todo' })
        .expect(401);
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body.error).toMatch(/title/i);
    });
  });
});
```

### 4.3 테스트 커버리지 목표

| 레이어            | 목표 커버리지 | 우선순위 |
| ----------------- | ------------- | -------- |
| Services          | 90%+          | High     |
| Models            | 80%+          | High     |
| Controllers       | 70%+          | Medium   |
| Utils             | 90%+          | High     |
| Components        | 70%+          | Medium   |
| Hooks             | 80%+          | High     |
| Routes/Middleware | 80%+          | High     |

**커버리지 측정**:
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/**/*.test.{js,jsx}",
      "!src/index.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

### 4.4 코드 리뷰 프로세스

#### 리뷰 체크리스트

**기능성**:
- [ ] 요구사항을 충족하는가?
- [ ] 비즈니스 규칙을 준수하는가?
- [ ] 엣지 케이스를 처리하는가?

**코드 품질**:
- [ ] 코드가 읽기 쉽고 이해하기 쉬운가?
- [ ] 네이밍이 명확하고 일관성 있는가?
- [ ] 중복 코드가 없는가?
- [ ] 함수/컴포넌트가 단일 책임을 가지는가?

**테스트**:
- [ ] 적절한 테스트가 작성되었는가?
- [ ] 테스트가 의미 있는가?
- [ ] 커버리지가 목표를 충족하는가?

**보안**:
- [ ] 입력값 검증이 적절한가?
- [ ] 인증/인가가 적절히 구현되었는가?
- [ ] 민감한 정보가 노출되지 않는가?

**성능**:
- [ ] 불필요한 렌더링/연산이 없는가?
- [ ] 데이터베이스 쿼리가 최적화되었는가?
- [ ] 메모리 누수 가능성이 없는가?

#### Pull Request 템플릿

```markdown
## 변경 사항
<!-- 무엇을 변경했는지 설명 -->

## 변경 이유
<!-- 왜 이 변경이 필요한지 설명 -->

## 관련 이슈
<!-- 관련 이슈 번호: #123 -->

## 테스트 방법
<!-- 어떻게 테스트했는지 설명 -->
1.
2.
3.

## 스크린샷 (UI 변경 시)
<!-- 변경 전/후 스크린샷 -->

## 체크리스트
- [ ] 코드가 프로젝트의 스타일 가이드를 따릅니다
- [ ] 적절한 테스트를 추가했습니다
- [ ] 문서를 업데이트했습니다
- [ ] 변경사항이 기존 기능을 깨뜨리지 않습니다
```

### 4.5 CI/CD 품질 게이트

#### GitHub Actions 워크플로우

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

      - name: Check coverage threshold
        run: |
          if [ $(npx coverage-threshold-checker --threshold 70) -eq 0 ]; then
            echo "Coverage threshold met"
          else
            echo "Coverage threshold not met"
            exit 1
          fi

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v3

      - name: Build application
        run: npm run build

      - name: Check build size
        run: |
          SIZE=$(du -sh build | cut -f1)
          echo "Build size: $SIZE"
```

---

## 5. 설정/보안/운영 원칙

### 5.1 환경 변수 관리

#### 환경 변수 구조

**프론트엔드 (.env.example)**:
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=cjy-todoList

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false

# 주의: 민감한 정보는 프론트엔드 환경 변수에 넣지 않음
```

**백엔드 (.env.example)**:
```bash
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/todolist
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret_here_minimum_32_characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log
```

#### 환경별 설정

```javascript
// config/environments.js
const environments = {
  development: {
    apiUrl: 'http://localhost:3001/api',
    logLevel: 'debug',
    enableDebugTools: true
  },
  production: {
    apiUrl: 'https://api.cjy-todolist.com',
    logLevel: 'error',
    enableDebugTools: false
  },
  test: {
    apiUrl: 'http://localhost:3001/api',
    logLevel: 'silent',
    enableDebugTools: false
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = environments[env];
```

#### 설정 로드 패턴

```javascript
// config/index.js
require('dotenv').config();

const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production'
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
  },

  security: {
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  }
};

// 필수 환경 변수 검증
function validateConfig() {
  const required = [
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'DATABASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateConfig();

module.exports = config;
```

### 5.2 시크릿 관리

#### 시크릿 관리 원칙

1. **절대 커밋하지 않기**: .env 파일을 .gitignore에 추가
2. **로컬 개발**: .env 파일 사용
3. **프로덕션**: Vercel/Supabase 환경 변수 사용
4. **팀 공유**: 암호화된 채널을 통해 공유

**.gitignore**:
```
# Environment variables
.env
.env.local
.env.development
.env.production

# Secrets
secrets/
*.key
*.pem
```

#### 시크릿 로테이션

```javascript
// scripts/rotateSecrets.js
// JWT Secret 로테이션 시 고려사항
const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// 새 시크릿 생성
const newJwtSecret = generateSecret();
const newRefreshSecret = generateSecret();

console.log('New JWT Secret:', newJwtSecret);
console.log('New Refresh Token Secret:', newRefreshSecret);

// 주의: 로테이션 시 기존 토큰 처리 전략 필요
// 1. Dual-token period: 양쪽 시크릿으로 검증
// 2. 점진적 마이그레이션: 새 시크릿으로 발급, 구 시크릿으로도 검증
```

### 5.3 로깅 전략

#### 로깅 레벨

```javascript
// utils/logger.js
const winston = require('winston');

const levels = {
  error: 0,   // 시스템 오류, 즉시 조치 필요
  warn: 1,    // 경고, 주의 필요
  info: 2,    // 중요 이벤트 (로그인, 생성 등)
  http: 3,    // HTTP 요청/응답
  debug: 4    // 디버깅 정보
};

const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // 파일 저장 (에러만)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),

    // 파일 저장 (모든 로그)
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

module.exports = logger;
```

#### 로깅 사용 예시

```javascript
// controllers/todoController.js
const logger = require('../utils/logger');

const createTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const todoData = req.body;

    logger.info('Creating todo', {
      userId,
      title: todoData.title,
      action: 'CREATE_TODO'
    });

    const todo = await todoService.createTodo(userId, todoData);

    logger.info('Todo created successfully', {
      userId,
      todoId: todo.todoId,
      action: 'CREATE_TODO_SUCCESS'
    });

    res.status(201).json({ data: todo });
  } catch (error) {
    logger.error('Failed to create todo', {
      userId: req.user.id,
      error: error.message,
      stack: error.stack,
      action: 'CREATE_TODO_FAILURE'
    });

    res.status(500).json({ error: 'Failed to create todo' });
  }
};
```

#### 민감 정보 마스킹

```javascript
// utils/logger.js
function sanitizeLog(data) {
  const sensitiveFields = ['password', 'token', 'secret', 'authorization'];

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

// 사용
logger.info('User login', sanitizeLog({ username, password }));
// Output: { username: 'john', password: '***REDACTED***' }
```

### 5.4 에러 핸들링

#### 에러 클래스 정의

```javascript
// utils/errors.js

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};
```

#### 에러 핸들링 미들웨어

```javascript
// middlewares/errorHandler.js
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  // 로깅
  if (err.isOperational) {
    logger.warn('Operational error', {
      error: err.message,
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method
    });
  } else {
    logger.error('Unexpected error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // 응답
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    error: {
      message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
```

#### 에러 사용 예시

```javascript
// services/todoService.js
const { ValidationError, NotFoundError, AuthorizationError } = require('../utils/errors');

const getTodoById = async (userId, todoId) => {
  // 입력 검증
  if (!todoId) {
    throw new ValidationError('Todo ID is required');
  }

  const todo = await todoModel.findById(todoId);

  // 존재 확인
  if (!todo) {
    throw new NotFoundError('Todo');
  }

  // 권한 확인
  if (todo.userId !== userId && !todo.isPublicHoliday) {
    throw new AuthorizationError('You do not have permission to access this todo');
  }

  return todo;
};
```

#### 전역 에러 처리

```javascript
// app.js
const errorHandler = require('./middlewares/errorHandler');

// ... 라우트 정의 ...

// 404 에러 처리
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      path: req.path
    }
  });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// 처리되지 않은 에러
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
```

### 5.5 보안 체크리스트

#### 인증/인가

- [ ] JWT 토큰 사용 (Access + Refresh)
- [ ] 토큰 만료 시간 적절히 설정 (Access: 15분, Refresh: 7일)
- [ ] 비밀번호 bcrypt 암호화 (최소 10 rounds)
- [ ] 민감한 경로에 인증 미들웨어 적용
- [ ] 사용자 권한 검증 (자신의 리소스만 접근)

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');
const config = require('../config');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.auth.jwtSecret);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token'));
    }
    next(error);
  }
};

module.exports = { authenticate };
```

#### 입력 검증

- [ ] 모든 사용자 입력 검증
- [ ] SQL Injection 방지 (Prepared Statements)
- [ ] XSS 방지 (입력 이스케이프)
- [ ] 파일 크기 제한
- [ ] 데이터 타입 검증

```javascript
// validators/todoValidator.js
const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validateTodoCreate = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be less than 200 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters')
    .escape(),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid due date format')
    .custom((dueDate, { req }) => {
      if (req.body.startDate && new Date(dueDate) < new Date(req.body.startDate)) {
        throw new Error('Due date cannot be before start date');
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }
    next();
  }
];

module.exports = { validateTodoCreate };
```

#### Rate Limiting

```javascript
// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const config = require('../config');

const apiLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // 15분
  max: config.security.rateLimitMaxRequests,    // 100 요청
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5,                   // 5번 시도
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

module.exports = { apiLimiter, authLimiter };
```

#### CORS 설정

```javascript
// middlewares/cors.js
const cors = require('cors');
const config = require('../config');

const corsOptions = {
  origin: (origin, callback) => {
    // 허용된 origin 목록
    const allowedOrigins = config.security.corsOrigin;

    // 개발 환경에서는 origin이 없을 수 있음 (Postman 등)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);
```

#### 보안 헤더

```javascript
// middlewares/security.js
const helmet = require('helmet');

// Helmet을 사용한 보안 헤더 설정
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = { securityHeaders };
```

#### SQL Injection 방지

```javascript
// models/todoModel.js
// Parameterized queries 사용
const db = require('../config/database');

const findByUserId = async (userId) => {
  // 안전: Prepared statement 사용
  const query = 'SELECT * FROM todos WHERE userId = $1 AND isDeleted = false';
  const result = await db.query(query, [userId]);
  return result.rows;
};

// 위험한 방식 (절대 사용하지 말 것)
const unsafeFindByUserId = async (userId) => {
  // 위험: SQL Injection 취약
  const query = `SELECT * FROM todos WHERE userId = '${userId}'`;
  const result = await db.query(query);
  return result.rows;
};
```

---

## 6. 프론트엔드 디렉토리 구조

### 6.1 전체 구조

```
frontend/
├── public/                    # 정적 파일
│   ├── index.html
│   ├── favicon.ico
│   └── assets/                # 이미지, 폰트 등
│       ├── images/
│       │   ├── logo.png
│       │   └── icons/
│       └── fonts/
│
├── src/
│   ├── main.jsx               # 애플리케이션 진입점
│   ├── App.jsx                # 루트 컴포넌트
│   │
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Button.test.jsx
│   │   │   │   └── index.js
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Loading/
│   │   │   └── ErrorBoundary/
│   │   │
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── Navigation/
│   │   │
│   │   └── features/          # 기능별 컴포넌트
│   │       ├── Todo/
│   │       │   ├── TodoList/
│   │       │   │   ├── TodoList.jsx
│   │       │   │   ├── TodoList.test.jsx
│   │       │   │   └── index.js
│   │       │   ├── TodoItem/
│   │       │   ├── TodoForm/
│   │       │   └── TodoFilter/
│   │       │
│   │       ├── Calendar/
│   │       │   ├── CalendarView/
│   │       │   ├── CalendarCell/
│   │       │   └── CalendarHeader/
│   │       │
│   │       └── Trash/
│   │           ├── TrashList/
│   │           └── TrashItem/
│   │
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── HomePage/
│   │   │   ├── HomePage.jsx
│   │   │   └── index.js
│   │   ├── LoginPage/
│   │   ├── RegisterPage/
│   │   ├── TodosPage/
│   │   ├── CalendarPage/
│   │   ├── TrashPage/
│   │   └── NotFoundPage/
│   │
│   ├── hooks/                 # 커스텀 훅
│   │   ├── useTodos.js
│   │   ├── useAuth.js
│   │   ├── useCalendar.js
│   │   ├── useDebounce.js
│   │   └── useLocalStorage.js
│   │
│   ├── stores/                # Zustand 상태 관리
│   │   ├── todoStore.js
│   │   ├── authStore.js
│   │   ├── uiStore.js
│   │   └── index.js
│   │
│   ├── services/              # API 호출 서비스
│   │   ├── api.js             # axios 인스턴스 설정
│   │   ├── todoService.js
│   │   ├── authService.js
│   │   ├── calendarService.js
│   │   └── trashService.js
│   │
│   ├── utils/                 # 유틸리티 함수
│   │   ├── dateUtils.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── helpers.js
│   │
│   ├── constants/             # 상수 정의
│   │   ├── routes.js
│   │   ├── apiEndpoints.js
│   │   ├── messages.js
│   │   └── config.js
│   │
│   ├── types/                 # TypeScript 타입 (향후)
│   │   ├── todo.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   └── styles/                # 글로벌 스타일
│       ├── index.css
│       ├── tailwind.css
│       └── variables.css
│
├── __tests__/                 # 테스트 파일
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── utils/
│
├── .env.example               # 환경 변수 예시
├── .eslintrc.json             # ESLint 설정
├── .prettierrc                # Prettier 설정
├── vite.config.js             # Vite 설정
├── tailwind.config.js         # Tailwind CSS 설정
├── package.json
└── README.md
```

### 6.2 컴포넌트 구조 원칙

#### 컴포넌트 분류

**1. Common Components (공통 컴포넌트)**:
- 프로젝트 전체에서 재사용 가능
- 도메인 로직 없음
- 예: Button, Input, Modal, Loading

**2. Layout Components (레이아웃 컴포넌트)**:
- 페이지 구조 담당
- 예: Header, Footer, Sidebar

**3. Feature Components (기능 컴포넌트)**:
- 특정 기능에 종속
- 도메인 로직 포함
- 예: TodoList, CalendarView

**4. Page Components (페이지 컴포넌트)**:
- 라우트와 1:1 매핑
- 데이터 fetching 및 상태 관리
- 예: TodosPage, CalendarPage

#### 컴포넌트 패턴

**컨테이너/프레젠테이션 분리**:
```javascript
// containers/TodoListContainer.jsx
// 데이터 fetching 및 로직 처리
import { useTodos } from '../../hooks/useTodos';
import TodoList from '../../components/features/Todo/TodoList';

const TodoListContainer = () => {
  const { todos, loading, error, createTodo, updateTodo, deleteTodo } = useTodos();

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <TodoList
      todos={todos}
      onCreateTodo={createTodo}
      onUpdateTodo={updateTodo}
      onDeleteTodo={deleteTodo}
    />
  );
};

// components/features/Todo/TodoList.jsx
// 순수 프레젠테이션 컴포넌트
const TodoList = ({ todos, onCreateTodo, onUpdateTodo, onDeleteTodo }) => {
  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <TodoItem
          key={todo.todoId}
          todo={todo}
          onUpdate={onUpdateTodo}
          onDelete={onDeleteTodo}
        />
      ))}
    </ul>
  );
};
```

### 6.3 상태 관리 (Zustand)

#### Store 구조

```javascript
// stores/todoStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { todoService } from '../services/todoService';

const useTodoStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        todos: [],
        loading: false,
        error: null,
        filter: 'all',

        // Actions
        setTodos: (todos) => set({ todos }),

        setLoading: (loading) => set({ loading }),

        setError: (error) => set({ error }),

        setFilter: (filter) => set({ filter }),

        // Async Actions
        fetchTodos: async () => {
          set({ loading: true, error: null });
          try {
            const todos = await todoService.getAll();
            set({ todos, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },

        createTodo: async (todoData) => {
          try {
            const newTodo = await todoService.create(todoData);
            set((state) => ({
              todos: [...state.todos, newTodo]
            }));
            return newTodo;
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },

        updateTodo: async (todoId, updates) => {
          try {
            const updated = await todoService.update(todoId, updates);
            set((state) => ({
              todos: state.todos.map(t =>
                t.todoId === todoId ? { ...t, ...updated } : t
              )
            }));
            return updated;
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },

        deleteTodo: async (todoId) => {
          try {
            await todoService.delete(todoId);
            set((state) => ({
              todos: state.todos.filter(t => t.todoId !== todoId)
            }));
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },

        // Selectors (computed values)
        getFilteredTodos: () => {
          const { todos, filter } = get();
          switch (filter) {
            case 'completed':
              return todos.filter(t => t.isCompleted);
            case 'active':
              return todos.filter(t => !t.isCompleted);
            default:
              return todos;
          }
        }
      }),
      {
        name: 'todo-storage',
        partialize: (state) => ({
          // persist할 state만 선택
          todos: state.todos,
          filter: state.filter
        })
      }
    )
  )
);

export default useTodoStore;
```

### 6.4 API 서비스 레이어

```javascript
// services/api.js
// Axios 인스턴스 설정
import axios from 'axios';
import { authStore } from '../stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 && 토큰 갱신 시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authStore.getState().refreshToken;
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { token } = response.data;

        authStore.getState().setToken(token);
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

```javascript
// services/todoService.js
import apiClient from './api';

export const todoService = {
  // 할 일 목록 조회
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/todos?${params}`);
    return response.data.data;
  },

  // 할 일 상세 조회
  getById: async (todoId) => {
    const response = await apiClient.get(`/todos/${todoId}`);
    return response.data.data;
  },

  // 할 일 생성
  create: async (todoData) => {
    const response = await apiClient.post('/todos', todoData);
    return response.data.data;
  },

  // 할 일 수정
  update: async (todoId, updates) => {
    const response = await apiClient.put(`/todos/${todoId}`, updates);
    return response.data.data;
  },

  // 할 일 완료 토글
  toggleComplete: async (todoId) => {
    const response = await apiClient.patch(`/todos/${todoId}/complete`);
    return response.data.data;
  },

  // 할 일 삭제
  delete: async (todoId) => {
    await apiClient.delete(`/todos/${todoId}`);
  },

  // 캘린더 조회
  getCalendar: async (year, month) => {
    const response = await apiClient.get(`/calendar?year=${year}&month=${month}`);
    return response.data.data;
  }
};
```

### 6.5 커스텀 훅

```javascript
// hooks/useTodos.js
import { useEffect } from 'react';
import useTodoStore from '../stores/todoStore';

export const useTodos = (filters = {}) => {
  const {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    getFilteredTodos
  } = useTodoStore();

  useEffect(() => {
    fetchTodos(filters);
  }, [fetchTodos, JSON.stringify(filters)]);

  return {
    todos: getFilteredTodos(),
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    refetch: () => fetchTodos(filters)
  };
};

// hooks/useAuth.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, register } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      navigate('/todos');
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    register
  };
};

// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

### 6.6 라우팅 구조

```javascript
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodosPage from './pages/TodosPage';
import CalendarPage from './pages/CalendarPage';
import TrashPage from './pages/TrashPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route
            path="/todos"
            element={
              <ProtectedRoute>
                <TodosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trash"
            element={
              <ProtectedRoute>
                <TrashPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 7. 백엔드 디렉토리 구조

### 7.1 전체 구조

```
backend/
├── src/
│   ├── app.js                 # Express 앱 설정
│   ├── server.js              # 서버 시작 진입점
│   │
│   ├── config/                # 설정 파일
│   │   ├── index.js           # 전역 설정
│   │   ├── database.js        # DB 연결 설정
│   │   └── environments.js    # 환경별 설정
│   │
│   ├── controllers/           # 요청 처리 컨트롤러
│   │   ├── authController.js
│   │   ├── todoController.js
│   │   ├── trashController.js
│   │   ├── calendarController.js
│   │   └── userController.js
│   │
│   ├── services/              # 비즈니스 로직
│   │   ├── authService.js
│   │   ├── todoService.js
│   │   ├── trashService.js
│   │   ├── calendarService.js
│   │   ├── userService.js
│   │   └── tokenService.js
│   │
│   ├── models/                # 데이터 접근 레이어
│   │   ├── index.js           # 모델 통합
│   │   ├── userModel.js
│   │   ├── todoModel.js
│   │   └── db.js              # DB 연결 풀
│   │
│   ├── routes/                # API 라우팅
│   │   ├── index.js           # 라우트 통합
│   │   ├── authRoutes.js
│   │   ├── todoRoutes.js
│   │   ├── trashRoutes.js
│   │   ├── calendarRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── middlewares/           # 미들웨어
│   │   ├── auth.js            # 인증 미들웨어
│   │   ├── errorHandler.js    # 에러 핸들링
│   │   ├── validator.js       # 입력 검증
│   │   ├── rateLimiter.js     # Rate limiting
│   │   ├── cors.js            # CORS 설정
│   │   ├── security.js        # 보안 헤더
│   │   └── logger.js          # 요청 로깅
│   │
│   ├── validators/            # 입력 검증 스키마
│   │   ├── authValidator.js
│   │   ├── todoValidator.js
│   │   └── userValidator.js
│   │
│   ├── utils/                 # 유틸리티 함수
│   │   ├── errors.js          # 커스텀 에러 클래스
│   │   ├── logger.js          # 로깅 유틸리티
│   │   ├── dateUtils.js       # 날짜 유틸리티
│   │   ├── validators.js      # 검증 헬퍼
│   │   └── helpers.js         # 기타 헬퍼
│   │
│   └── scripts/               # 스크립트
│       ├── seed.js            # DB 시딩
│       ├── migrate.js         # 마이그레이션
│       └── setupAdmin.js      # 관리자 생성
│
├── tests/                     # 테스트
│   ├── unit/                  # 단위 테스트
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── integration/           # 통합 테스트
│   │   ├── api/
│   │   └── db/
│   ├── e2e/                   # E2E 테스트
│   └── helpers/               # 테스트 헬퍼
│       ├── db.js
│       ├── fixtures.js
│       └── setup.js
│
├── logs/                      # 로그 파일
│   ├── error.log
│   └── combined.log
│
├── .env.example               # 환경 변수 예시
├── .eslintrc.json             # ESLint 설정
├── .prettierrc                # Prettier 설정
├── jest.config.js             # Jest 설정
├── package.json
└── README.md
```

### 7.2 레이어별 상세 구조

#### 7.2.1 Controllers (컨트롤러)

**책임**:
- HTTP 요청/응답 처리
- 요청 파라미터 추출
- 서비스 레이어 호출
- 응답 포맷팅

```javascript
// controllers/todoController.js
const todoService = require('../services/todoService');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 할 일 목록 조회
 * GET /api/todos
 */
const getTodos = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const filters = {
      isCompleted: req.query.isCompleted,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search
    };

    logger.info('Fetching todos', { userId, filters });

    const todos = await todoService.getTodos(userId, filters);

    res.status(200).json({
      success: true,
      data: todos,
      count: todos.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할 일 생성
 * POST /api/todos
 */
const createTodo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const todoData = req.body;

    logger.info('Creating todo', { userId, title: todoData.title });

    const todo = await todoService.createTodo(userId, todoData);

    res.status(201).json({
      success: true,
      data: todo,
      message: 'Todo created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할 일 수정
 * PUT /api/todos/:id
 */
const updateTodo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;
    const updates = req.body;

    logger.info('Updating todo', { userId, todoId });

    const todo = await todoService.updateTodo(userId, todoId, updates);

    res.status(200).json({
      success: true,
      data: todo,
      message: 'Todo updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할 일 삭제 (휴지통으로 이동)
 * DELETE /api/todos/:id
 */
const deleteTodo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const todoId = req.params.id;

    logger.info('Deleting todo', { userId, todoId });

    await todoService.deleteTodo(userId, todoId);

    res.status(200).json({
      success: true,
      message: 'Todo moved to trash'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo
};
```

#### 7.2.2 Services (서비스)

**책임**:
- 비즈니스 로직 구현
- 데이터 검증
- 트랜잭션 관리
- 여러 모델 조정

```javascript
// services/todoService.js
const todoModel = require('../models/todoModel');
const { ValidationError, NotFoundError, AuthorizationError } = require('../utils/errors');
const { isValidDate } = require('../utils/validators');

class TodoService {
  /**
   * 사용자의 할 일 목록 조회
   */
  async getTodos(userId, filters = {}) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // 사용자의 할 일 + 국경일 조회
    let todos = await todoModel.findByUserId(userId);

    // 필터 적용
    if (filters.isCompleted !== undefined) {
      const isCompleted = filters.isCompleted === 'true';
      todos = todos.filter(t => t.isCompleted === isCompleted);
    }

    if (filters.startDate) {
      todos = todos.filter(t =>
        t.dueDate && new Date(t.dueDate) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      todos = todos.filter(t =>
        t.dueDate && new Date(t.dueDate) <= new Date(filters.endDate)
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      todos = todos.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }

    return todos;
  }

  /**
   * 할 일 상세 조회
   */
  async getTodoById(userId, todoId) {
    if (!todoId) {
      throw new ValidationError('Todo ID is required');
    }

    const todo = await todoModel.findById(todoId);

    if (!todo) {
      throw new NotFoundError('Todo');
    }

    // 권한 확인 (본인 소유 또는 국경일)
    if (todo.userId !== userId && !todo.isPublicHoliday) {
      throw new AuthorizationError('You do not have permission to access this todo');
    }

    return todo;
  }

  /**
   * 할 일 생성
   */
  async createTodo(userId, todoData) {
    // 데이터 검증
    this._validateTodoData(todoData);

    // 날짜 검증
    if (todoData.startDate && todoData.dueDate) {
      if (new Date(todoData.dueDate) < new Date(todoData.startDate)) {
        throw new ValidationError('Due date cannot be before start date');
      }
    }

    const newTodo = {
      userId,
      title: todoData.title.trim(),
      description: todoData.description?.trim() || null,
      startDate: todoData.startDate || null,
      dueDate: todoData.dueDate || null,
      isCompleted: false,
      isPublicHoliday: false,
      isDeleted: false
    };

    return await todoModel.create(newTodo);
  }

  /**
   * 할 일 수정
   */
  async updateTodo(userId, todoId, updates) {
    // 권한 및 존재 확인
    const existingTodo = await this.getTodoById(userId, todoId);

    // 본인 소유만 수정 가능
    if (existingTodo.userId !== userId) {
      throw new AuthorizationError('You can only update your own todos');
    }

    // 완료된 할 일은 수정 불가 (BR-15, C-15)
    if (existingTodo.isCompleted) {
      throw new ValidationError('Cannot update completed todo');
    }

    // 업데이트 데이터 검증
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.trim().length === 0) {
        throw new ValidationError('Title cannot be empty');
      }
      if (updates.title.length > 200) {
        throw new ValidationError('Title must be less than 200 characters');
      }
    }

    if (updates.description !== undefined && updates.description.length > 2000) {
      throw new ValidationError('Description must be less than 2000 characters');
    }

    // 날짜 검증
    const startDate = updates.startDate !== undefined ? updates.startDate : existingTodo.startDate;
    const dueDate = updates.dueDate !== undefined ? updates.dueDate : existingTodo.dueDate;

    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      throw new ValidationError('Due date cannot be before start date');
    }

    return await todoModel.update(todoId, updates);
  }

  /**
   * 할 일 삭제 (소프트 삭제)
   */
  async deleteTodo(userId, todoId) {
    // 권한 확인
    const todo = await this.getTodoById(userId, todoId);

    if (todo.userId !== userId) {
      throw new AuthorizationError('You can only delete your own todos');
    }

    // 완료된 할 일은 삭제 불가 (C-15)
    if (todo.isCompleted) {
      throw new ValidationError('Cannot delete completed todo');
    }

    // 소프트 삭제
    return await todoModel.softDelete(todoId);
  }

  /**
   * 할 일 완료 토글
   */
  async toggleComplete(userId, todoId) {
    const todo = await this.getTodoById(userId, todoId);

    if (todo.userId !== userId) {
      throw new AuthorizationError('You can only complete your own todos');
    }

    return await todoModel.update(todoId, {
      isCompleted: !todo.isCompleted
    });
  }

  /**
   * 데이터 검증 (private)
   */
  _validateTodoData(data) {
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Title is required');
    }

    if (data.title.length > 200) {
      throw new ValidationError('Title must be less than 200 characters');
    }

    if (data.description && data.description.length > 2000) {
      throw new ValidationError('Description must be less than 2000 characters');
    }

    if (data.startDate && !isValidDate(data.startDate)) {
      throw new ValidationError('Invalid start date format');
    }

    if (data.dueDate && !isValidDate(data.dueDate)) {
      throw new ValidationError('Invalid due date format');
    }
  }
}

module.exports = new TodoService();
```

#### 7.2.3 Models (모델)

**책임**:
- 데이터베이스 CRUD 작업
- SQL 쿼리 실행
- 데이터 매핑

```javascript
// models/todoModel.js
const db = require('./db');

class TodoModel {
  /**
   * 사용자의 할 일 조회 (국경일 포함)
   */
  async findByUserId(userId) {
    const query = `
      SELECT * FROM todos
      WHERE (userId = $1 OR (userId IS NULL AND isPublicHoliday = true))
        AND isDeleted = false
      ORDER BY
        CASE WHEN dueDate IS NULL THEN 1 ELSE 0 END,
        dueDate ASC,
        createdAt DESC
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * ID로 할 일 조회
   */
  async findById(todoId) {
    const query = 'SELECT * FROM todos WHERE todoId = $1';
    const result = await db.query(query, [todoId]);
    return result.rows[0] || null;
  }

  /**
   * 할 일 생성
   */
  async create(todoData) {
    const query = `
      INSERT INTO todos (
        userId, title, description, startDate, dueDate,
        isCompleted, isPublicHoliday, isDeleted
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      todoData.userId,
      todoData.title,
      todoData.description,
      todoData.startDate,
      todoData.dueDate,
      todoData.isCompleted || false,
      todoData.isPublicHoliday || false,
      todoData.isDeleted || false
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * 할 일 수정
   */
  async update(todoId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // 동적 쿼리 생성
    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    // updatedAt 자동 업데이트
    fields.push(`updatedAt = CURRENT_TIMESTAMP`);

    values.push(todoId);

    const query = `
      UPDATE todos
      SET ${fields.join(', ')}
      WHERE todoId = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * 소프트 삭제
   */
  async softDelete(todoId) {
    const query = `
      UPDATE todos
      SET isDeleted = true, deletedAt = CURRENT_TIMESTAMP
      WHERE todoId = $1
      RETURNING *
    `;

    const result = await db.query(query, [todoId]);
    return result.rows[0];
  }

  /**
   * 영구 삭제
   */
  async hardDelete(todoId) {
    const query = 'DELETE FROM todos WHERE todoId = $1';
    await db.query(query, [todoId]);
  }

  /**
   * 휴지통 조회
   */
  async findTrash(userId) {
    const query = `
      SELECT * FROM todos
      WHERE userId = $1 AND isDeleted = true
      ORDER BY deletedAt DESC
    `;

    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * 복구
   */
  async restore(todoId) {
    const query = `
      UPDATE todos
      SET isDeleted = false, deletedAt = NULL
      WHERE todoId = $1
      RETURNING *
    `;

    const result = await db.query(query, [todoId]);
    return result.rows[0];
  }

  /**
   * 날짜 범위로 조회 (캘린더용)
   */
  async findByDateRange(userId, startDate, endDate) {
    const query = `
      SELECT * FROM todos
      WHERE (userId = $1 OR (userId IS NULL AND isPublicHoliday = true))
        AND isDeleted = false
        AND dueDate >= $2
        AND dueDate <= $3
      ORDER BY dueDate ASC
    `;

    const result = await db.query(query, [userId, startDate, endDate]);
    return result.rows;
  }
}

module.exports = new TodoModel();
```

#### 7.2.4 Routes (라우팅)

**책임**:
- URL 경로 정의
- HTTP 메서드 매핑
- 미들웨어 적용
- 컨트롤러 연결

```javascript
// routes/todoRoutes.js
const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { authenticate } = require('../middlewares/auth');
const { validateTodoCreate, validateTodoUpdate } = require('../validators/todoValidator');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

/**
 * @route   GET /api/todos
 * @desc    할 일 목록 조회
 * @access  Private
 */
router.get('/', todoController.getTodos);

/**
 * @route   GET /api/todos/:id
 * @desc    할 일 상세 조회
 * @access  Private
 */
router.get('/:id', todoController.getTodoById);

/**
 * @route   POST /api/todos
 * @desc    할 일 생성
 * @access  Private
 */
router.post('/', validateTodoCreate, todoController.createTodo);

/**
 * @route   PUT /api/todos/:id
 * @desc    할 일 수정
 * @access  Private
 */
router.put('/:id', validateTodoUpdate, todoController.updateTodo);

/**
 * @route   PATCH /api/todos/:id/complete
 * @desc    할 일 완료 토글
 * @access  Private
 */
router.patch('/:id/complete', todoController.toggleComplete);

/**
 * @route   DELETE /api/todos/:id
 * @desc    할 일 삭제 (휴지통으로 이동)
 * @access  Private
 */
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
```

```javascript
// routes/index.js
// 모든 라우트 통합
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const todoRoutes = require('./todoRoutes');
const trashRoutes = require('./trashRoutes');
const calendarRoutes = require('./calendarRoutes');
const userRoutes = require('./userRoutes');

// API 버전 prefix
router.use('/auth', authRoutes);
router.use('/todos', todoRoutes);
router.use('/trash', trashRoutes);
router.use('/calendar', calendarRoutes);
router.use('/users', userRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
```

#### 7.2.5 Middlewares (미들웨어)

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');
const config = require('../config');

/**
 * JWT 토큰 인증 미들웨어
 */
const authenticate = (req, res, next) => {
  try {
    // 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);

    // 토큰 검증
    const decoded = jwt.verify(token, config.auth.jwtSecret);

    // 사용자 정보를 req에 추가
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token'));
    }
    next(error);
  }
};

/**
 * Optional 인증 (토큰이 있으면 검증, 없어도 통과)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.auth.jwtSecret);

      req.user = {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email
      };
    }

    next();
  } catch (error) {
    // 토큰이 유효하지 않아도 통과
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
```

### 7.3 데이터베이스 설정

```javascript
// config/database.js
const { Pool } = require('pg');
const config = require('./index');
const logger = require('../utils/logger');

// Connection pool 생성
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: 20,                    // 최대 연결 수
  idleTimeoutMillis: 30000,   // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000 // 연결 타임아웃
});

// 연결 테스트
pool.on('connect', () => {
  logger.info('Database connected');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err.message });
});

// Query helper with logging
const query = async (text, params) => {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.debug('Executed query', {
      text,
      duration,
      rows: result.rowCount
    });

    return result;
  } catch (error) {
    logger.error('Query error', {
      text,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  transaction,
  pool
};
```

### 7.4 애플리케이션 진입점

```javascript
// app.js
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('./middlewares/cors');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { securityHeaders } = require('./middlewares/security');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

// Security middlewares
app.use(helmet());
app.use(securityHeaders);
app.use(cors);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(logger);

// Rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      path: req.path
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
```

```javascript
// server.js
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const db = require('./models/db');

const PORT = config.server.port;
const HOST = config.server.host;

// Start server
const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running in ${config.server.env} mode on http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  server.close(() => {
    logger.info('HTTP server closed');

    db.pool.end(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');

  server.close(() => {
    logger.info('HTTP server closed');

    db.pool.end(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
});

// Unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  server.close(() => process.exit(1));
});

// Uncaught exception
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  server.close(() => process.exit(1));
});
```

---

## 부록: 파일 명명 규칙

### 컴포넌트 파일

```
TodoList/
  ├── TodoList.jsx        # 메인 컴포넌트
  ├── TodoList.test.jsx   # 테스트
  ├── TodoList.module.css # 스타일 (CSS Modules 사용 시)
  └── index.js            # Export
```

### 서비스/유틸리티 파일

```
services/
  ├── todoService.js      # 서비스
  └── todoService.test.js # 테스트

utils/
  ├── dateUtils.js        # 유틸리티
  └── dateUtils.test.js   # 테스트
```

### 라우트/컨트롤러 파일

```
routes/
  └── todoRoutes.js       # 라우트

controllers/
  ├── todoController.js   # 컨트롤러
  └── todoController.test.js # 테스트
```

### 명명 규칙 요약

| 타입                  | 규칙       | 예시                     |
| --------------------- | ---------- | ------------------------ |
| React 컴포넌트        | PascalCase | TodoList.jsx             |
| 커스텀 훅             | camelCase  | useTodos.js              |
| 서비스/유틸리티       | camelCase  | todoService.js           |
| 컨트롤러              | camelCase  | todoController.js        |
| 모델                  | camelCase  | todoModel.js             |
| 라우트                | camelCase  | todoRoutes.js            |
| 미들웨어              | camelCase  | auth.js, errorHandler.js |
| 상수                  | UPPER_CASE | MAX_TITLE_LENGTH         |
| 테스트 파일           | .test.js   | todoService.test.js      |
| 환경 변수             | UPPER_CASE | DATABASE_URL             |
| CSS Modules           | .module.css | TodoList.module.css     |
| 일반 CSS              | kebab-case | todo-list.css            |

---

## 문서 변경 이력

| 버전 | 날짜       | 작성자                      | 변경 내용 |
| ---- | ---------- | --------------------------- | --------- |
| 1.0  | 2025-11-25 | Claude (Architecture Reviewer) | 초안 작성 |

---

**END OF DOCUMENT**
