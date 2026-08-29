---
name: pencil-design
description: Pencil(pen.dev) 캔버스에서 design/tokens.json 기반으로 모바일 화면을 드래프트한다. 새 화면 탐색, 플로우 시안, 레이아웃 대안 비교가 필요할 때 사용한다. 확정 원천은 Figma이며 Pencil은 탐색 도구다.
metadata:
  author: project
  version: "1.0.0"
---

# pencil-design

Pencil은 에이전트가 빠르게 화면을 그려 보고 사용자와 방향을 맞추는 **탐색 캔버스**다. 여기서 확정된 방향을 Figma에 옮기고, 코드는 Figma를 따른다.

## 언제 쓰는가

- 아직 Figma에 없는 화면의 시안이 필요할 때
- 한 화면의 레이아웃 대안을 2~3개 나란히 비교할 때
- 이체·인증 같은 플로우 전체를 아트보드 연속으로 보여줄 때
- "이 화면 어떻게 생길지 그려줘" 류의 요청

## 전제

- Pencil 에디터에 `.pen` 파일이 열려 있어야 MCP가 응답한다. 응답이 없으면 `design.pen`을 열어 달라고 요청한다.
- 작업 시작 시 반드시 순서대로 호출한다:
  1. `mcp__pencil__get_app_state` — 열린 파일, 선택 상태, 사용 가능한 기능 확인
  2. `mcp__pencil__read_skill` — Pencil 공식 스킬(캔버스 조작·`.pen` 스키마·`execute` 사용법) 읽기. 이 스킬이 Pencil 조작법의 원천이며 본 문서는 프로젝트 규약만 다룬다.
  3. `mcp__pencil__get_style` — 파일에 정의된 스타일/변수 확인
- `.pen` 파일은 암호화되어 있다. Read/Grep으로 열지 않는다.

## 프로젝트 규약

### 파일과 아트보드

- 파일: 메인 작업 파일은 `design.pen`(Figma 플러그인 임포트). 대안 탐색만 `design/pencil/<flow>-<screen>.pen`으로 분리한다.
- 아트보드 이름 = `design/figma-map.json`의 `screens` 키 (`home`, `transfer-amount`, …). 대안은 `transfer-amount/alt-1`처럼 슬래시로 구분.
- 프레임 크기: 390×844 (iPhone 기준). 안전 영역 상단 59, 하단 34를 가이드로 둔다.

### 토큰 적용

- 그리기 전에 `design/tokens.json`을 읽고, Pencil 변수(스타일)를 시맨틱 토큰 이름으로 정의한다: `background`, `card`, `foreground`, `muted-foreground`, `primary`, `positive`, `destructive`, `border` 등. 값은 tokens.json의 light 모드 값을 그대로 쓴다.
- 도형·텍스트 색은 위 변수만 참조한다. 임의 hex를 캔버스에 직접 찍지 않는다.
- 텍스트 스타일은 `design/DESIGN.md` 3장의 표(`h1` 24/32 600, `body` 16/24 400, `amount-lg` 36/44 700 …)를 그대로 스타일로 등록해 사용한다. 폰트는 Pretendard, 없으면 시스템 sans로 대체하되 이름은 유지한다.
- 간격은 4의 배수, 좌우 여백 20, 카드 패딩 16, 모서리 6/10/14/20만 사용한다.

### 컴포넌트

- `DESIGN.md` 5장 인벤토리 이름으로 그룹을 만든다 (`Button/primary/lg`, `AccountCard/default`, `TransactionRow/withdrawal`).
- 한 파일에서 같은 컴포넌트를 두 번 이상 쓰면 Pencil 컴포넌트/인스턴스 기능(공식 스킬 참조)으로 묶는다.
- 아이콘은 lucide 이름을 텍스트 라벨로 붙여 둔다(`icon: arrow-left`). 이모지를 아이콘 자리에 쓰지 않는다.

### 핀테크 화면에서 반드시 표현할 것

- 금액은 tabular 숫자, 부호(`+`/`-`) 또는 "입금/출금" 텍스트를 색과 함께 표시.
- 계좌번호는 마스킹 상태(`110-***-***890`)가 기본.
- 이체 확인 화면은 받는 사람·계좌·금액·수수료·도착 예정을 모두 포함.
- 로딩(스켈레톤), 빈 상태, 오류 상태 아트보드를 최소 하나씩 추가. 실패한 요청에는 재시도 버튼.
- 주요 CTA는 화면 하단 고정, 높이 56, 안전 영역 위.

## 절차

1. 요청 화면이 `figma-map.json`에 있는지 확인. Figma URL이 있으면 Pencil 드래프트 대신 `figma-sync` 절차 D로 간다(이미 확정본이 있음).
2. `get_app_state` → `read_skill` → `get_style`.
3. 토큰 변수·텍스트 스타일이 파일에 없으면 먼저 정의한다.
4. 아트보드를 그린다. 대안이 필요하면 가로로 나란히 배치한다.
5. 스크린샷(공식 스킬에서 제공하는 방식)으로 결과를 확인하고 사용자에게 보여준다.
6. 사용자가 방향을 확정하면: Figma 반영을 제안하고(쓰기 권한 필요), `figma-map.json`에 `pencil: "design/pencil/<file>.pen#<artboard>"` 필드를 추가해 출처를 남긴다.

## 금지

- Pencil 드래프트를 근거로 코드를 바로 구현하지 않는다. 코드는 Figma 확정본 또는 `DESIGN.md`를 따른다. 사용자가 "Pencil 시안대로 구현"을 명시하면 보고서에 그 사실을 적는다.
- tokens.json에 없는 색·크기를 Pencil에서 임의로 만들어 쓰지 않는다. 필요하면 토큰 추가 요청 목록에 적는다.
- Pencil MCP가 응답하지 않는 상태에서 그린 것처럼 보고하지 않는다.
