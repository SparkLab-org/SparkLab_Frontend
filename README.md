# 설스터디 (SeolStudy)

> 고등학생을 위한 학습 코칭 플랫폼
> 제4회 블레이버스 MVP 개발 해커톤 본선 진출작

멘티(학생)가 학습 계획을 세우고 공부 시간을 기록하면, 멘토(코치)가 과제를 부여하고 피드백을 작성합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16, React 19, TypeScript 5 |
| 서버 상태 | TanStack React Query 5 |
| 클라이언트 상태 | Zustand 5 |
| 스타일링 | Tailwind CSS 4, Radix UI |
| 폼 / 유효성 검사 | React Hook Form 7, Zod 4 |
| 날짜 처리 | date-fns 4, dayjs |

---

## 주요 기능

### 멘티 (학생)

- **학습 플래너** — 일별·주별·월별 캘린더 뷰로 할 일 계획 및 관리
- **공부 타이머** — 활성 할 일에 타이머를 연결해 실시간 공부 시간 측정 및 기록
- **과제 확인** — 멘토가 부여한 과제 목록 확인 및 제출
- **피드백 조회** — 멘토 피드백을 과목·중요도·날짜별로 필터링하여 열람
- **Q&A** — 멘토에게 질문 작성 및 답변 확인

### 멘토 (코치)

- **멘티 관리** — 담당 멘티 목록 및 학습 활동 상태(NORMAL / WARNING / DANGER) 모니터링
- **과제 부여** — 과목·마감일·예상 시간을 지정해 과제 생성
- **피드백 작성** — AI 초안 생성을 활용한 멘티 피드백 작성 및 편집
- **Q&A 답변** — 멘티 질문에 답변 작성
- **일일 코칭 코멘트** — 멘티의 일별 플랜에 코멘트 추가

---

## 프로젝트 구조

```
src/
├── app/
│   ├── (mentee)/          # 멘티 전용 라우트
│   │   ├── planner/       # 학습 플래너 (캘린더, 목록, 과제, Q&A)
│   │   ├── feedback/      # 피드백 조회
│   │   ├── questions/     # 질문 관리
│   │   └── my/            # 마이페이지
│   ├── (mentor)/          # 멘토 전용 라우트
│   │   └── mentor/
│   │       ├── mentee/    # 멘티 목록 및 상세
│   │       ├── feedback/  # 피드백 작성
│   │       ├── planner/   # 멘티 플래너 열람
│   │       └── question/  # Q&A 답변
│   └── api/               # Next.js API Routes
├── components/            # 도메인별 UI 컴포넌트
├── hooks/                 # React Query 훅 (도메인별 분리)
├── services/              # API 클라이언트
├── stores/                # Zustand 스토어
└── types/                 # TypeScript 타입 정의
```

---

## 아키텍처 결정 사항

### 이중 역할 라우팅
Next.js Route Group으로 `(mentee)` / `(mentor)` 영역을 물리적으로 분리했습니다. 로그인 시 서버 응답의 역할 정보를 기준으로 자동 리다이렉트하며, 인증·API 클라이언트 등 공통 로직은 단일 레이어로 공유합니다.

### 상태 관리 분리
- **TanStack React Query** — 서버 상태 (할 일, 피드백, 과제, Q&A, 알림)
- **Zustand** — 클라이언트 상태 (타이머, 인증, UI 설정) + localStorage 영속화

### 캘린더 쿼리 최적화
주·월 단위 뷰 전환 시 발생하는 대량 API 요청 문제를 해결하기 위해, 날짜 범위 단위 인메모리 캐시(TTL 60초)와 최대 6개 병렬 워커 풀을 구현했습니다. 동일 날짜에 대한 중복 요청을 제거하고 캐시 미스 시에만 실제 요청을 보냅니다.

### 중앙화된 API 클라이언트
`src/services/appClient.ts` 에서 모든 API 호출을 처리합니다.
- Bearer 토큰 자동 첨부
- 401 응답 시 세션 만료 처리 및 로그인 페이지 리다이렉트
- JSON / FormData 콘텐츠 타입 자동 판별
- 계정 정보 자동 주입 (5분 TTL 캐싱)

---

## 시작하기

### 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_PROXY_TARGET=http://localhost:8080
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

개발 서버는 기본적으로 `http://localhost:3000` 에서 실행됩니다.

---

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 API 서버 주소 | `/api` |
| `NEXT_PUBLIC_API_PROXY_TARGET` | Next.js 프록시 대상 주소 | - |
| `NEXT_PUBLIC_QUESTION_API_MODE` | Q&A API 모드 (`mock` / `backend`) | `mock` |
