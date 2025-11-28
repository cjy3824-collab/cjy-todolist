# cjy-todoList 스타일 가이드

---

## 문서 정보

| 항목       | 내용                       |
| ---------- | -------------------------- |
| **문서명** | cjy-todoList 스타일 가이드 |
| **버전**   | 1.0                        |
| **작성일** | 2025-11-27                 |
| **작성자** | UI Designer                |
| **상태**   | 완성                       |
| **참고**   | PRD v1.0, 와이어프레임 v1.0 |

---

## 목차

1. [디자인 철학](#1-디자인-철학)
2. [컬러 시스템](#2-컬러-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [간격 및 레이아웃](#4-간격-및-레이아웃)
5. [컴포넌트 스타일](#5-컴포넌트-스타일)
6. [아이콘 및 이미지](#6-아이콘-및-이미지)
7. [애니메이션 및 트랜지션](#7-애니메이션-및-트랜지션)
8. [반응형 디자인](#8-반응형-디자인)
9. [접근성](#9-접근성)
10. [다크 모드](#10-다크-모드)

---

## 1. 디자인 철학

### 1.1 핵심 가치

**간단함 (Simplicity)**
- 불필요한 장식 제거
- 명확한 정보 계층 구조
- 직관적인 인터페이스

**편리함 (Convenience)**
- 빠른 작업 완료
- 최소한의 클릭
- 명확한 피드백

**안전함 (Safety)**
- 명확한 작업 확인
- 실수 방지
- 복구 가능성

### 1.2 디자인 원칙

#### 명확성 (Clarity)
모든 UI 요소는 그 목적이 즉시 이해되어야 합니다.

#### 일관성 (Consistency)
유사한 기능은 유사한 방식으로 표현합니다.

#### 피드백 (Feedback)
사용자의 모든 행동에 대해 즉각적인 피드백을 제공합니다.

#### 효율성 (Efficiency)
사용자가 최소한의 노력으로 목표를 달성할 수 있도록 합니다.

---

## 2. 컬러 시스템

### 2.1 Primary Colors (주요 색상)

#### Brand Color (브랜드 컬러)
```
Primary Blue
- Primary-900: #1e3a8a (어두운 파랑)
- Primary-700: #1d4ed8 (진한 파랑)
- Primary-500: #3b82f6 (메인 파랑) ⭐ 주 색상
- Primary-300: #93c5fd (밝은 파랑)
- Primary-100: #dbeafe (연한 파랑)
- Primary-50:  #eff6ff (아주 연한 파랑)
```

**사용 예시**:
- Primary-500: 주요 버튼, 링크, 선택된 상태
- Primary-100: 버튼 hover, 선택된 배경
- Primary-50: 미묘한 강조, 배경

### 2.2 Semantic Colors (의미 색상)

#### Success (성공)
```
- Success-500: #10b981 (녹색)
- Success-100: #d1fae5 (연한 녹색)
```
**사용**: 완료된 할 일, 성공 메시지

#### Warning (경고)
```
- Warning-500: #f59e0b (주황색)
- Warning-100: #fef3c7 (연한 주황색)
```
**사용**: 중요 알림, 주의 메시지

#### Error (오류)
```
- Error-500: #ef4444 (빨간색)
- Error-100: #fee2e2 (연한 빨간색)
```
**사용**: 오류 메시지, 삭제 작업

#### Info (정보)
```
- Info-500: #3b82f6 (파란색)
- Info-100: #dbeafe (연한 파란색)
```
**사용**: 정보 메시지, 도움말

### 2.3 Neutral Colors (중립 색상)

#### Grayscale (그레이스케일)
```
- Gray-900: #111827 (거의 검정) - 제목, 본문
- Gray-700: #374151 (어두운 회색) - 부제목
- Gray-500: #6b7280 (중간 회색) - 보조 텍스트
- Gray-300: #d1d5db (밝은 회색) - 테두리, 구분선
- Gray-100: #f3f4f6 (연한 회색) - 배경
- Gray-50:  #f9fafb (아주 연한 회색) - 페이지 배경
- White:    #ffffff (흰색) - 카드, 모달 배경
```

### 2.4 컬러 사용 가이드

| 요소 | 컬러 | 용도 |
|------|------|------|
| **Primary Button** | Primary-500 | 주요 행동 (할 일 생성, 로그인) |
| **Secondary Button** | Gray-100 + Gray-700 text | 보조 행동 (취소) |
| **Success State** | Success-500 | 완료된 할 일 체크박스 |
| **Danger Button** | Error-500 | 삭제, 위험한 작업 |
| **Link** | Primary-500 | 텍스트 링크 |
| **Background** | Gray-50 | 페이지 전체 배경 |
| **Card Background** | White | 카드, 모달 배경 |
| **Border** | Gray-300 | 구분선, 테두리 |
| **Text - Primary** | Gray-900 | 제목, 중요 텍스트 |
| **Text - Secondary** | Gray-500 | 보조 텍스트, 설명 |

---

## 3. 타이포그래피

### 3.1 Font Family (서체)

#### 기본 서체
```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial',
             'Noto Sans KR', sans-serif;
```

**Pretendard**: 한글 본문에 최적화된 무료 서체
- 가독성이 우수
- 다양한 font-weight 지원
- 웹폰트 제공

#### 폴백 서체
시스템 기본 서체를 사용하여 빠른 로딩 보장

### 3.2 Type Scale (크기 체계)

| 용도 | Size | Weight | Line Height | 예시 |
|------|------|--------|-------------|------|
| **H1 - Page Title** | 32px / 2rem | 700 (Bold) | 1.2 | "할 일 목록" |
| **H2 - Section Title** | 24px / 1.5rem | 600 (SemiBold) | 1.3 | "오늘의 할 일" |
| **H3 - Card Title** | 20px / 1.25rem | 600 (SemiBold) | 1.4 | 할 일 제목 |
| **Body Large** | 18px / 1.125rem | 400 (Regular) | 1.6 | 중요 본문 |
| **Body** | 16px / 1rem | 400 (Regular) | 1.5 | 일반 본문 |
| **Body Small** | 14px / 0.875rem | 400 (Regular) | 1.5 | 보조 설명 |
| **Caption** | 12px / 0.75rem | 400 (Regular) | 1.4 | 날짜, 메타 정보 |

### 3.3 Font Weight (글자 굵기)

```
- Regular (400): 기본 본문
- Medium (500): 약간 강조
- SemiBold (600): 부제목, 중요 정보
- Bold (700): 제목, 강조
```

### 3.4 타이포그래피 사용 예시

#### 페이지 제목
```
크기: 32px
굵기: Bold (700)
색상: Gray-900
여백: 하단 24px
```

#### 할 일 제목
```
크기: 20px
굵기: SemiBold (600)
색상: Gray-900
여백: 하단 8px
```

#### 할 일 설명
```
크기: 14px
굵기: Regular (400)
색상: Gray-500
여백: 하단 12px
```

---

## 4. 간격 및 레이아웃

### 4.1 Spacing Scale (간격 체계)

**8px 기반 시스템 사용**

```
- 4px:   0.25rem  (xs)  - 아주 작은 간격
- 8px:   0.5rem   (sm)  - 작은 간격
- 12px:  0.75rem  (md)  - 중간 간격
- 16px:  1rem     (base) - 기본 간격 ⭐
- 24px:  1.5rem   (lg)  - 큰 간격
- 32px:  2rem     (xl)  - 아주 큰 간격
- 48px:  3rem     (2xl) - 섹션 간격
- 64px:  4rem     (3xl) - 페이지 간격
```

### 4.2 간격 사용 가이드

| 요소 | 간격 | 용도 |
|------|------|------|
| **컴포넌트 내부 패딩** | 16px | 버튼, 카드 내부 |
| **요소 간 간격** | 8-12px | 리스트 아이템 간격 |
| **섹션 간 간격** | 24-32px | 페이지 섹션 구분 |
| **페이지 여백** | 16-24px (모바일), 32-48px (데스크톱) | 화면 가장자리 |
| **텍스트 줄 간격** | 1.5 | 본문 가독성 |

### 4.3 Container Width (컨테이너 너비)

```
- Mobile:  100% (패딩 16px)
- Tablet:  768px (패딩 24px)
- Desktop: 1024px (패딩 32px)
- Wide:    1280px (패딩 48px)
```

### 4.4 Grid System (그리드 시스템)

**12 Column Grid**

- **모바일**: 1 column
- **태블릿**: 2-3 columns
- **데스크톱**: 3-4 columns

**Gap (간격)**:
- 모바일: 16px
- 태블릿: 20px
- 데스크톱: 24px

---

## 5. 컴포넌트 스타일

### 5.1 Buttons (버튼)

#### Primary Button (주요 버튼)
```
배경: Primary-500
텍스트: White
패딩: 12px 24px
높이: 44px (모바일 터치 최적화)
둥근 모서리: 8px
폰트: 16px, SemiBold (600)

Hover: Primary-600 배경
Active: Primary-700 배경
Disabled: Gray-300 배경, Gray-500 텍스트
```

#### Secondary Button (보조 버튼)
```
배경: Gray-100
텍스트: Gray-700
테두리: 1px solid Gray-300
패딩: 12px 24px
높이: 44px
둥근 모서리: 8px
폰트: 16px, SemiBold (600)

Hover: Gray-200 배경
Active: Gray-300 배경
```

#### Danger Button (위험 버튼)
```
배경: Error-500
텍스트: White
패딩: 12px 24px
높이: 44px
둥근 모서리: 8px
폰트: 16px, SemiBold (600)

Hover: Error-600 배경
Active: Error-700 배경
```

#### Icon Button (아이콘 버튼)
```
크기: 40px × 40px
배경: 투명
아이콘: Gray-500
둥근 모서리: 8px

Hover: Gray-100 배경
Active: Gray-200 배경
```

### 5.2 Input Fields (입력 필드)

#### Text Input
```
높이: 44px
패딩: 12px 16px
테두리: 1px solid Gray-300
둥근 모서리: 8px
폰트: 16px, Regular (400)
배경: White

Focus: Primary-500 테두리 (2px)
Error: Error-500 테두리, Error-100 배경
Disabled: Gray-100 배경, Gray-400 텍스트
```

#### Textarea
```
최소 높이: 100px
패딩: 12px 16px
테두리: 1px solid Gray-300
둥근 모서리: 8px
폰트: 16px, Regular (400)
Line Height: 1.5
리사이즈: vertical
```

#### Checkbox
```
크기: 20px × 20px
테두리: 2px solid Gray-300
둥근 모서리: 4px
배경: White

Checked: Primary-500 배경, White 체크 아이콘
Hover: Primary-100 배경 (unchecked)
Focus: Primary-500 outline (2px)
```

### 5.3 Cards (카드)

#### Todo Card
```
배경: White
테두리: 1px solid Gray-200
둥근 모서리: 12px
패딩: 16px
그림자: 0 1px 3px rgba(0,0,0,0.1)

Hover: 그림자 강화 0 4px 6px rgba(0,0,0,0.1)
Active: Gray-50 배경
```

#### Modal Card
```
배경: White
둥근 모서리: 16px
패딩: 24px
그림자: 0 20px 25px rgba(0,0,0,0.15)
최대 너비: 500px
```

### 5.4 List Items (리스트 항목)

#### Todo List Item
```
높이: auto (최소 64px)
패딩: 12px 16px
테두리 하단: 1px solid Gray-200
배경: White

Hover: Gray-50 배경
Active: Gray-100 배경
Completed: Gray-500 텍스트 (줄 통과선)
```

### 5.5 Badges (뱃지)

#### Status Badge
```
패딩: 4px 12px
둥근 모서리: 16px (pill 형태)
폰트: 12px, SemiBold (600)

완료: Success-100 배경, Success-700 텍스트
진행중: Primary-100 배경, Primary-700 텍스트
삭제됨: Gray-100 배경, Gray-700 텍스트
```

---

## 6. 아이콘 및 이미지

### 6.1 아이콘 시스템

#### 아이콘 라이브러리
**Heroicons** 사용 (MIT 라이선스)
- Outline: 일반 상태
- Solid: 선택/활성 상태

#### 아이콘 크기
```
- Small:  16px (캡션, 인라인)
- Medium: 20px (버튼, 리스트) ⭐ 기본
- Large:  24px (헤더, 중요 아이콘)
- XLarge: 32px (빈 상태, 일러스트)
```

#### 아이콘 색상
```
- Default: Gray-500
- Active:  Primary-500
- Danger:  Error-500
- Success: Success-500
- Disabled: Gray-300
```

#### 주요 아이콘 매핑

| 기능 | 아이콘 | 타입 |
|------|--------|------|
| **추가** | PlusIcon | Outline |
| **완료** | CheckIcon | Solid (완료 시) |
| **삭제** | TrashIcon | Outline |
| **편집** | PencilIcon | Outline |
| **캘린더** | CalendarIcon | Outline |
| **검색** | MagnifyingGlassIcon | Outline |
| **필터** | FunnelIcon | Outline |
| **메뉴** | Bars3Icon | Outline |
| **닫기** | XMarkIcon | Outline |
| **정보** | InformationCircleIcon | Outline |
| **경고** | ExclamationTriangleIcon | Solid |

### 6.2 이미지

#### 빈 상태 일러스트
```
크기: 240px × 240px
위치: 중앙 정렬
스타일: 심플한 라인 아트, Gray-300 색상
```

#### 로고
```
크기: 32px × 32px (헤더)
형식: SVG
색상: Primary-500
```

---

## 7. 애니메이션 및 트랜지션

### 7.1 Duration (지속 시간)

```
- Fast:   150ms  - 마우스 오버, 포커스
- Normal: 250ms  - 버튼 클릭, 모달 열기 ⭐ 기본
- Slow:   350ms  - 페이지 전환
```

### 7.2 Easing (가속도)

```
- ease-in-out: 기본 트랜지션
- ease-out: 요소 나타남
- ease-in: 요소 사라짐
```

### 7.3 트랜지션 사용 예시

#### 버튼 Hover
```css
transition: all 150ms ease-in-out;
```

#### 모달 열기/닫기
```css
opacity: 0 → 1 (250ms ease-out)
transform: scale(0.95) → scale(1)
```

#### 리스트 아이템 추가
```css
opacity: 0 → 1 (250ms ease-out)
transform: translateY(-10px) → translateY(0)
```

#### 체크박스 완료
```css
체크 아이콘: scale(0) → scale(1) (200ms ease-out)
배경색: White → Primary-500 (150ms ease-in-out)
```

### 7.4 애니메이션 원칙

1. **의미 있는 애니메이션만 사용**: 장식이 아닌 피드백 제공
2. **일관성 유지**: 유사한 동작에 유사한 애니메이션
3. **성능 고려**: transform, opacity만 사용 (GPU 가속)
4. **접근성**: prefers-reduced-motion 존중

---

## 8. 반응형 디자인

### 8.1 Breakpoints (중단점)

```
- Mobile:  < 640px   (모바일 우선)
- Tablet:  640px - 1023px
- Desktop: 1024px - 1279px
- Wide:    ≥ 1280px
```

### 8.2 레이아웃 변화

#### Header
```
Mobile:  햄버거 메뉴, 세로 네비게이션
Desktop: 가로 네비게이션, 모든 메뉴 표시
```

#### Todo List
```
Mobile:  1 column, 전체 너비
Tablet:  1-2 columns
Desktop: 2-3 columns (그리드 뷰 옵션)
```

#### Modal
```
Mobile:  전체 화면 (하단에서 슬라이드 업)
Desktop: 중앙 모달 (최대 500px)
```

### 8.3 터치 타겟 크기

**최소 크기: 44px × 44px**

- 버튼
- 링크
- 체크박스
- 아이콘 버튼
- 리스트 아이템 (터치 영역)

---

## 9. 접근성

### 9.1 컬러 대비

**WCAG 2.1 AA 기준 준수**

- 일반 텍스트: 4.5:1 이상
- 큰 텍스트 (18px+): 3:1 이상
- UI 컴포넌트: 3:1 이상

**테스트 색상 조합**:
- Gray-900 on White: ✅ 통과
- Gray-700 on White: ✅ 통과
- Gray-500 on White: ✅ 통과 (보조 텍스트)
- Primary-500 on White: ✅ 통과
- White on Primary-500: ✅ 통과

### 9.2 Focus States (포커스 상태)

```
outline: 2px solid Primary-500
outline-offset: 2px
border-radius: 유지
```

**모든 인터랙티브 요소에 적용**:
- 버튼
- 링크
- 입력 필드
- 체크박스
- 드롭다운

### 9.3 Screen Reader (스크린 리더)

#### 필수 ARIA 속성

```html
<!-- 버튼 -->
<button aria-label="할 일 추가">
  <PlusIcon />
</button>

<!-- 체크박스 -->
<input
  type="checkbox"
  aria-label="할 일 완료 체크"
  aria-checked="false"
/>

<!-- 모달 -->
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">할 일 추가</h2>
</div>

<!-- 로딩 -->
<div role="status" aria-live="polite">
  로딩 중...
</div>
```

### 9.4 키보드 네비게이션

**지원 단축키**:
- `Tab`: 다음 요소로 이동
- `Shift + Tab`: 이전 요소로 이동
- `Enter`: 버튼 클릭, 링크 이동
- `Space`: 체크박스 토글, 버튼 클릭
- `Escape`: 모달/드롭다운 닫기
- `Arrow Keys`: 리스트 네비게이션

---

## 10. 다크 모드

### 10.1 다크 모드 컬러 팔레트

**향후 구현 예정**

#### Background
```
- Page: Gray-900
- Card: Gray-800
- Elevated: Gray-700
```

#### Text
```
- Primary: Gray-100
- Secondary: Gray-400
- Disabled: Gray-600
```

#### Primary Colors
```
- Primary-400 (밝은 파랑): 메인 액센트
- Primary-600 (어두운 파랑): 호버
```

### 10.2 다크 모드 전환

```css
@media (prefers-color-scheme: dark) {
  /* 다크 모드 스타일 */
}
```

또는 사용자 설정 토글 제공

---

## 11. 사용 예시

### 11.1 할 일 카드 스타일

```
구조:
┌────────────────────────────────────────┐
│ ☐ 할 일 제목 (20px, SemiBold)         │
│   할 일 설명 (14px, Regular, Gray-500) │
│   📅 2025-12-31 | ⏰ 14:00            │
│                              [편집] [삭제] │
└────────────────────────────────────────┘

스타일:
- 배경: White
- 테두리: 1px solid Gray-200
- 패딩: 16px
- 둥근 모서리: 12px
- 그림자: 0 1px 3px rgba(0,0,0,0.1)
```

### 11.2 버튼 그룹 스타일

```
[주요 버튼] [보조 버튼]

간격: 8px
정렬: 우측 (데스크톱), 전체 너비 (모바일)
```

---

## 12. 스타일 체크리스트

### 디자인 구현 전 확인사항

- [ ] 컬러가 브랜드 가이드를 따르는가?
- [ ] 타이포그래피 크기와 굵기가 일관적인가?
- [ ] 간격이 8px 배수 시스템을 따르는가?
- [ ] 모든 버튼이 44px 이상 높이를 가지는가?
- [ ] 컬러 대비가 WCAG AA 기준을 만족하는가?
- [ ] Focus state가 명확히 표시되는가?
- [ ] 반응형 디자인이 적용되었는가?
- [ ] 애니메이션이 의미 있고 성능에 영향이 없는가?
- [ ] ARIA 레이블이 적절히 설정되었는가?
- [ ] 키보드로 모든 기능에 접근 가능한가?

---

## 문서 변경 이력

| 버전 | 날짜       | 작성자      | 변경 내용     |
| ---- | ---------- | ----------- | ------------- |
| 1.0  | 2025-11-27 | UI Designer | 초안 작성     |

---

**END OF DOCUMENT**
