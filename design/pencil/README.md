# Pencil 대안 드래프트 (`design/pencil/`)

**메인 작업 파일은 리포 루트의 `design.pen`이다.** 디자인 톤과 컴포넌트 스타일은 아직 확정되지 않았으며, `design.pen`에 Figma 플러그인으로 디자인을 불러온 뒤 확정할 예정이다. 에이전트는 `design.pen`이 에디터에 열려 있을 때만 Pencil MCP를 쓸 수 있다.

이 디렉토리(`design/pencil/`)는 메인 파일과 분리해 탐색할 대안 드래프트(`<flow>-<screen>.pen`)만 둔다. 확정되면 `design.pen`으로 옮기고 여기 파일은 히스토리로 남긴다.

## 확정 흐름

```
Figma 플러그인 → design.pen (탐색·확정)  ──▶ Figma 파일 정리(Variables/컴포넌트) ──figma-sync──▶ design/tokens.json · DESIGN.md · figma-map.json
```

- Figma Variables가 아직 없는 동안은 `design.pen`의 스타일(`get_style`)을 읽어 `tokens.json`의 초안 값을 갱신할 수 있다. 이 경우 `$source.lastSyncedAt`은 `null`로 두고 `pencilFile`만 기록한다.
- 확정 값의 원천은 최종적으로 Figma Variables다.

## 규약

- 아트보드 이름은 `design/figma-map.json`의 `screens` 키와 같게 한다 (`home`, `transfer-confirm` 등).
- 색·타이포·간격은 `design/tokens.json`의 시맨틱 토큰 이름(`background`, `card`, `primary`, `muted-foreground`, `positive`, `destructive` …)으로 Pencil 스타일을 정의하고 그 스타일만 참조한다.
- 컴포넌트 이름은 `DESIGN.md` 5장의 인벤토리와 동일하게 짓는다.

## 에이전트 작업 절차

1. Pencil 에디터에서 루트의 `design.pen`을 연다.
2. `mcp__pencil__get_app_state` → 선택 상태 확인, `mcp__pencil__read_skill` → 캔버스 조작법 확인, `mcp__pencil__get_style` → 스타일 확인.
3. `.agents/skills/pencil-design/SKILL.md`의 절차에 따라 토큰 기반으로 화면을 그린다.
4. 확정되면 Figma에 반영하고 `figma-map.json`에 노드 URL을 기록한다.

`.pen` 파일은 암호화되어 있으므로 Read/Grep으로 열지 않는다.
