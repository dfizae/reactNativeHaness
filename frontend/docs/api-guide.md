# API 통신 가이드

서버 통신 코드를 쓸 때 반드시 이 가이드를 따른다. **무엇을 주고받는지**(엔드포인트·DTO·열거형·공통 규약 값)는 [`docs/api-contract.md`](./api-contract.md), **규칙**은 `.agents/rules/20-api-data.md`(호출 계층·Query)와 `.agents/rules/90-backend-contract.md`(계약)에 있다. 이 문서는 그것을 **코드로 옮기는 절차와 예시**다.

> 템플릿이다. §2·§5 표와 §11 은 프로젝트 값으로 채운다. 예시 코드는 금액이 원 단위 정수 JSON number 로 오는 계약을 가정했으므로, 계약이 다르면 §3-2 표와 예시를 계약에 맞게 고친다.

## 1. 아키텍처

```
app/ 화면 ──▶ features/<domain>/api/queries.ts ──▶ features/<domain>/api/<domain>.api.ts ──▶ api/client.ts ──▶ <호스트><Base path>
             (xxxKeys · queryOptions · 훅)         (엔드포인트 1:1 함수, 목 분기)              (axios · 인터셉터 · ApiError)
                                                          │
                                                          ▼
                                             features/<domain>/model.ts  (DTO → 화면 모델, ContractMismatchError)
```

| 계층 | 위치 | 책임 | 금지 |
| --- | --- | --- | --- |
| 통신 | `api/client.ts` | axios 인스턴스(`baseURL`, 타임아웃 상수), 요청 인터셉터(인증 헤더), 응답 인터셉터(봉투 벗기기, 401 갱신 단일 실행, `ApiError` 정규화) | 도메인 함수 밖에서 `api` import |
| 도메인 API | `features/<domain>/api/<domain>.api.ts` | 엔드포인트 1:1 함수. 인자는 도메인 타입, 안에서 path·params·body 매핑. `isMocked("<domain>")` 분기 | TanStack Query import, 헤더 조립 |
| 화면 모델 | `features/<domain>/model.ts` | DTO 타입(계약 사본과 1:1) + `toXxx` 변환 + 계약 검증 | UI 문구, 포맷팅 이외의 로직 |
| 서버 상태 | `features/<domain>/api/queries.ts` | `<domain>Keys` 팩토리, `queryOptions` 팩토리, `useXxx` 훅, 뮤테이션 훅과 무효화 | axios·fetcher 직접 호출 |
| 오류 문구 | `features/<domain>/errors.ts` | `code` → 사용자 문구 | 서버 `message` 를 가공해 분기 |
| 목 데이터 | `api/mocks/<domain>.ts` | 계약 사본의 응답 예시를 그대로 옮긴 값 | 실제 계좌·개인 정보 |
| UI | `app/`, `features/<domain>/components/` | 훅 사용, `isPending`/`isError` 분기 | `api/`·도메인 함수 직접 import |

## 2. 도메인 폴더 ↔ API 도메인

`features/` 폴더 이름은 API 도메인과 1:1 로 맞춘다. 폴더가 없으면 아래 이름으로 만들고, 한 엔드포인트를 두 폴더에서 호출하지 않는다.

| `features/` | API 도메인 | 엔드포인트 | 비고 |
| --- | --- | --- | --- |
| `auth` | AUTH | <signup · login · refresh · logout> | 토큰 보관(`expo-secure-store`)과 로그아웃 시 초기화도 여기 |
| `<domain>` | <API 도메인> | <경로 목록> | |

## 3. 공통 규약을 코드로

### 3-1. `api/client.ts` 가 책임지는 것

```ts
// api/client.ts — 목표 형태
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? ""; // 호스트만
export function isMocked(domain: ApiDomain): boolean { ... }           // 도메인별 목 분기 스위치 (§9)
export const TIMEOUT_QUERY_MS = 10_000;  // 조회
export const TIMEOUT_MONEY_MS = 30_000;  // 돈이 움직이는 요청

export const api = axios.create({
  baseURL: `${API_BASE_URL}<Base path>`,
  timeout: TIMEOUT_QUERY_MS,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

// 요청: SecureStore 의 accessToken 을 계약이 정한 인증 헤더로. 가입·로그인·토큰 갱신 엔드포인트는 제외.
// 응답: 계약에 공통 봉투가 있으면 api/envelope.ts 의 unwrapEnvelope 로 벗긴다(도메인 함수는 data 만 본다).
//       401 → 갱신 단일 실행(동시 401 은 같은 Promise 를 기다린다) → 원 요청 1회 재시도 → 실패 시 토큰 삭제 + 로그인 이동.
//       그 외 오류 → toApiError 로 ApiError(status, code, message) 정규화. 네트워크 단절·타임아웃은 status 0, code "NETWORK" | "TIMEOUT".
```

- 도메인 함수는 경로만 쓴다: `api.get("/accounts")`. Base path 를 붙이지 않는다.
- 빈 본문 성공은 `Promise<void>` 로 다룬다.
- 헤더는 `client.ts` 인터셉터만 붙인다. 특정 엔드포인트 전용 헤더가 생기면 그 도메인 함수 **안에서** `config.headers` 로 지정하고 호출부에 노출하지 않는다.
- 돈이 움직이는 요청은 함수 안에서 `{ timeout: TIMEOUT_MONEY_MS }` 를 넘긴다.

### 3-2. 타입 변환 규칙 (`model.ts`)

계약 사본 §1 의 형식에 맞춰 채운다. 아래는 흔한 경우의 기본값이다.

| 계약 값 | DTO 타입 | 화면 모델 | 변환 |
| --- | --- | --- | --- |
| 금액(원 정수, JSON number) | `number` | `KRW`(`lib/money.ts`, 문자열) | `Number.isSafeInteger(n)` 검증 후 변환. 실패 시 `ContractMismatchError` |
| 금액(문자열 직렬화) | `string` | `KRW` | 숫자 형식 검증 후 그대로 보관. `number` 로 바꾸지 않는다 |
| 일시(시간대 포함 ISO-8601) | `string` | `Date` | `lib/date.ts` 의 파서 |
| 일시(시간대 없음) | `string` | `Date` | 계약이 정한 시간대를 붙여 파싱하는 헬퍼를 `lib/date.ts` 에 둔다 |
| 열거형 | 문자열 유니온 | 유니온 + `"UNKNOWN"` | 목록 밖 값은 `UNKNOWN` 으로 흡수, 화면은 기본 표기 |
| `nextCursor` | `number \| null` | 그대로 | `useInfiniteQuery` 의 `getNextPageParam` |
| `null` 가능 필드 | `T \| null` | `T \| null` | 상태 의미가 있는 `null` 은 `??` 로 기본값을 만들지 않는다 |

- 서버 파생값(잔액, 잔여율, 부족액 등)은 **검증만 하고 계산하지 않는다**.
- DTO 타입 이름은 계약 사본과 같게(`AccountResponse` → `AccountDto` 처럼 `Dto` 접미만). 두 도메인이 같이 쓰는 타입은 소유 도메인의 `model.ts` 에서 export.

## 4. 새 도메인 API 추가하는 법 — 예시: 계좌 목록 조회와 별칭 변경

### ① `features/account/model.ts`

```ts
import { ContractMismatchError } from "@/lib/contract";
import { maskAccountNumber } from "@/lib/mask";
import type { KRW } from "@/lib/money";

export type AccountType = "CHECKING" | "SAVINGS" | "UNKNOWN";

export type AccountDto = { accountId: number; bankName: string; accountNumber: string; type: string; balance: number; alias: string | null };
export type Account = { id: number; bankName: string; maskedNumber: string; type: AccountType; balance: KRW; alias: string | null };

function won(value: number, field: string): KRW {
  if (!Number.isSafeInteger(value)) throw new ContractMismatchError(field);
  return String(value);
}
const toType = (raw: string): AccountType => (raw === "CHECKING" || raw === "SAVINGS" ? raw : "UNKNOWN");

export function toAccount(dto: AccountDto): Account {
  return {
    id: dto.accountId,
    bankName: dto.bankName,
    maskedNumber: maskAccountNumber(dto.accountNumber),
    type: toType(dto.type),
    balance: won(dto.balance, "balance"),
    alias: dto.alias,
  };
}
```

### ② `features/account/api/account.api.ts`

```ts
import { api, isMocked } from "@/api/client";
import { accountsMock } from "@/api/mocks/account";
import { withMockLatency } from "@/api/mocks/latency";
import { toAccount, type Account, type AccountDto } from "@/features/account/model";

export async function getAccounts(signal?: AbortSignal): Promise<Account[]> {
  if (isMocked("account")) return (await withMockLatency(accountsMock, signal)).map(toAccount);
  const { data } = await api.get<{ items: AccountDto[] }>("/accounts", { signal });
  return data.items.map(toAccount);
}

export type UpdateAccountAliasInput = { accountId: number; alias: string };

export async function updateAccountAlias({ accountId, alias }: UpdateAccountAliasInput): Promise<void> {
  if (isMocked("account")) { await withMockLatency(undefined); return; }
  await api.put(`/accounts/${accountId}/alias`, { alias });
}
```

- 함수명은 동사로: `getXxx` / `createXxx` / `updateXxx` / `deleteXxx` / `confirmXxx` / `approveXxx`.
- 조회 함수의 마지막 인자는 `signal?: AbortSignal`(TanStack Query 가 취소에 쓴다).
- 호출부는 어떤 값이 path 로 가고 어떤 값이 body 로 가는지 몰라야 한다. 인자는 도메인 타입 하나.

### ③ `features/account/api/queries.ts`

```ts
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAccounts, updateAccountAlias, type UpdateAccountAliasInput } from "@/features/account/api/account.api";

export const accountKeys = {
  all: ["account"] as const,
  list: () => [...accountKeys.all, "list"] as const,
};

export const accountListQueryOptions = () =>
  queryOptions({ queryKey: accountKeys.list(), queryFn: ({ signal }) => getAccounts(signal), staleTime: 30_000 });

export const useAccounts = () => useQuery(accountListQueryOptions());

export function useUpdateAccountAlias() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAccountAliasInput) => updateAccountAlias(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: accountKeys.all }),
  });
}
```

### ④ 화면

```tsx
function AccountList() {
  const { data, isPending, isError, refetch } = useAccounts();
  if (isPending) return <Skeleton className="h-32" />;
  if (isError) return <EmptyState title="계좌를 불러오지 못했어요" action={{ label: "다시 시도", onPress: () => void refetch() }} />;
  if (data.length === 0) return <EmptyState title="연결된 계좌가 없어요" />;
  return <AccountCards accounts={data} />;
}
```

## 5. 쿼리 키와 무효화 지도

키는 반드시 `<domain>Keys` 팩토리로만 만든다. 어떤 변경이 어떤 조회를 낡게 만드는지는 계약이 정한 것이므로 아래 표를 따른다. 표에 없는 조합이 필요하면 표부터 고친다.

| 뮤테이션 | 무효화(invalidate) | 즉시 반영(setQueryData) |
| --- | --- | --- |
| `PUT /accounts/{id}/alias` | `accountKeys.all` | — |
| `POST /auth/login` | 전체 캐시 `queryClient.clear()` 후 시작 | — |
| `POST /auth/logout` | `queryClient.clear()`, SecureStore 토큰 삭제 | — |
| <메서드 경로> | <낡아지는 키> | <응답으로 바로 채울 값> |

## 6. 커서 페이지네이션

계약이 커서 방식이면 목록은 `useInfiniteQuery` 로 붙인다. 응답 `nextCursor` 가 `null` 이면 끝이다.

```ts
export const transactionListInfiniteOptions = (filters: TransactionFilters) =>
  infiniteQueryOptions({
    queryKey: transactionKeys.list(filters),           // 필터 전부가 키에 들어간다
    queryFn: ({ pageParam, signal }) => getTransactions({ ...filters, cursor: pageParam ?? undefined }, signal),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor,       // null 이면 hasNextPage=false
  });
```

`size` 는 계약의 기본값을 쓰고 화면이 바꾸지 않는다. 목록 합계를 화면에서 더해 보여주지 않는다(합계는 서버 값).

## 7. 에러 처리

- 모든 통신 실패는 `ApiError(status, code, message)` 로 정규화된다(`api/client.ts` 의 `toApiError`).
  - `status`: HTTP 상태. 네트워크 단절·타임아웃은 `0`.
  - `code`: 계약의 오류 코드(계약 사본 §3-0 카탈로그).
  - `message`: 서버 문구. 사용자에게 그대로 보여줘도 되는지는 계약을 따른다.
- 분기는 `isApiError(error)` 타입 가드 → `error.code` 로. 문구는 `features/<domain>/errors.ts` 에서 `code` 별로 정의하고, 정의가 없으면 도메인 기본 문구(계약이 허용하면 서버 `message`)를 쓴다. `status` 로만 분기하지 않는다(같은 409 라도 도메인마다 뜻이 다르다).
- 쿼리: 컴포넌트는 `isPending`/`isError`/`error` 만 보고 재시도 가능한 폴백 UI 를 렌더한다.
- 뮤테이션 + 폼: 로컬 오류 상태에 문구를 넣어 인라인으로 보여주고, 사용자 입력값은 유지한다.

```tsx
const FALLBACK = "별칭을 저장하지 못했어요. 다시 시도해 주세요.";

const { mutateAsync, isPending } = useUpdateAccountAlias();
const [error, setError] = useState<string | null>(null);

async function onSubmit() {
  setError(null);
  try {
    await mutateAsync({ accountId, alias });
    router.back();
  } catch (e) {
    setError(isApiError(e) ? (accountErrorMessage[e.code] ?? FALLBACK) : FALLBACK);
  }
}
```

- 재시도 정책은 `lib/query-client.ts` 전역: 쿼리 1회, 뮤테이션 0회. 4xx 는 재시도하지 않도록 `retry` 함수에서 `ApiError.status` 를 본다.
- 401 은 인터셉터가 처리하므로 화면에서 다루지 않는다. 403 은 재시도하지 않는다. 409 는 계약 사본의 뜻대로 문구를 보여준다.
- `console.log` 로 오류를 흘리지 않는다. 디버깅은 React Query Devtools.

## 8. 낙관적 업데이트

서버 캐시 안에 사는 값의 선반영은 TanStack Query 캐시 계층에서 한다(`onMutate` 스냅샷 → `onError` 롤백 → `onSettled` 무효화).

- **허용**: 알림 읽음 처리, 즐겨찾기처럼 실패해도 돈·잔액에 영향이 없는 토글.
- **금지**: 이체·결제·구매처럼 돈이 움직이거나 서버가 값을 계산하는 요청. 서버가 계산한 응답(잔액, 상태)을 받은 뒤 `setQueryData` 로 반영한다.

```ts
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<Notification[]>(notificationKeys.list());
      queryClient.setQueryData<Notification[]>(notificationKeys.list(), (old) => old?.map((n) => (n.id === id ? { ...n, read: true } : n)));
      return { previous };
    },
    onError: (_e, _v, ctx) => { if (ctx?.previous) queryClient.setQueryData(notificationKeys.list(), ctx.previous); },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
```

## 9. 목 데이터

- 목 분기는 **도메인 단위**다. 도메인 함수 첫 줄에서 `isMocked("<domain>")` 으로 확인하고, 참이면 `api/mocks/<domain>.ts` 값을 돌려준다.
- 스위치는 환경 변수 두 개로 정해진다.
  - `EXPO_PUBLIC_API_URL` 이 비어 있으면 **전부 목**이다.
  - 주소가 있고 `EXPO_PUBLIC_LIVE_DOMAINS` 가 비어 있으면 **전부 실서버**다.
  - 주소가 있고 목록이 있으면 **적힌 도메인만 실서버**고 나머지는 목이다(`all` 은 전부). 모르는 이름은 무시한다.
- 백엔드가 도메인별로 배포되는 동안 쓰는 장치다. 예: `EXPO_PUBLIC_LIVE_DOMAINS=auth,account` 면 AUTH·ACCOUNT 만 실서버로 가고 나머지는 목으로 남는다.
- `.env` 는 추적하지 않는다(`.gitignore`). 공유할 형식·설명은 `.env.example` 에만 둔다.
- 목 값은 **계약 사본의 응답 예시를 그대로** 옮긴다. 필드를 더하거나 빼지 않는다. 계약이 바뀌면 목과 `model.ts` 를 같이 고친다.
- 실제 계좌번호·카드번호·개인 정보를 넣지 않는다. 예시의 더미 값만 쓴다.
- 지연은 `withMockLatency`(400ms)로 흉내 내고 `signal` 취소를 지원한다. 오류 시나리오(401·409·네트워크)는 목 함수에 옵션으로 두어 폴백 UI 를 확인한다.

## 10. 금지 사항

- 컴포넌트·라우트에서 `api/` 인스턴스나 도메인 함수 직접 호출 금지 — 항상 `features/<domain>/api/queries.ts` 의 훅 경유.
- `api/client.ts` 의 인스턴스를 인터셉터 없이 새로 만들지 않는다(인증·오류 정규화 우회 방지).
- 쿼리 키 문자열 하드코딩 금지 — `<domain>Keys` 팩토리만.
- `useEffect` + `useState` 로 서버 데이터 보관 금지 — 서버 상태는 TanStack Query 가 소유. 편집 중인 사본만 Zustand·로컬 상태.
- 잔액·잔여율·부족액 같은 서버 파생값을 클라이언트에서 계산해 표시 금지.
- 계약 사본에 없는 엔드포인트·필드·열거형 값을 가정해 코드에 넣지 않는다. 필요하면 백엔드에 요청하고 보고서에 `TBD`.
- 스펙과 실제 응답이 다르면 `model.ts` 에서 우회하지 않고 `ContractMismatchError` 로 드러내고 보고한다.

## 11. 미확정 (TBD)

- <계약은 정해졌지만 코드에 아직 없는 것, 백엔드 확인을 기다리는 것을 적는다>
