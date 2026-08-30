#!/usr/bin/env node
/**
 * design/tokens.json + lucide 아이콘 → scripts/figma/code.js (Figma 로컬 플러그인) 생성
 *
 *   node scripts/figma/build-plugin.cjs
 *
 * 사용: Figma 데스크톱 앱 → Plugins → Development → Import plugin from manifest… → scripts/figma/manifest.json 선택 → 실행.
 * 편집 권한이 있는 파일이면 Starter 플랜에서도 동작한다(모드가 1개로 제한되면 다크 값은 color/dark 컬렉션으로 생성).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, "design", "tokens.json"), "utf8"));
const MODES = tokens.$modes ?? ["light", "dark"];

function getByPath(obj, dotted) {
  return dotted.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}
function resolve(value, depth = 0) {
  if (depth > 10) throw new Error(`토큰 참조가 너무 깊습니다: ${JSON.stringify(value)}`);
  if (typeof value === "string") {
    const m = value.match(/^\{(.+)\}$/);
    if (!m) return value;
    const target = getByPath(tokens, m[1]);
    if (target === undefined) throw new Error(`참조를 찾을 수 없습니다: ${value}`);
    return resolve(target.$value !== undefined ? target.$value : target, depth + 1);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = resolve(v, depth + 1);
    return out;
  }
  return value;
}
function walk(group, prefix, visit) {
  for (const [key, node] of Object.entries(group)) {
    if (key.startsWith("$")) continue;
    if (node && typeof node === "object" && "$value" in node) visit([...prefix, key], node);
    else if (node && typeof node === "object") walk(node, [...prefix, key], visit);
  }
}

const colors = Object.fromEntries(MODES.map((m) => [m, {}]));
walk(tokens.semantic.color, [], (parts, node) => {
  const raw = resolve(node.$value);
  for (const m of MODES) colors[m][parts.join("-")] = (typeof raw === "object" ? raw[m] : raw).toUpperCase();
});
for (const fixed of ["white", "black"]) {
  const v = resolve(tokens.primitive.color[fixed].$value).toUpperCase();
  for (const m of MODES) colors[m][fixed] = v;
}
const typography = {};
walk(tokens.semantic.typography, [], (parts, node) => {
  const t = resolve(node.$value);
  typography[parts.join("-")] = { fontSize: t.fontSize, lineHeight: t.lineHeight, fontWeight: Number(t.fontWeight), letterSpacing: t.letterSpacing };
});
const dims = (group) => {
  const out = {};
  walk(group, [], (parts, node) => {
    const v = resolve(node.$value);
    if (typeof v === "number" && v < 9999) out[parts.join("-")] = v;
  });
  return out;
};

const samples = {
  display: "온보딩 헤드라인 Display",
  "amount-lg": "1,250,000원",
  "amount-md": "3,469,520원",
  "amount-sm": "-30,000원 / +1,250,000원",
  h1: "화면 제목 Title 1",
  h2: "섹션 제목 Title 2",
  h3: "카드 제목 Title 3",
  "body-lg": "강조 본문 Body large",
  body: "기본 본문 Body 2 — 계좌를 연결하면 잔액을 여기서 볼 수 있어요.",
  "body-sm": "보조 설명 Body 3 — 연결 상태를 확인한 뒤 다시 시도해 주세요.",
  label: "입력 라벨 · 탭 · 카테고리명",
  caption: "날짜 · 상태 · 법적 고지 Caption 2",
  button: "이체하기 Button",
};

// ---------- lucide 아이콘 → SVG ----------
const ICON_NAMES = ["user", "bell", "eye", "wallet", "arrow-left-right", "banknote", "smartphone", "receipt", "piggy-bank", "credit-card", "chart-column", "users", "house", "search", "mail", "settings"];
const iconsDir = path.join(ROOT, "node_modules", "lucide-react-native", "dist", "esm", "icons");
const icons = {};
for (const name of ICON_NAMES) {
  const src = fs.readFileSync(path.join(iconsDir, `${name}.mjs`), "utf8");
  const m = src.match(/createLucideIcon\("[^"]+",\s*(\[[\s\S]*?\])\);/);
  if (!m) throw new Error(`아이콘 파싱 실패: ${name}`);
  const nodes = new Function(`return ${m[1]}`)();
  const body = nodes
    .map(([tag, attrs]) => {
      const attrText = Object.entries(attrs)
        .filter(([k]) => k !== "key")
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${tag} ${attrText}/>`;
    })
    .join("");
  icons[name] = `<svg xmlns="http://www.w3.org/2000/svg" width="__SIZE__" height="__SIZE__" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

const TOKENS = { colors, typography, radius: dims(tokens.semantic.radius), size: dims(tokens.semantic.size), samples };
const template = fs.readFileSync(path.join(__dirname, "code.template.js"), "utf8");
const code = template.replace("__TOKENS__", JSON.stringify(TOKENS, null, 2)).replace("__ICONS__", JSON.stringify(icons, null, 2));
fs.writeFileSync(path.join(__dirname, "code.js"), code);
console.log(`생성: scripts/figma/code.js (색 ${Object.keys(colors.light).length} × ${MODES.length}모드, 타이포 ${Object.keys(typography).length}, 아이콘 ${ICON_NAMES.length})`);
