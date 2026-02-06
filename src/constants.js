/** 원본(md.takjakim.kr)과 동일한 키/구조로 호환 */
export const DEFAULT_SETTINGS = {
  breaks: true,
  emoji: true,
  highlight: true,
  fontFamily: "nanum-gothic",
  fontSize: 10,
  lineHeight: 1.6,
  wordBreak: "keep-all",
  textIndent: "0",
  scale: 1,
  margin: { top: "15mm", right: "20mm", bottom: "15mm", left: "20mm" },
  tableStyle: "hwp",
  headingStyle: "default",
  pageBreakBeforeH1: false,
  pageBreakBeforeH2: false,
  pageBreakBeforeH3: false,
  coverPage: false,
  tocPage: false,
  dividerPage: false,
  headerEnabled: true,
  headerFontSize: 9,
  headerLeft: "title",
  headerCenter: "none",
  headerRight: "date",
  footerEnabled: true,
  footerFontSize: 9,
  footerLeft: "none",
  footerCenter: "pageNumber",
  footerRight: "none",
  headerLeftCustom: "",
  headerCenterCustom: "",
  headerRightCustom: "",
  footerLeftCustom: "",
  footerCenterCustom: "",
  footerRightCustom: "",
  pageNumberStart: 1,
  pageNumberFormat: "current/total",
  pageNumberCustom: "{{page}} / {{total}}",
  tocDepth: 3,
  headingBoxDepth: 3,
  customCss: "",
  printBackground: true,
  hideHeaderFooterOnSpecialPages: true,
};

export const DEFAULT_MARKDOWN = `---
title: HWP MD PDF 웹 서비스
subtitle: 마크다운을 한글 스타일 PDF로 변환
author: 작성자
date: 2026-02-05
organization: 소속 기관
---

# 제목 1
본문 내용입니다. **굵은 글씨**와 *이탤릭*을 지원합니다.

## 제목 2
### 제목 3

| 항목 | 설명 |
|------|------|
| A | 첫 번째 |
| B | 두 번째 |

> 인용문 블록입니다.

\`\`\`javascript
function hello() {
  console.log("Hello, HWP MD PDF!");
}
\`\`\`

- 목록 항목 1
- 목록 항목 2
  - 하위 항목
`;

export const HELP_STEPS = [
  { title: "📁 문서 관리", desc: "• 새 문서: 현재 작업 중인 내용을 지우고 새 문서를 시작합니다 • 폴더 연결: 로컬 폴더를 연결하면 마크다운에서 상대 경로로 이미지를 불러올 수 있습니다 • 불러오기: .md 또는 .txt 파일을 불러옵니다 • 저장하기: 현재 문서를 .md 파일로 저장합니다" },
  { title: "📤 내보내기", desc: "• HTML: 스타일이 적용된 HTML 파일로 내보냅니다 • PDF: 인쇄 대화상자를 열어 PDF로 저장합니다" },
  { title: "✏️ 편집 도구", desc: "• 되돌리기/다시실행: 작업을 취소하거나 다시 실행합니다 • 표: 마크다운 표를 삽입합니다 • 수평선: 구분선(---)을 삽입합니다 • 코드 블록: 코드 블록을 삽입합니다 • 인용: 인용문(>)을 삽입합니다 • 링크/이미지: 링크와 이미지를 삽입합니다" },
  { title: "👁️ 보기 모드", desc: "• 편집: 마크다운 편집기만 표시합니다 • 분할: 편집기와 미리보기를 나란히 표시합니다 • 미리보기: 렌더링된 결과만 표시합니다" },
  { title: "⚙️ 설정", desc: "설정 패널을 열어 문서 스타일을 세부적으로 조정할 수 있습니다. 다음 단계에서 각 설정 항목을 안내합니다." },
  { title: "📐 확대/축소", desc: "문서 미리보기와 PDF 출력 크기를 조정합니다." },
  { title: "🔤 글꼴", desc: "본문과 제목에 사용할 글꼴을 선택합니다." },
  { title: "📏 크기", desc: "글자 크기와 줄 간격을 조정합니다." },
  { title: "📄 여백", desc: "페이지 상하좌우 여백을 설정합니다." },
  { title: "📑 특수 페이지", desc: "표지, 목차, 간지 페이지를 추가할 수 있습니다." },
  { title: "📋 헤더", desc: "페이지 상단에 표시될 머리글을 설정합니다." },
  { title: "📄 푸터", desc: "페이지 하단에 표시될 바닥글과 페이지 번호를 설정합니다." },
];

export const EMOJI_MAP = {
  smile: "😄", grin: "😁", laugh: "😆", joy: "😂", rofl: "🤣",
  wink: "😉", blush: "😊", innocent: "😇", heart_eyes: "😍", kiss: "😘",
  thinking: "🤔", shush: "🤫", zipper: "🤐", raised_eyebrow: "🤨",
  neutral: "😐", expressionless: "😑", unamused: "😒", roll_eyes: "🙄",
  grimace: "😬", lying: "🤥", relieved: "😌", sleepy: "😪", sleeping: "😴",
  mask: "😷", nerd: "🤓", sunglasses: "😎", disguised: "🥸",
  confused: "😕", worried: "😟", frown: "🙁", sad: "😢", cry: "😭",
  angry: "😠", rage: "🤬", skull: "💀", poop: "💩",
  clown: "🤡", ghost: "👻", alien: "👽", robot: "🤖",
  heart: "❤️", orange_heart: "🧡", yellow_heart: "💛", green_heart: "💚",
  blue_heart: "💙", purple_heart: "💜", black_heart: "🖤", white_heart: "🤍",
  broken_heart: "💔", fire: "🔥", sparkles: "✨", star: "⭐", star2: "🌟",
  zap: "⚡", boom: "💥", wave: "👋", ok_hand: "👌",
  thumbsup: "👍", thumbsdown: "👎", fist: "✊", clap: "👏", pray: "🙏",
  muscle: "💪", eyes: "👀", brain: "🧠", tongue: "👅",
  check: "✅", x: "❌", warning: "⚠️", question: "❓", exclamation: "❗",
  bulb: "💡", memo: "📝", pencil: "✏️", pin: "📌", clip: "📎",
  book: "📖", folder: "📁", calendar: "📅", chart: "📊",
  rocket: "🚀", airplane: "✈️", car: "🚗", bike: "🚲",
  sun: "☀️", moon: "🌙", cloud: "☁️", rain: "🌧️", snow: "❄️", rainbow: "🌈",
  dog: "🐕", cat: "🐈", bug: "🐛", butterfly: "🦋",
  tree: "🌳", flower: "🌸", cherry_blossom: "🌸", rose: "🌹",
  apple: "🍎", coffee: "☕", pizza: "🍕", cake: "🎂", beer: "🍺",
  trophy: "🏆", medal: "🥇", crown: "👑", gem: "💎",
  music: "🎵", bell: "🔔", megaphone: "📢", lock: "🔒", key: "🔑",
  tada: "🎉", balloon: "🎈", gift: "🎁", party: "🥳",
  hundred: "💯", plus: "➕", minus: "➖", point_right: "👉", point_left: "👈",
  up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️",
  recycle: "♻️", globe: "🌍", peace: "☮️", yin_yang: "☯️",
};

/** formatDate를 인자로 받아 현재 날짜가 반영된 템플릿 목록 반환 */
export function getTemplates(formatDate) {
  const d = formatDate(new Date());
  return [
    { name: "빈 문서", icon: "📄", content: "" },
    { name: "기본 문서", icon: "📝", content: DEFAULT_MARKDOWN },
    {
      name: "관공서 보고서",
      icon: "🏛️",
      content: `---
title: 업무 보고서
subtitle: 2026년 상반기 업무 추진 현황
author: 홍길동
date: ${d}
organization: OO부 OO과
---

# 1. 개요

## 1.1 목적
본 보고서는 2026년 상반기 업무 추진 현황을 보고하기 위해 작성되었습니다.

## 1.2 범위
- 기간: 2026.01 ~ 2026.06
- 대상: OO부 전체

# 2. 추진 현황

| 구분 | 계획 | 실적 | 달성률 |
|------|------|------|--------|
| 과제 A | 100 | 95 | 95% |
| 과제 B | 50 | 52 | 104% |
| 과제 C | 30 | 28 | 93% |

# 3. 향후 계획

1. 미달성 과제 보완 조치
2. 하반기 신규 과제 발굴
3. 협업 체계 강화

# 4. 건의 사항

> 원활한 업무 추진을 위해 인력 보강이 필요합니다.
`,
    },
    {
      name: "회의록",
      icon: "🗓️",
      content: `---
title: 회의록
date: ${d}
author: 작성자
organization: OO팀
---

# 회의록

## 회의 개요
- **일시**: ${d} 00:00
- **장소**: 회의실
- **참석자**: 홍길동, 김철수, 이영희
- **안건**: 프로젝트 진행 현황 점검

## 논의 내용

### 1. 전차 회의 결과 확인
- [ ] 과제 A 완료 여부 확인
- [x] 과제 B 진행 중

### 2. 금차 논의 사항
1. 일정 조정 필요
2. 예산 재검토

### 3. 의결 사항
| 번호 | 안건 | 결과 |
|------|------|------|
| 1 | 일정 연장 | 승인 |
| 2 | 예산 추가 | 보류 |

## 향후 일정
- 다음 회의: YYYY.MM.DD
- 담당자별 조치사항 완료 기한: YYYY.MM.DD
`,
    },
    {
      name: "제안서",
      icon: "💡",
      content: `---
title: 프로젝트 제안서
subtitle: OO 시스템 구축 제안
author: 제안사
date: ${d}
organization: OO 주식회사
---

# 1. 제안 배경

현재 OO 업무의 비효율성을 개선하기 위해 시스템 구축을 제안합니다.

## 1.1 현황 분석
- 수작업 처리로 인한 오류 발생
- 데이터 통합 관리 부재

# 2. 제안 내용

## 2.1 시스템 구성
\`\`\`mermaid
graph TD
  A[사용자] --> B[웹 인터페이스]
  B --> C[API 서버]
  C --> D[데이터베이스]
\`\`\`

## 2.2 주요 기능
1. **데이터 통합 관리**: 모든 데이터를 중앙에서 관리
2. **자동화 처리**: 반복 업무 자동화
3. **대시보드**: 실시간 현황 모니터링

# 3. 기대 효과

| 구분 | 현재 | 개선 후 | 효과 |
|------|------|---------|------|
| 처리 시간 | 2시간 | 10분 | 92% 단축 |
| 오류율 | 5% | 0.1% | 98% 감소 |

# 4. 추진 일정

- **1단계** (1~2개월): 요구사항 분석 및 설계
- **2단계** (3~4개월): 개발 및 테스트
- **3단계** (5개월): 시범 운영 및 안정화
`,
    },
  ];
}
