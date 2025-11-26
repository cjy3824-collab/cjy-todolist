# cjy-todoList 기술 아키텍처 다이어그램

---

## 문서 정보

| 항목       | 내용                        |
| ---------- | --------------------------- |
| **문서명** | 기술 아키텍처 다이어그램    |
| **버전**   | 1.0                         |
| **작성일** | 2025-11-26                  |
| **작성자** | technical-writer            |
| **상태**   | 완성                        |
| **참고**   | [PRD 문서](./3-prd.md)      |

---

## 개요

이 문서는 cjy-todoList 프로젝트의 기술 아키텍처를 Mermaid 다이어그램으로 시각화합니다.

**기술 스택 요약**
- **프론트엔드**: React, Zustand, Tailwind CSS, Axios, React Router
- **백엔드**: Node.js, Express, REST API, JWT, bcrypt
- **데이터베이스**: PostgreSQL (Supabase)
- **인프라**: Vercel (프론트엔드/백엔드), Supabase (데이터베이스)

---

## 1. 시스템 아키텍처

전체 시스템의 레이어 구조를 나타내는 다이어그램입니다.

**설명**
- 클라이언트(React)가 HTTPS를 통해 백엔드 API 서버로 요청을 전달
- 백엔드 서버(Express)가 SQL을 통해 PostgreSQL 데이터베이스와 통신
- 각 계층은 독립적으로 배포되며 HTTPS로 보호됨

```mermaid
graph TD
    subgraph "클라이언트 레이어"
        A["웹 브라우저<br/>(React SPA)"]
    end

    subgraph "API 레이어"
        B["API 서버<br/>(Express)"]
    end

    subgraph "데이터 레이어"
        C["PostgreSQL<br/>(Supabase)"]
    end

    subgraph "호스팅"
        D["Vercel<br/>(프론트엔드)"]
        E["Vercel<br/>(백엔드)"]
        F["Supabase<br/>(데이터베이스)"]
    end

    A -->|HTTPS<br/>REST API| B
    B -->|SQL| C
    D -.->|호스팅| A
    E -.->|호스팅| B
    F -.->|제공| C

    style A fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style B fill:#90c53f,stroke:#333,stroke-width:2px,color:#000
    style C fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style D fill:#000,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#000,stroke:#333,stroke-width:2px,color:#fff
    style F fill:#3fcf8e,stroke:#333,stroke-width:2px,color:#000
```

---

## 2. 프론트엔드 구조

React 기반 프론트엔드의 주요 계층 구조입니다.

**설명**
- **Pages**: 라우트별 페이지 컴포넌트 (로그인, 할 일 목록, 캘린더, 휴지통 등)
- **Components**: 재사용 가능한 UI 컴포넌트
- **Store (Zustand)**: 전역 상태 관리 (사용자, 할 일, UI 상태 등)
- **API Client (Axios)**: 백엔드 API 통신
- **Router (React Router)**: 클라이언트 사이드 라우팅

```mermaid
graph LR
    subgraph "프론트엔드 (React)"
        subgraph "라우팅"
            A["Router<br/>(React Router)"]
        end

        subgraph "페이지/화면"
            B1["로그인 페이지"]
            B2["할 일 목록"]
            B3["캘린더 뷰"]
            B4["휴지통"]
            B5["사용자 프로필"]
        end

        subgraph "컴포넌트"
            C1["TodoForm"]
            C2["TodoList"]
            C3["Calendar"]
            C4["Header"]
            C5["Navigation"]
        end

        subgraph "상태 관리"
            D["Zustand Store<br/>(User, Todos, UI)"]
        end

        subgraph "스타일"
            E["Tailwind CSS"]
        end

        subgraph "HTTP 클라이언트"
            F["Axios"]
        end
    end

    subgraph "외부"
        G["API 서버"]
    end

    A --> B1
    A --> B2
    A --> B3
    A --> B4
    A --> B5

    B1 --> C1
    B2 --> C2
    B2 --> C5
    B3 --> C3
    B3 --> C4

    C1 --> D
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D

    D --> E
    D --> F

    F -->|HTTPS| G

    style A fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style B1 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style B2 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style B3 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style B4 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style B5 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style D fill:#ffcccc,stroke:#333,stroke-width:2px
    style E fill:#06b6d4,stroke:#333,stroke-width:2px,color:#000
    style F fill:#0066cc,stroke:#333,stroke-width:2px,color:#fff
    style G fill:#90c53f,stroke:#333,stroke-width:2px
```

---

## 3. 백엔드 구조

Express 기반 백엔드의 주요 계층 구조입니다.

**설명**
- **Routes**: API 엔드포인트 정의 (인증, 할 일, 캘린더, 휴지통 등)
- **Controllers**: 비즈니스 로직 처리
- **Services**: 데이터 처리 및 비즈니스 규칙 적용
- **Database**: PostgreSQL과의 데이터 상호작용
- **Middleware**: 인증(JWT), 에러 처리, 로깅 등

```mermaid
graph LR
    subgraph "백엔드 (Express)"
        subgraph "API 엔드포인트"
            A1["/api/auth<br/>(회원가입, 로그인)"]
            A2["/api/todos<br/>(CRUD)"]
            A3["/api/trash<br/>(복구, 삭제)"]
            A4["/api/calendar<br/>(월별 조회)"]
            A5["/api/holidays<br/>(국경일)"]
            A6["/api/users<br/>(프로필)"]
        end

        subgraph "미들웨어"
            B1["인증<br/>(JWT)"]
            B2["에러 핸들러"]
            B3["로깅"]
            B4["요청 검증"]
        end

        subgraph "컨트롤러/서비스"
            C1["AuthService"]
            C2["TodoService"]
            C3["TrashService"]
            C4["CalendarService"]
            C5["HolidayService"]
            C6["UserService"]
        end

        subgraph "보안"
            D1["JWT 검증"]
            D2["bcrypt"]
            D3["권한 확인"]
        end

        subgraph "데이터 액세스"
            E["데이터베이스 쿼리<br/>(PostgreSQL)"]
        end
    end

    subgraph "외부"
        F["PostgreSQL<br/>(Supabase)"]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    A5 --> B1
    A6 --> B1

    B1 --> B2
    B2 --> B3
    B3 --> B4

    A1 --> C1
    A2 --> C2
    A3 --> C3
    A4 --> C4
    A5 --> C5
    A6 --> C6

    C1 --> D1
    C1 --> D2
    C2 --> D3
    C3 --> D3
    C6 --> D3

    C1 --> E
    C2 --> E
    C3 --> E
    C4 --> E
    C5 --> E
    C6 --> E

    E -->|SQL| F

    style A1 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style A2 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style A3 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style A4 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style A5 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style A6 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style B1 fill:#fff9c4,stroke:#333,stroke-width:1px,color:#000
    style B2 fill:#fff9c4,stroke:#333,stroke-width:1px,color:#000
    style D1 fill:#ffccbc,stroke:#333,stroke-width:1px,color:#000
    style D2 fill:#ffccbc,stroke:#333,stroke-width:1px,color:#000
    style E fill:#b3e5fc,stroke:#333,stroke-width:2px,color:#000
    style F fill:#336791,stroke:#333,stroke-width:2px,color:#fff
```

---

## 4. 인증 플로우

사용자 인증 및 JWT 토큰 관리 프로세스입니다.

**설명**
1. 사용자가 로그인 요청 (username/email + password)
2. 서버가 비밀번호 검증 (bcrypt)
3. 서버가 Access Token + Refresh Token 발급
4. 클라이언트가 토큰을 localStorage/cookie에 저장
5. 이후 API 요청에 Access Token을 Header에 포함
6. 서버가 JWT를 검증하여 요청 처리
7. Access Token 만료 시 Refresh Token으로 갱신

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Client as 클라이언트<br/>(React)
    participant Server as 서버<br/>(Express)
    participant DB as 데이터베이스<br/>(PostgreSQL)

    User->>Client: 1. 로그인 요청<br/>(username + password)
    Client->>Server: 2. POST /api/auth/login
    Server->>DB: 3. 사용자 정보 조회
    DB-->>Server: 사용자 데이터

    alt 비밀번호 검증 성공
        Server->>Server: 4. bcrypt로 비밀번호 검증
        Server->>Server: 5. Access Token 생성<br/>(15분 유효)
        Server->>Server: 6. Refresh Token 생성<br/>(7일 유효)
        Server-->>Client: 7. 토큰 반환<br/>{accessToken,<br/>refreshToken}
        Client->>Client: 8. 토큰을 localStorage에 저장
        Client-->>User: 9. 로그인 성공

        User->>Client: 10. API 요청
        Client->>Server: 11. 헤더에 accessToken 포함<br/>Authorization: Bearer {token}
        Server->>Server: 12. JWT 검증
        Server->>DB: 13. 데이터 조회/변경
        DB-->>Server: 데이터
        Server-->>Client: 14. 응답
        Client-->>User: 15. 결과 표시

    else Access Token 만료
        Client->>Server: 16. POST /api/auth/refresh<br/>{refreshToken}
        Server->>Server: 17. Refresh Token 검증
        alt Refresh Token 유효
            Server->>Server: 18. 새로운 Access Token 발급
            Server-->>Client: 19. 새 토큰 반환
            Client->>Client: 20. 토큰 업데이트
        else Refresh Token 만료
            Server-->>Client: 21. 재로그인 필요
            Client-->>User: 22. 로그인 페이지로 이동
        end
    else 비밀번호 검증 실패
        Server-->>Client: 23. 401 Unauthorized
        Client-->>User: 24. 오류 메시지 표시
    end
```

---

## 5. 배포 구조

프로젝트의 인프라 및 배포 구조입니다.

**설명**
- **프론트엔드 배포**: Vercel (자동 배포, CDN, SSL)
- **백엔드 배포**: Vercel (Serverless Functions 또는 Docker)
- **데이터베이스 호스팅**: Supabase PostgreSQL (자동 백업, 복제)
- **도메인 관리**: DNS 설정 및 HTTPS 암호화
- **버전 관리**: GitHub 저장소에서 소스 코드 관리

```mermaid
graph TB
    subgraph "개발환경"
        A["로컬 개발<br/>(Git)"]
    end

    subgraph "저장소"
        B["GitHub<br/>(코드 저장소)"]
    end

    subgraph "CI/CD"
        C1["GitHub Actions<br/>(향후 구현)"]
    end

    subgraph "프로덕션 환경"
        subgraph "프론트엔드"
            D1["Vercel<br/>(React SPA)"]
            D2["CDN<br/>(캐싱)"]
            D3["SSL/TLS<br/>(HTTPS)"]
        end

        subgraph "백엔드"
            E1["Vercel<br/>(Express API)"]
            E2["메모리<br/>(Serverless)"]
            E3["SSL/TLS<br/>(HTTPS)"]
        end

        subgraph "데이터베이스"
            F1["Supabase<br/>(PostgreSQL)"]
            F2["자동 백업<br/>& 복제"]
            F3["SSL/TLS<br/>(암호화)"]
        end
    end

    subgraph "사용자"
        G["웹 브라우저<br/>(사용자)"]
    end

    A -->|git push| B
    B -->|webhook trigger| C1
    C1 -->|배포| D1
    C1 -->|배포| E1

    D1 --> D2
    D2 --> D3
    E1 --> E2
    E2 --> E3

    F1 --> F2
    F2 --> F3

    G -->|HTTPS| D1
    D1 -->|HTTPS| E1
    E1 -->|SQL| F1

    style A fill:#f0f0f0,stroke:#333,stroke-width:2px,color:#000
    style B fill:#333,stroke:#333,stroke-width:2px,color:#fff
    style C1 fill:#0969da,stroke:#333,stroke-width:2px,color:#fff
    style D1 fill:#000,stroke:#333,stroke-width:2px,color:#fff
    style E1 fill:#000,stroke:#333,stroke-width:2px,color:#fff
    style F1 fill:#3fcf8e,stroke:#333,stroke-width:2px,color:#000
    style G fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
```

---

## 6. 데이터 흐름

할 일 조회, 생성, 수정, 삭제의 전체 데이터 흐름입니다.

**설명**
- **조회**: 클라이언트가 할 일 목록 요청 → 서버가 필터링하여 반환
- **생성**: 새 할 일 입력 → 서버 검증 → DB 저장 → 상태 업데이트
- **수정**: 할 일 정보 변경 → 서버 검증 → DB 업데이트 → 상태 반영
- **삭제**: 휴지통으로 이동 (소프트 삭제) 또는 영구 삭제

```mermaid
graph LR
    subgraph "클라이언트"
        A1["할 일 입력<br/>(제목, 설명, 날짜)"]
        A2["할 일 목록 조회"]
        A3["할 일 수정"]
        A4["할 일 삭제"]
        A5["UI 상태 업데이트<br/>(Zustand)"]
    end

    subgraph "서버"
        B1["요청 검증<br/>(JWT 확인)"]
        B2["비즈니스 로직<br/>(권한, 유효성)"]
        B3["데이터 변환"]
    end

    subgraph "데이터베이스"
        C1["할 일 저장"]
        C2["할 일 조회"]
        C3["할 일 업데이트"]
        C4["할 일 소프트 삭제<br/>(isDeleted=true)"]
        C5["할 일 영구 삭제"]
    end

    A1 -->|POST /todos| B1
    A2 -->|GET /todos| B1
    A3 -->|PUT /todos/:id| B1
    A4 -->|DELETE /todos/:id| B1

    B1 --> B2
    B2 --> B3

    B3 -->|INSERT| C1
    B3 -->|SELECT| C2
    B3 -->|UPDATE| C3
    B3 -->|UPDATE| C4
    B3 -->|DELETE| C5

    C1 -->|응답| A5
    C2 -->|응답| A5
    C3 -->|응답| A5
    C4 -->|응답| A5
    C5 -->|응답| A5

    A5 -->|리렌더링| A1
    A5 -->|리렌더링| A2
    A5 -->|리렌더링| A3
    A5 -->|리렌더링| A4

    style A1 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A2 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A3 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A4 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A5 fill:#ffcccc,stroke:#333,stroke-width:2px,color:#000
    style B1 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style B2 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style B3 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style C1 fill:#b3e5fc,stroke:#333,stroke-width:1px
    style C2 fill:#b3e5fc,stroke:#333,stroke-width:1px
    style C3 fill:#b3e5fc,stroke:#333,stroke-width:1px
    style C4 fill:#b3e5fc,stroke:#333,stroke-width:1px
    style C5 fill:#b3e5fc,stroke:#333,stroke-width:1px
```

---

## 7. 컴포넌트 상호작용

주요 기능별 컴포넌트 및 서비스의 상호작용입니다.

**설명**
- 각 페이지는 독립적인 컴포넌트로 구성
- Zustand Store를 통한 전역 상태 관리
- Axios를 통한 API 통신
- 각 서비스는 특정 도메인의 비즈니스 로직 담당

```mermaid
graph TB
    subgraph "프론트엔드"
        A1["LoginPage"]
        A2["TodoListPage"]
        A3["CalendarPage"]
        A4["TrashPage"]
        A5["ProfilePage"]
    end

    subgraph "Zustand Store"
        B1["userStore<br/>(사용자 정보)"]
        B2["todoStore<br/>(할 일 목록)"]
        B3["uiStore<br/>(UI 상태)"]
    end

    subgraph "API 클라이언트"
        C1["authAPI"]
        C2["todosAPI"]
        C3["trashAPI"]
        C4["calendarAPI"]
        C5["usersAPI"]
    end

    subgraph "백엔드 서비스"
        D1["AuthService"]
        D2["TodoService"]
        D3["TrashService"]
        D4["CalendarService"]
        D5["UserService"]
    end

    A1 -->|로그인| B1
    A1 -->|통신| C1

    A2 -->|조회| B2
    A2 -->|수정| B2
    A2 -->|통신| C2

    A3 -->|조회| B2
    A3 -->|통신| C4

    A4 -->|조회| B2
    A4 -->|통신| C3

    A5 -->|조회| B1
    A5 -->|수정| B1
    A5 -->|통신| C5

    C1 -->|호출| D1
    C2 -->|호출| D2
    C3 -->|호출| D3
    C4 -->|호출| D4
    C5 -->|호출| D5

    B1 -->|상태 공유| A1
    B1 -->|상태 공유| A2
    B1 -->|상태 공유| A5

    B2 -->|상태 공유| A2
    B2 -->|상태 공유| A3
    B2 -->|상태 공유| A4

    B3 -->|상태 공유| A1
    B3 -->|상태 공유| A2
    B3 -->|상태 공유| A3

    style A1 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A2 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A3 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A4 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A5 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style B1 fill:#ffcccc,stroke:#333,stroke-width:2px,color:#000
    style B2 fill:#ffcccc,stroke:#333,stroke-width:2px,color:#000
    style B3 fill:#ffcccc,stroke:#333,stroke-width:2px,color:#000
    style C1 fill:#0066cc,stroke:#333,stroke-width:1px,color:#fff
    style C2 fill:#0066cc,stroke:#333,stroke-width:1px,color:#fff
    style C3 fill:#0066cc,stroke:#333,stroke-width:1px,color:#fff
    style C4 fill:#0066cc,stroke:#333,stroke-width:1px,color:#fff
    style C5 fill:#0066cc,stroke:#333,stroke-width:1px,color:#fff
    style D1 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style D2 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style D3 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style D4 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style D5 fill:#c8e6c9,stroke:#333,stroke-width:1px
```

---

## 8. 기술 스택 매핑

PRD의 기술 스택을 시각화한 다이어그램입니다.

**설명**
각 레이어별 사용 기술과 버전:
- **프론트엔드**: React 18.x, TypeScript (권장), Zustand, Tailwind CSS 3.x
- **백엔드**: Node.js 18+, Express 4.x, PostgreSQL 15+
- **인프라**: Vercel Free Tier, Supabase Free Tier
- **개발 도구**: Git, npm/yarn, ESLint, Prettier

```mermaid
graph LR
    subgraph "프론트엔드 스택"
        A1["React 18.x"]
        A2["React Router 6.x"]
        A3["Zustand"]
        A4["Tailwind CSS 3.x"]
        A5["Axios"]
        A6["TypeScript<br/>(권장)"]
    end

    subgraph "백엔드 스택"
        B1["Node.js 18+"]
        B2["Express 4.x"]
        B3["JWT"]
        B4["bcrypt"]
        B5["REST API"]
        B6["CORS"]
    end

    subgraph "데이터베이스 스택"
        C1["PostgreSQL 15+"]
        C2["SQL"]
        C3["Transactions"]
        C4["인덱싱"]
    end

    subgraph "인프라 스택"
        D1["Vercel<br/>(프론트엔드)"]
        D2["Vercel<br/>(백엔드)"]
        D3["Supabase<br/>(DB)"]
        D4["GitHub<br/>(VCS)"]
    end

    subgraph "개발 도구"
        E1["Git"]
        E2["npm/yarn"]
        E3["ESLint"]
        E4["Prettier"]
        E5["Postman<br/>(API 테스트)"]
    end

    A1 --> F["앱 빌드"]
    A2 --> F
    A3 --> F
    A4 --> F
    A5 --> F

    B1 --> G["API 서버"]
    B2 --> G
    B3 --> G
    B4 --> G
    B5 --> G

    C1 --> H["데이터 저장"]
    C2 --> H
    C3 --> H
    C4 --> H

    D1 --> I["배포"]
    D2 --> I
    D3 --> I
    D4 --> I

    F -->|HTTPS| G
    G -->|SQL| H
    G -->|배포| D2
    F -->|배포| D1
    H -->|호스팅| D3

    style A1 fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style A2 fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style B1 fill:#90c53f,stroke:#333,stroke-width:2px,color:#000
    style B2 fill:#90c53f,stroke:#333,stroke-width:2px,color:#000
    style C1 fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style D1 fill:#000,stroke:#333,stroke-width:2px,color:#fff
    style D3 fill:#3fcf8e,stroke:#333,stroke-width:2px,color:#000
```

---

## 9. 보안 아키텍처

인증, 권한, 데이터 보호를 포함한 보안 구조입니다.

**설명**
- **인증**: JWT 기반 토큰 인증 (Access Token + Refresh Token)
- **비밀번호**: bcrypt로 해싱하여 저장
- **전송 보안**: HTTPS/TLS로 암호화된 통신
- **권한 관리**: 사용자는 자신의 데이터만 접근 가능
- **API 보안**: 토큰 검증, CORS 정책, Rate Limiting
- **데이터 보호**: SQL Injection 방어, XSS 방어

```mermaid
graph TB
    subgraph "클라이언트"
        A["웹 브라우저"]
    end

    subgraph "전송 레이어"
        B["HTTPS/TLS<br/>(암호화)"]
    end

    subgraph "인증 레이어"
        C1["JWT 검증"]
        C2["토큰 만료 확인"]
        C3["서명 검증"]
    end

    subgraph "권한 레이어"
        D1["사용자 ID 확인"]
        D2["리소스 소유권 확인"]
        D3["권한 수준 확인<br/>(일반사용자/관리자)"]
    end

    subgraph "비밀번호 보안"
        E1["bcrypt 해싱"]
        E2["솔트 적용"]
        E3["해시 저장<br/>(평문 절대 저장 금지)"]
    end

    subgraph "데이터 보안"
        F1["SQL Injection 방어<br/>(Prepared Statement)"]
        F2["XSS 방어<br/>(입력 검증)"]
        F3["CSRF 토큰<br/>(향후 적용)"]
    end

    subgraph "API 보안"
        G1["CORS 정책"]
        G2["Rate Limiting<br/>(DDoS 방어)"]
        G3["에러 메시지 최소화"]
    end

    A -->|요청| B
    B -->|수신| C1
    C1 --> C2
    C2 --> C3

    C3 -->|검증 성공| D1
    D1 --> D2
    D2 --> D3

    D3 -->|승인| F1
    D3 -->|거부| G3

    F1 --> F2
    F2 --> F3

    G1 -->|정책 적용| A
    G2 -->|제한| A

    B -->|응답| A

    style A fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style B fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style C1 fill:#ffd700,stroke:#333,stroke-width:1px,color:#000
    style C2 fill:#ffd700,stroke:#333,stroke-width:1px,color:#000
    style C3 fill:#ffd700,stroke:#333,stroke-width:1px,color:#000
    style D1 fill:#90ee90,stroke:#333,stroke-width:1px,color:#000
    style D2 fill:#90ee90,stroke:#333,stroke-width:1px,color:#000
    style D3 fill:#90ee90,stroke:#333,stroke-width:1px,color:#000
    style E1 fill:#ff69b4,stroke:#333,stroke-width:1px,color:#fff
    style E2 fill:#ff69b4,stroke:#333,stroke-width:1px,color:#fff
    style E3 fill:#ff69b4,stroke:#333,stroke-width:1px,color:#fff
    style F1 fill:#87ceeb,stroke:#333,stroke-width:1px,color:#000
    style F2 fill:#87ceeb,stroke:#333,stroke-width:1px,color:#000
    style F3 fill:#87ceeb,stroke:#333,stroke-width:1px,color:#000
```

---

## 10. 성능 및 확장성

캐싱, 최적화, 확장성을 고려한 아키텍처입니다.

**설명**
- **프론트엔드 캐싱**: CDN을 통한 정적 파일 캐싱
- **브라우저 캐싱**: localStorage에 할 일 데이터 임시 저장
- **API 응답 캐싱**: 불변 데이터 캐싱
- **데이터베이스 인덱싱**: userId, dueDate 등 주요 컬럼 인덱싱
- **Pagination**: 대량의 데이터 처리 시 페이지네이션
- **Lazy Loading**: 캘린더 등 대규모 데이터 지연 로딩

```mermaid
graph LR
    subgraph "프론트엔드 최적화"
        A1["코드 스플리팅<br/>(React Lazy)"]
        A2["번들 최소화<br/>(Tree Shaking)"]
        A3["이미지 최적화"]
        A4["localStorage 캐싱"]
    end

    subgraph "CDN/Vercel"
        B1["정적 파일 캐싱"]
        B2["글로벌 CDN"]
        B3["자동 압축"]
    end

    subgraph "백엔드 최적화"
        C1["데이터베이스 인덱싱"]
        C2["Query 최적화"]
        C3["Pagination"]
        C4["응답 압축"]
    end

    subgraph "데이터베이스 최적화"
        D1["인덱스<br/>(userId, dueDate)"]
        D2["쿼리 플랜<br/>분석"]
        D3["연결 풀"]
    end

    subgraph "모니터링"
        E1["성능 메트릭"]
        E2["로그 분석"]
        E3["오류 추적"]
    end

    A1 -->|전송| B1
    A2 -->|전송| B1
    A3 -->|전송| B1
    A4 -->|로컬| A1

    B1 -->|응답| A1
    B2 -->|지연시간 감소| B1

    A4 -->|요청| C1
    C1 -->|조회| D1
    D1 -->|응답| C2
    C2 -->|변환| C3
    C3 -->|압축| C4
    C4 -->|전송| A4

    E1 -->|모니터링| A1
    E1 -->|모니터링| C1
    E2 -->|분석| E1
    E3 -->|추적| E2

    style A1 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A2 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A3 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style A4 fill:#e8f4f8,stroke:#333,stroke-width:1px
    style B1 fill:#000,stroke:#333,stroke-width:2px,color:#fff
    style B2 fill:#000,stroke:#333,stroke-width:2px,color:#fff
    style C1 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style C2 fill:#c8e6c9,stroke:#333,stroke-width:1px
    style D1 fill:#b3e5fc,stroke:#333,stroke-width:1px
    style D2 fill:#b3e5fc,stroke:#333,stroke-width:1px
    style E1 fill:#fff9c4,stroke:#333,stroke-width:1px,color:#000
```

---

## 다이어그램 범례

| 색상                                                                     | 의미                |
| ------- | ---------------------- |
| <span style="background-color:#61dafb; color:#000; padding:5px">█</span> | React/프론트엔드    |
| <span style="background-color:#90c53f; color:#000; padding:5px">█</span> | Node.js/Express     |
| <span style="background-color:#336791; color:#fff; padding:5px">█</span> | PostgreSQL/데이터베이스 |
| <span style="background-color:#000; color:#fff; padding:5px">█</span>    | Vercel              |
| <span style="background-color:#3fcf8e; color:#000; padding:5px">█</span> | Supabase            |
| <span style="background-color:#ffcccc; color:#000; padding:5px">█</span> | 상태 관리 (Zustand) |
| <span style="background-color:#ffd700; color:#000; padding:5px">█</span> | 인증/보안           |

---

## 참고 문서

- [PRD 문서](./3-prd.md) - 제품 요구사항 및 기술 스택
- [도메인 정의서](./1-domain-definition.md) - 도메인 모델 및 엔티티
- [API 명세서](./4-api-spec.md) - REST API 엔드포인트 (작성 예정)

---

## 수정 이력

| 버전 | 날짜       | 작성자           | 변경 내용        |
| ---- | ---------- | ---------------- | -------- |
| 1.0  | 2025-11-26 | technical-writer | 초안 작성 |

---

**END OF DOCUMENT**
