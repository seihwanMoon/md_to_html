# 이어하기 가이드 (다음 세션용)

새 창/세션에서 이어서 구현할 때 이 파일을 먼저 읽어주세요.

---

## 프로젝트 개요

- **이름**: `md_to_html` — 마크다운 → HWP 스타일 HTML/PDF/DOCX 변환기 (원본: https://md.takjakim.kr/)
- **구조**: Vite 6 + ES 모듈 (`src/`), `index.html`, `styles.css`, `public/` (manifest, sw)
- **실행**: `npm run dev` (개발), `npm run build` (배포)
- **주요 기능**: 실시간 미리보기, HTML/PDF/DOCX 내보내기, 프레젠테이션 모드(--- 슬라이드), 커스텀 CSS, PWA, 폴더 연결(Chrome/Edge)

---

## 완료된 단계

| Phase | 내용 | 상태 |
|-------|------|------|
| **Phase 1** | 키보드 단축키, 동기 스크롤, 헤딩 동기화, Splitter 저장, 단일 아코디언, 자동저장 표시, 디바운스, 탭 제목 | ✅ 완료 |
| **Phase 2** | HTML/PDF 템플릿 고도화, @media print, 코드 블록 테마, HTML 클립보드 복사 | ✅ 완료 |
| **Phase 3** | KaTeX, Mermaid, 이미지 붙여넣기/드래그앤드롭, 검색/치환, 이모지 자동완성, 각주, 템플릿, 공유 URL | ✅ 완료 |
| **설정 호환** | 원본(md.takjakim.kr) JSON과 설정 키/구조 통일, 프리셋 가져오기 호환 | ✅ 완료 |
| **Phase 3.1** | 표 스타일, orphans/widows 3, 코드 폰트(D2Coding), 인라인 code, 링크 색 | ✅ 완료 |
| **Phase 3.1-5** | 프리셋 확장(헤더/푸터 맞춤 6필드, tocDepth, headingBoxDepth) | ✅ 완료 |
| **Phase 4** | Vite+ES 모듈, 상태 통합, PWA+SW, File System Access API | ✅ 완료 |
| **Phase 5-1** | 프레젠테이션 모드 | ✅ 완료 |
| **Phase 5-7** | 커스텀 CSS 주입 | ✅ 완료 |
| **Phase 5-5** | DOCX 내보내기 | ✅ 완료 |
| **PDF/페이지 나눔** | 페이지 나눔 문법·버튼, 헤더/푸터 구간별 반복, 미리보기 페이지 단위, 푸터 A4 하단, 페이지 번호 동적 표시 | ✅ 완료 |
| **PDF/페이지 나눔 보강** | 푸터 인쇄 반영(segment 내 position:static·높이 조정), 미리보기 flex 푸터 하단, 페이지 번호 설정(시작·형식·맞춤) | ✅ 완료 |
| **Phase C-1** | 한글 HTML 붙여넣기 기본 호환 (메타 태그, CSS 클래스, 표 속성, 폰트 매핑) | ✅ 완료 |

상세 내역은 **`dev.md`** 의 "개선 로드맵" 및 "완료된 기능" 섹션 참고.

---

## 다음에 할 일

### 🎯 HWPX 지원 로드맵

**최종 목표**: 마크다운 → HWPX 형식 직접 내보내기

#### 트랙 C: 한글 HTML 붙여넣기 최적화 (단기 대안) - 현재 작업 중

한글 편집기의 **"HTML 문서 붙이기"** 기능에 최적화된 HTML을 생성하여, 복사/붙여넣기로 한글에서 편집 가능하게 만듭니다.

**한글 편집기 사용법**:
- 편집 → 붙여넣기 → **HTML 문서 붙이기**
- 환경설정 → 코드형식 → 클립보드로부터 붙이기 → **HTML 문서 붙이기 형식 지정**

---

#### Phase C-1: 한글 HTML 붙여넣기 기본 호환 (★★☆)

| 작업 | 파일 | 내용 |
|------|------|------|
| **한글 호환 메타 태그 추가** | `src/render.js` | `<meta name="Generator" content="Hwp 2022">`, `<meta http-equiv="Content-Type" content="text/html; charset=utf-8">` |
| **한글 기본 CSS 클래스 추가** | `src/render.js` | `HWP`, `HWP-DOCUMENT`, `HWP-BODY`, `HWP-PARAGRAPH` 등 한글이 인식하는 클래스 |
| **표 스타일 한글 호환** | `src/render.js` | `border="1"`, `cellspacing="0"`, `cellpadding="0"` 속성 추가 (HTML4 표준) |
| **폰트 명 호환성** | `src/render.js` | 한글 기본 폰트(`바탕`, `돋움`, `굴림`)에 매핑 옵션 추가 |

**구현 파일**: `src/render.js` `buildBaseStyles()` 함수, `buildDocumentHtml()` 함수

---

#### Phase C-2: 한글 스타일 강화 (★★☆)

| 작업 | 내용 |
|------|------|
| **문단 스타일** | `<p style="line-height:160%; text-indent:0mm; margin:0;">` 형태로 인라인 스타일 추가 |
| **헤딩 스타일** | `<h1 style="font-size:18pt; font-weight:bold; margin:0;">` 인라인 스타일 |
| **표 셀 병합 지원** | `colspan`, `rowspan` 속성 유지 및 한글 호환 속성 추가 |
| **글자 색상/배경** | `<font color="#000000">`, `<span style="background:#ffff00">` 등 레거시 태그 지원 |

---

#### Phase C-3: 한글 붙여넣기 전용 내보내기 기능 (★☆☆)

| 작업 | 파일 | 내용 |
|------|------|------|
| **"한글 HTML 복사" 버튼** | `index.html`, `src/main.js` | 툴바에 한글 전용 복사 버튼 추가 |
| **HWP 모드 HTML 생성** | `src/export-hwp-html.js` (신규) | 한글 붙여넣기에 최적화된 HTML 별도 생성 함수 |
| **클립보드 MIME 타입** | `src/export-hwp-html.js` | `text/html`, `text/plain` 함께 복사 |

**현재 적용된 한글 전용 후처리(붙여넣기 안정화)**:
- 외부 리소스 제거: `<link>`, `<script>`
- 수식(KaTeX): `[수식] ...TeX...` 텍스트 폴백
- 각주: 링크/앵커 제거 후 `[n]` 텍스트 + 목록 형태
- 표 색상: thead/줄무늬를 `bgcolor` 중심으로 주입 (환경별 `tr` 무시 대비 `td`까지 보강)
- 코드 블록: `<pre>`를 table 기반 코드 박스로 변환(배경/여백/고정폭 폰트)

**새로운 모듈 구조**:
```javascript
// src/export-hwp-html.js (신규)
export function buildHwpHtml(content) {
  // 한글 붙여넣기에 최적화된 HTML 생성
  // - HTML4 호환 속성
  // - 인라인 스타일
  // - 한글 기본 폰트 명
}

export async function copyHwpHtmlToClipboard() {
  // 한글 전용 클립보드 복사
}
```

---

#### Phase C-4: 한글 붙여넣기 테스트 및 문서화 (★☆☆)

| 작업 | 내용 |
|------|------|
| **테스트 문서 작성** | 표, 이미지, 수식, 각주를 포함한 테스트 마크다운 |
| **한글 2022/2024 테스트** | 실제 한글 편집기에서 붙여넣기 테스트 |
| **사용 가이드 추가** | `docs/hwp-paste-guide.md` 생성 |

---

### 🔮 이후 트랙 (장기 계획)

#### 트랙 A: JavaScript HWPX 생성기 (본격 구현)

**파일**: `src/export-hwpx.js` (신규)

**구현 방법**:
1. JSZip으로 HWPX ZIP 파일 생성
2. OWPML XML 구조 작성 (`Contents/section0.xml`, `Config/config.xml` 등)
3. 문단/헤딩/표 변환 로직 구현
4. 참고: `pypandoc-hwpx/PandocToHwpx.py` 로직 포팅

**HWPX 파일 구조**:
```
document.hwpx (ZIP)
├── Contents/
│   ├── section0.xml     # 문단/텍스트
│   ├── head.xml         # 헤더
│   └── tail.xml         # 푸터
├── Config/
│   └── config.xml       # 문서 설정
└── _rels/
    └── .rels
```

#### 트랙 A-2: python-hwpx 백엔드 API (대안)

**백엔드 구현**: FastAPI + python-hwpx 라이브러리
- REST API 엔드포인트: `POST /api/hwpx`
- 프론트엔드에서 마크다운 → API → HWPX 파일 다운로드

#### 트랙 B: 한컴 OWPML 모델 참고

**참고 자료**: [hancom-io/hwpx-owpml-model](https://github.com/hancom-io/hwpx-owpml-model)
- OWPML XML 스키마 명세서로 활용
- JavaScript 포팅 시 구조 참고

---

### 기존 로드맵

- **완료**: Phase 1~4, Phase 3.1, Phase 3.1-5, Phase 5-1/5-7/5-5, DOCX 개선, PDF 정교화(페이지 나눔·푸터 하단·페이지 번호), PDF/페이지 나눔 보강(푸터 인쇄 반영·페이지 번호 설정).
- **검토 예정**: Phase 5-2(다중 탭), 5-3(원고지 매수·읽기 시간), 5-4(버전 히스토리), 5-6(반응형/모바일).
- **PDF 추가 개선**(선택): `docs/pdf-export-improvement.md` 트랙 A(폰트 임베드·@page 정리), 트랙 B(html2pdf.js 직접 다운로드).

---

## 핵심 파일 위치

| 파일 | 용도 |
|------|------|
| `dev.md` | 개발 기록, **완료된 기능** 목록, **전체 로드맵(Phase 1~5, 3.1)** |
| `CONTINUE.md` | **이어하기 가이드** — 완료 현황, 다음 할 일, 파일 위치 |
| `src/main.js` | 진입점, 초기화·모달·액션·SW 등록 |
| `src/state.js` | 단일 state, loadSettings, loadMarkdown, loadPresets |
| `src/render.js` | buildDocumentHtml, 페이지 나눔·segment-page·preview-page·hwp-page-number, buildHeader/Footer(pageInfo), 페이지 번호 형식 |
| `src/editor.js` | 툴바·에디터·undo/redo·검색·이모지 |
| `src/preview.js` | updatePreview, setZoom, syncPreviewScroll |
| `src/settings.js` | bindSettings, refreshSettingsForm (customCss 포함) |
| `src/export.js` | buildExportHtml, openPrintWindow, copyHtmlToClipboard |
| `src/export-docx.js` | DOCX 내보내기 (markdownToDocxBlob, exportDocx) |
| `src/presentation.js` | 프레젠테이션 모드 (getSlides, openPresentation) |
| `src/presets.js` | renderPresets, applyPreset, importPresets |
| `src/folder.js` | File System Access API (requestFolderAccess) |
| `src/export-hwp-html.js` | **(신규 예정)** 한글 HTML 붙여넣기 전용 내보내기 |
| `src/export-hwpx.js` | **(신규 예정)** HWPX 직접 생성 (JSZip + OWPML) |
| `index.html` | 레이아웃, 모달, 툴바(프레젠테이션/DOCX 버튼 포함) |
| `styles.css` | 레이아웃, 테마, 모달, 프레젠테이션 오버레이 |
| `public/manifest.json`, `public/sw.js` | PWA manifest, Service Worker |
| `docs/preset-improvement-ideas.md` | 원본 프리셋 JSON 비교·개선 아이디어 |
| `docs/pdf-export-improvement.md` | PDF 정교화 방안(트랙 A/B), 페이지 나눔 문법 안내 |
| `docs/hwp-paste-guide.md` | **(신규 예정)** 한글 HTML 붙여넣기 사용 가이드 |

---

## 새 세션에서 시작할 때

1. **`CONTINUE.md`** (이 파일)에서 "완료된 단계"·"다음에 할 일" 확인.
2. **`dev.md`** 에서 "완료된 기능"·"개선 로드맵"·"현재 파일 구조" 참고.
3. 실행: `npm run dev` (개발), `npm run build` (배포용 빌드).
4. **HWPX 작업 시**: "다음에 할 일" → "HWPX 지원 로드맵" → "트랙 C"부터 단계적으로 진행.

---

## 트랙 C 개발 체크리스트

### Phase C-1: 한글 HTML 붙여넣기 기본 호환 ✅ 완료

- [x] 한글 호환 메타 태그 추가 (`src/render.js`)
  - [x] `<meta name="Generator" content="Hwp 2022">`
  - [x] `<meta http-equiv="Content-Type" content="text/html; charset=utf-8">`
- [x] 한글 기본 CSS 클래스 추가
  - [x] `HWP`, `HWP-DOCUMENT`, `HWP-BODY`, `HWP-PARAGRAPH` 클래스
- [x] 표 스타일 한글 호환
  - [x] `border="1"`, `cellspacing="0"`, `cellpadding="0"` 속성
- [x] 폰트 명 호환성
  - [x] 한글 기본 폰트(`바탕`, `돋움`, `굴림`) 매핑 옵션

### Phase C-2: 한글 스타일 강화

- [x] 문단 스타일 인라인화 (`src/render.js`: `paragraph_open`)
- [x] 헤딩 스타일 인라인화 (`src/render.js`: `heading_open`)
- [ ] 표 셀 병합 지원 확인
- [x] 글자 색상/배경 레거시 태그 지원 (`src/render.js`: 단순 color span → `<font color>` 변환)

### Phase C-3: 한글 붙여넣기 전용 내보내기 기능

- [x] `src/export-hwp-html.js` 모듈 생성
- [x] `buildHwpHtml(content)` 함수 구현
- [x] `copyHwpHtmlToClipboard()` 함수 구현
- [x] 툴바에 "한글 HTML 복사" 버튼 추가
- [x] 한글 붙여넣기 후처리(수식/각주 폴백, 표 색상 `bgcolor` 주입, 코드 블록 table 박스 변환)

### Phase C-4: 테스트 및 문서화

- [x] 테스트 문서 작성 (`docs/hwp-paste-test.md`)
- [ ] 한글 2022/2024 붙여넣기 테스트
- [ ] `docs/hwp-paste-guide.md` 작성

---

*마지막 업데이트: 2026-02-06 — 트랙 C(C-1~C-3) 구현 및 붙여넣기 후처리/테스트 문서 반영*
