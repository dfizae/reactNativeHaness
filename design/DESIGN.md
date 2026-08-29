# 디자인 스펙 (DESIGN.md)

> 이 문서는 UI 작업의 **원천 문서**다. 값의 원천은 `design/tokens.json`이며, 이 문서는 그 값을 어떤 의도로 쓰는지 설명한다.
> 디자인 톤·컴포넌트 스타일은 **아직 확정되지 않았다.** 아래 값은 하네스 데이터(`ui-ux-pro-max/data/colors.csv` #42 Banking/Traditional Finance, `typography.csv` #31 Financial Trust)를 기반으로 한 **초안**이며, `design.pen`에서 Figma 플러그인으로 불러온 디자인이 확정되면 `figma-sync` 스킬이 이 문서와 `tokens.json`을 갱신한다.
>
> 상태: **초안 (Figma 미동기화)** — `$source.lastSyncedAt: null`

## 1. 제품 성격과 디자인 톤 (초안)

- 도메인: 모바일 핀테크(계좌 조회, 이체, 결제, 인증). 사용자는 돈을 다루므로 **신뢰·정확·차분함**이 최우선이다.
- 톤 키워드: 신뢰(Trust), 명료(Clarity), 절제(Restraint). 화려함보다 정보의 정확한 위계.
- 무드: 라이트 모드는 흰 카드 + 아주 옅은 slate 캔버스, 다크 모드는 navy(`slate-950`) 캔버스 + `slate-900` 카드. 순수 검정(`#000`) 배경은 쓰지 않는다.
- 포인트 컬러는 브랜드 블루 하나(`primary`). 골드(`highlight`)는 프리미엄 등급·혜택 강조에 한 화면당 한 곳만.
- 그라데이션, 글래스모피즘, 장식용 일러스트는 온보딩·이벤트 배너 외에는 쓰지 않는다.
- 아이콘은 `lucide-react-native` 단일 세트, `components/ui/icon.tsx`의 `Icon`으로 감싸 className을 적용한다. 이모지 아이콘 금지.

## 2. 색상 토큰 (shadcn / React Native Reusables 규약)

시맨틱 토큰만 사용한다. 프리미티브(`blue-800`, `slate-200`)는 `tailwind.config.js`에 노출되지 않으므로 className에서 쓸 수 없다. 예외: `white`, `black`(모드 무관 고정값).

규약: `X` = 배경, `X-foreground` = 그 위의 텍스트, `X-muted` = 옅은 배경(배지·강조 영역).

| 역할 | 토큰 | className 예 |
|---|---|---|
| 화면 배경 | `background` / `foreground` | `bg-background text-foreground` |
| 카드·목록 항목 | `card` / `card-foreground` | `bg-card` (RNR `Card`) |
| 다이얼로그·시트·메뉴 | `popover` / `popover-foreground` | `bg-popover` |
| 주요 버튼·활성·링크 | `primary` / `primary-foreground` | `bg-primary text-primary-foreground` (RNR `Button` default) |
| 보조 버튼 | `secondary` / `secondary-foreground` | RNR `Button variant="secondary"` |
| 입력 배경·스켈레톤·비활성 | `muted` / `muted-foreground` | `bg-muted`, 보조 텍스트 `text-muted-foreground` |
| 눌림·선택 배경 | `accent` / `accent-foreground` | RNR ghost/outline active |
| 출금·손실·오류·파괴적 액션 | `destructive` / `destructive-foreground` / `destructive-muted` | `text-destructive`, 배지 `bg-destructive-muted text-destructive` |
| 입금·수익·성공 | `positive` / `positive-foreground` / `positive-muted` | `text-positive`, 배지 `bg-positive-muted text-positive` |
| 경고 | `warning` / `warning-foreground` / `warning-muted` | `text-warning` |
| 정보 | `info` / `info-foreground` / `info-muted` | `bg-info-muted text-info` |
| 프리미엄·혜택 골드 | `highlight` / `highlight-foreground` | `text-highlight` |
| 토스트·툴팁 | `inverse` / `inverse-foreground` | `bg-inverse text-inverse-foreground` |
| 테두리 | `border` | `border-border` |
| 입력 테두리 | `input` | `border-input` (RNR `Input`) |
| 포커스 링 | `ring` | `border-ring` |
| 오버레이 | `black/50` | 다이얼로그 스크림 (RNR `Dialog`) |

### 금액 부호 색상 (명시 규칙)

- 이 프로젝트에서 **입금/수익 = `positive`(green), 출금/손실 = `destructive`(red)** 로 고정한다.
- 증권 시세(상승 빨강·하락 파랑)의 한국 관례를 따라야 하는 화면이 생기면 별도 토큰(`up`/`down`)을 Figma에서 추가한 뒤 동기화한다. 기존 토큰의 의미를 바꾸지 않는다.
- 색만으로 의미를 전달하지 않는다. 금액 앞에 `+`/`-` 부호 또는 "입금"/"출금" 텍스트를 항상 함께 둔다.

### 라이트/다크

- `global.css`의 `:root`(라이트)와 `.dark:root`(다크) CSS 변수로 전환된다. `darkMode: "class"`이며 NativeWind `useColorScheme()`의 `setColorScheme('light' | 'dark' | 'system')`으로 제어한다. 기본은 시스템 설정을 따른다.
- 색상에 `dark:` variant를 직접 쓰지 않는다. 다크에서 구조가 달라지는 경우(그림자 → 테두리)에만 `dark:`를 쓴다. RNR 컴포넌트 원본에 포함된 `dark:` 클래스는 그대로 둔다.

## 3. 타이포그래피

- 서체: **Pretendard** 단일 패밀리. `app.json`의 `expo-font` 플러그인으로 등록되어 있으며(`assets/fonts/Pretendard-{Regular,Medium,SemiBold,Bold}.otf`) Android는 `fontDefinitions`로 weight가 매핑되어 `fontWeight`만으로 굵기 파일이 선택된다. **개발 빌드(`expo prebuild`/EAS)에서 적용되며 Expo Go에서는 시스템 폰트로 폴백**된다.
- `components/ui/text.tsx`의 `Text`가 기본 클래스에 `font-sans`를 포함하므로 모든 텍스트는 이 `Text`를 사용한다. React Native `Text`를 직접 쓰지 않는다.
- 가중치: 400(본문), 500(라벨), 600(제목·버튼·금액), 700(디스플레이·큰 금액). 세 단계 이상을 한 컴포넌트에 섞지 않는다.
- 금액과 숫자 열은 항상 `tabular-nums` 클래스를 함께 쓴다.
- 한글 제목은 `letterSpacing` 음수(-0.3 ~ -0.5). 본문은 0.
- 최소 크기 12pt. 본문 기본 16pt.
- 시스템 글꼴 크기 조정을 존중한다. 금액 표시는 `maxFontSizeMultiplier={1.3}`로 레이아웃 붕괴를 막되 비활성화하지 않는다.

타이포 토큰 클래스는 크기·행간·자간·가중치를 함께 설정한다. Tailwind 기본 `text-sm`, `text-base` 등은 RNR 컴포넌트 내부용으로 유지되며, 화면 코드에서는 아래 토큰을 우선한다.

| 클래스 | 크기/행간 | 가중치 | 용도 |
|---|---|---|---|
| `text-display` | 32/40 | 700 | 온보딩 헤드라인 |
| `text-amount-lg` | 36/44 tabular | 700 | 잔액, 이체 금액 입력 |
| `text-amount-md` | 24/32 tabular | 600 | 카드 내 잔액 |
| `text-amount-sm` | 16/24 tabular | 600 | 거래 목록 금액 |
| `text-h1` | 24/32 | 600 | 화면 제목 |
| `text-h2` | 20/28 | 600 | 섹션 제목 |
| `text-h3` | 18/26 | 600 | 카드 제목 |
| `text-body-lg` | 18/28 | 400 | 강조 본문 |
| `text-body` | 16/24 | 400 | 기본 본문 |
| `text-body-sm` | 14/20 | 400 | 보조 설명 |
| `text-label` | 14/20 | 500 | 입력 라벨, 탭 |
| `text-caption` | 12/16 | 400 | 날짜, 법적 고지 |
| `text-button` | 16/24 | 600 | 버튼 |

## 4. 간격 · 형태 · 크기

- 4px 그리드(Tailwind 기본 스케일). 화면 좌우 패딩 `px-5`(20). 카드 내부 `p-4`(16). 섹션 간격 `gap-6`(24).
- 모서리: 배지 `rounded-sm`(6), 입력·버튼 `rounded-md`(10), 다이얼로그·목록 그룹 `rounded-lg`(14), 카드·시트 `rounded-xl`(20).
- 그림자: iOS/Android 차이가 커서 `shadow-sm`까지만. 다크 모드에서는 그림자 대신 `border-border`.
- 터치 타깃 최소 44pt(`min-h-touch min-w-touch`). 주요 CTA 높이 `h-button-lg`(56), 일반 버튼 `h-button-md`(48), 입력 `h-input`(52).
- 모션: `duration-fast/base/slow` = 150/220/320ms. 화면 전환은 플랫폼 기본. 금액 카운트업 같은 장식 애니메이션은 쓰지 않는다.

## 5. 컴포넌트 인벤토리

### 5-1. React Native Reusables (설치됨, `components/ui/`)

`pnpm ui:add https://reactnativereusables.com/r/nativewind/<name>.json`으로 추가한다. 추가 후 `pnpm tokens:check`를 통과하도록 arbitrary value만 조정하고 나머지는 원본을 유지한다.

| 파일 | 내보내기 | 비고 |
|---|---|---|
| `text.tsx` | `Text`, `TextClassContext` | 기본 클래스에 `font-sans` 추가(프로젝트 수정) |
| `button.tsx` | `Button`, `buttonVariants` | variant `default(primary)` `secondary` `outline` `ghost` `destructive` `link`, size `default` `sm` `lg` `icon` |
| `input.tsx` | `Input` | `border-input bg-background` |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `bg-card rounded-xl` |
| `badge.tsx` | `Badge` | variant `default` `secondary` `destructive` `outline` |
| `skeleton.tsx` | `Skeleton` | `bg-muted` |
| `separator.tsx` | `Separator` | |
| `icon.tsx` | `Icon` | lucide 아이콘 래퍼, `className`으로 색·크기 |
| `dialog.tsx` | `Dialog`, `DialogTrigger`, `DialogContent`, … | 루트 레이아웃의 `PortalHost` 필요(설정됨) |

### 5-2. 프로젝트 전용 (Figma 컴포넌트명 = 코드명)

| Figma 컴포넌트 | 코드 | 기반 | variant / size |
|---|---|---|---|
| `AmountText` | `components/ui/amount-text.tsx` | `Text` | `lg` `md` `sm`, `sign` |
| `AmountInput` | `components/ui/amount-input.tsx` | `Input` | 통화 `KRW` 고정, 콤마 포맷 |
| `EmptyState` | `components/ui/empty-state.tsx` | `Text`, `Icon`, `Button` | 빈 목록·오류 |
| `Toast` | `components/ui/toast.tsx` | — | `info` `success` `error`, `bg-inverse` |
| `BottomSheet` | `components/ui/bottom-sheet.tsx` | `Dialog` 또는 별도 | `bg-popover` |
| `ListGroup` | `components/ui/list-group.tsx` | `Separator` | 설정·메뉴 목록 |
| `AccountCard` | `features/account/components/AccountCard.tsx` | `Card` | `default` `selected` |
| `TransactionRow` | `features/account/components/TransactionRow.tsx` | `Text`, `Badge` | `deposit` `withdrawal` `pending` |
| `PinPad` | `features/auth/components/PinPad.tsx` | `Button` | 6자리, 셔플 옵션 |

컴포넌트가 아직 코드에 없으면 위 이름과 variant를 그대로 사용해 만든다. 이름을 바꿔야 하면 Figma를 먼저 바꾸고 이 표를 동기화한다.

## 6. 화면 패턴

- 화면 제목은 `text-h1` 하나. 뒤로가기는 플랫폼 기본 헤더 또는 좌상단 아이콘 버튼(`accessibilityLabel="뒤로"`).
- 하단 탭은 최대 5개. 이체·결제 같은 핵심 액션은 탭이 아니라 홈 상단 CTA.
- 이체 플로우는 `받는 사람 → 금액 → 확인 → 인증(PIN/생체) → 완료`의 5단계를 넘지 않는다. 확인 화면은 금액을 `text-amount-lg`로, 받는 사람·계좌를 마스킹해 표시한다.
- 로딩은 스피너보다 `Skeleton`. 1초 이상 걸리는 작업에만 진행 표시.
- 오류는 필드 근처에 원인 + 해결 방법. 재시도 버튼은 중복 요청을 막는다.
- 민감 정보(계좌번호 전체, 카드번호)는 기본 마스킹, 명시적 "보기" 액션으로만 노출.

## 7. 동기화 섹션 (figma-sync가 갱신)

| 항목 | 값 |
|---|---|
| Pencil 작업 파일 | `design.pen` (Figma 플러그인으로 불러올 예정) |
| Figma 파일 | TBD |
| Variables 컬렉션 | TBD |
| 마지막 동기화 | 없음 |
| 동기화 담당 | `.agents/skills/figma-sync/SKILL.md` |
