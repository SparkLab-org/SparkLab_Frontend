# Frontend Spec (SparkLab Frontend)

## Summary
- Next.js App Router frontend for mentee and mentor flows.
- API access is centralized in `src/services` and consumed via React Query hooks in `src/hooks`.
- UI is composed from `src/components` with Zustand stores in `src/store`.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- TanStack Query v5
- Zustand v5

## App Structure
- `src/app` routes and layouts
- `src/components` UI and page sections
- `src/services` API clients and mock APIs
- `src/hooks` React Query wrappers
- `src/store` Zustand state
- `src/lib/types` domain types

## Routes
| Route | Entry File | Purpose |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Home + login (LoginCard) |
| `/planner` | `src/app/(mentee)/planner/page.tsx` | Mentee planner home |
| `/planner/calendar` | `src/app/(mentee)/planner/calendar/page.tsx` | Planner calendar |
| `/planner/list` | `src/app/(mentee)/planner/list/page.tsx` | Todo list |
| `/planner/question` | `src/app/(mentee)/planner/question/page.tsx` | Q&A list |
| `/planner/notifications` | `src/app/(mentee)/planner/notifications/page.tsx` | Notifications |
| `/feedback` | `src/app/(mentee)/feedback/page.tsx` | Mentee feedback |
| `/my` | `src/app/(mentee)/my/page.tsx` | Mentee profile |
| `/mentor` | `src/app/(mentor)/mentor/page.tsx` | Mentor dashboard |
| `/mentor/mentee` | `src/app/(mentor)/mentor/mentee/page.tsx` | Mentor mentee index |
| `/mentor/question` | `src/app/(mentor)/mentor/question/page.tsx` | Mentor questions |

## Layouts
- `src/app/layout.tsx` provides global providers and app shell.
- `src/app/(mentee)/layout.tsx` provides bottom nav and timer widget.
- `src/app/(mentee)/planner/layout.tsx` provides planner header/back UI.
- `src/app/(mentor)/layout.tsx` provides mentor sidebar layout.

## State and Data
### Domain Types
- `Todo` and `Question` types live in `src/lib/types`.
- Subject values are represented as localized strings in UI types.

### Stores (Zustand)
- `authStore` token state and logout.
- `plannerStore`, `mentorStore`, `mentorFeedbackStore`, `timerStore`, `uiPreferenceStore`.

## API Integration
### Base Client
- `src/services/appClient.ts` provides `apiFetch`.
- Adds `Authorization: Bearer <token>` from `localStorage.accessToken`.
- On 401 it clears token and redirects to `/login` (note: `/login` route is not defined).

### Base URL and Proxy
- `NEXT_PUBLIC_API_BASE_URL` (default: `/api`).
- `next.config.ts` rewrites `/api/*` to `http://34.22.110.141/*`.

### Todo API (current frontend expectation)
- Base path: `/todos`
- `listTodos({ plannerId, planDate })` -> `GET /todos?plannerId=&planDate=`
- `createTodo()` -> `POST /todos` with `plannerId` and basic fields
- `updateTodo()` -> `PUT /todos/{todoItemId}`
- `deleteTodo()` -> `DELETE /todos/{todoItemId}`

### Question API (current frontend expectation)
- Base path: `/domain/questions`
- `listQuestions()`, `createQuestion()`, `updateQuestion()`, `deleteQuestion()`

### Auth API (current frontend expectation)
- `POST /auth/signin` in `src/services/auth.api.ts`
- Token stored in `localStorage.accessToken`
- Login UI is on `/` (Home)

## Data Fetching (React Query)
- Query client configured in `src/app/providers.tsx`.
- `src/hooks/*Queries.ts` wrap API calls with `useQuery` and `useMutation`.
- Todo query keys include `plannerId` and `planDate` for cache separation.

## Mocking
- `NEXT_PUBLIC_TODO_API_MODE` and `NEXT_PUBLIC_QUESTION_API_MODE` control mock vs backend.
- Mock data in `src/services/todo.mock.ts` and `src/services/question.mock.ts`.

## Known Gaps / Risks
- `/login` route is not implemented but 401 handling redirects there.
- Auth endpoints are not present in the provided OpenAPI snippet.
- Subject enum includes `ALL` on backend; UI uses localized subject labels.
