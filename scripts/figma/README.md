# Figma 로컬 플러그인 — 디자인 가져오기

`design/tokens.json`과 `design.pen`의 `home` 구조를 Figma에 **편집 가능한 노드·변수·스타일**로 재현하는 Figma Plugin API 스크립트다. 커뮤니티 플러그인 없이, Starter 플랜의 내 파일(편집 권한)에서 동작한다.

## 파일
- `build-plugin.cjs` — 생성기. `tokens.json`(색 35 × light/dark, 타이포 13, 반경, 크기)과 lucide 아이콘 16개를 읽어 `code.js`를 만든다. `pnpm figma:build`
- `code.template.js` — 플러그인 본문 템플릿(화면 구조는 여기서 수정)
- `code.js` — 생성물. 직접 수정하지 않는다
- `manifest.json` — 플러그인 매니페스트

## 실행
1. `pnpm figma:build`
2. Figma **데스크톱 앱**에서 편집 가능한 파일(내 Drafts) 열기
3. 메뉴 `Plugins → Development → Import plugin from manifest…` → `scripts/figma/manifest.json` 선택
4. `Plugins → Development → reactNativeHaness design import` 실행
5. 완료 알림 후 `Foundations` 페이지(Color style / Text style 프레임), `Screens` 페이지(`home`, `home/dark`) 확인

## 만드는 것
- Variables: 컬렉션 `color`(light 모드, 가능하면 dark 모드 추가 — Starter처럼 컬렉션당 모드 1개면 `color/dark` 컬렉션으로 분리), `radius`, `size`
- Styles: `color/light/*`, `color/dark/*` 페인트 스타일, `text/*` 텍스트 스타일
- 색은 변수에 바인딩, 텍스트는 텍스트 스타일에 연결

## 서체
`Pretendard` → `Noto Sans KR` → `Inter` 순으로 설치된 것을 쓴다. `Semi Bold`처럼 스타일 이름이 다른 서체는 자동으로 대체한다.

## 재실행
플러그인은 기존 변수·스타일을 갱신하지 않고 **새로 만든다**. 다시 실행하기 전에 이전 결과(페이지·변수·스타일)를 지우거나 새 파일에서 실행한다.

## 실행 후
생성된 프레임 URL(`Copy link`)을 `design/figma-map.json`의 `screens.home.url`, `components.*.url`에 기록하고, Variables가 생겼으므로 `figma-sync` 스킬로 `tokens.json`의 `$source.figmaFileKey`를 채운다.
