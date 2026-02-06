# 개발 진행 기록 (2026-02-05)

> **다음 세션에서 이어서 구현할 때** → **`CONTINUE.md`** 를 먼저 읽어주세요. (완료 현황, 다음 할 일, 파일 위치 정리)

## 개요
`md_to_html` 프로젝트는 `https://md.takjakim.kr/`의 UI/UX를 참고한 개인용 클론입니다.  
현재는 **단일 페이지 정적 앱(HTML/CSS/JS)** 형태로 구현되어 있으며, 마크다운 편집과 미리보기, HTML/PDF 내보내기, 설정/프리셋/도움말 모달을 제공합니다.

## 완료된 기능
- 상단 툴바/포맷바/편집기/미리보기 패널 UI 구성
- 마크다운 실시간 미리보기 (iframe `srcdoc`)
- 보기 모드: 편집/분할/미리보기
- 편집 도구 삽입
  - 굵게/이탤릭/취소선/인라인코드
  - 헤딩/목록/체크리스트
  - 표/인용/링크/이미지/코드블록/수평선
- HTML 내보내기 (Blob 다운로드)
- PDF 내보내기 (새 창 + `window.print()` 기반)
- 설정 패널
  - 글꼴/크기/줄간격/줄바꿈/들여쓰기
  - PDF 출력 스케일
  - 여백
  - 표 스타일/제목 스타일
  - 페이지 나누기(H1/H2/H3)
  - 특수 페이지(표지/목차/간지)
  - 헤더/푸터 옵션
  - 기타(줄바꿈 변환/이모지/구문 강조/배경 인쇄/특수페이지 헤더/푸터 숨기기)
- 프리셋 저장/적용/삭제/내보내기/가져오기
- 도움말(12단계) 모달
- 정보 모달
- 테마 토글(라이트/다크)
- 편집 도구 영역 재배치
  - 편집 도구를 `formatbar`로 이동
  - 본문 버튼을 헤딩 레벨 드롭다운으로 변경
  - 체크리스트 버튼을 편집 도구 옆으로 배치
- 설정 패널 UI 개선
  - 아코디언 카드형 섹션(아이콘 회전)
  - 닫기 버튼 원형 스타일
- 설정 패널 우측 고정
  - 설정 열면 미리보기 가려지지 않도록 우측 고정
  - 워크스페이스 우측 여백 확보
  - 설정 패널 폭 축소(1/2)
- 편집창 너비 조절
  - 에디터/미리보기 사이 드래그 분할 바 추가
- 되돌리기/다시 실행 기능 개선
  - 커스텀 히스토리 스택으로 안정 동작
- 키보드 단축키 *(Phase 1-1, 2026-02-06)*
  - `Ctrl+B/I/S/Z/Y`, `Ctrl+Shift+K/X`, `Tab/Shift+Tab`
- 에디터-미리보기 동기 스크롤 *(Phase 1-2, 2026-02-06)*
- 헤딩 드롭다운 동기화 *(Phase 1-3, 2026-02-06)*
  - 커서 위치의 헤딩 레벨을 드롭다운에 자동 반영
- Splitter 위치 localStorage 저장/복원 *(Phase 1-4, 2026-02-06)*
- 설정 패널 단일 오픈 아코디언 *(Phase 1-5, 2026-02-06)*
- 자동 저장 표시기 *(Phase 1-6, 2026-02-06)*
  - 상태바에 "저장됨 HH:MM:SS" 표시
- 미리보기 렌더링 디바운스 150ms *(Phase 1-7, 2026-02-06)*
- 브라우저 탭 제목 자동 반영 *(Phase 1-8, 2026-02-06)*
  - frontmatter `title` → `document.title`
- HTML 내보내기 템플릿 고도화 *(Phase 2-1, 2026-02-06)*
  - `@page { size: A4 }`, HWP 관공서 스타일 표, 표지/목차/간지 정밀화
  - 폰트맵 정밀화, Google Fonts 내보내기 포함, 인라인 코드 스타일
- PDF `@media print` 최적화 *(Phase 2-2, 2026-02-06)*
  - 페이지 분리 방지, 고아/과부줄 방지, 인쇄 색상 보정
- 코드 블록 다크 테마 연동 *(Phase 2-3, 2026-02-06)*
  - 다크 모드: `tomorrow-night`, 라이트/내보내기: `tomorrow`
- HTML 클립보드 복사 *(Phase 2-4, 2026-02-06)*
  - `ClipboardItem` API로 `text/html` + `text/plain` 동시 복사
  - 툴바 "복사" 버튼 추가
- KaTeX 수식 지원 *(Phase 3-1, 2026-02-06)*
  - `$...$` 인라인, `$$...$$` 블록 수식 렌더링
- Mermaid 다이어그램 *(Phase 3-2, 2026-02-06)*
  - ` ```mermaid ` 코드 블록으로 플로우차트/시퀀스 등 렌더링
- 이미지 붙여넣기 + 드래그 앤 드롭 *(Phase 3-3, 2026-02-06)*
  - 클립보드 이미지 Base64 삽입, `.md` 파일 드래그 로드
- 검색/치환 *(Phase 3-4, 2026-02-06)*
  - `Ctrl+F` 검색, `Ctrl+H` 치환, ▲/▼ 탐색
- 이모지 자동완성 *(Phase 3-5, 2026-02-06)*
  - `:` 입력 시 80+ 이모지 팝업, 키보드 탐색/선택
- 각주(Footnote) 지원 *(Phase 3-6, 2026-02-06)*
  - `[^id]` → 상위첨자 참조, 문서 하단 각주 섹션 자동 생성
- 템플릿 시스템 *(Phase 3-7, 2026-02-06)*
  - 새 문서 → 5종 템플릿 선택 (빈 문서/기본/보고서/회의록/제안서)
- 문서 공유 URL *(Phase 3-8, 2026-02-06)*
  - Base64 인코딩 URL 공유, 접속 시 자동 로드

## 해결된 이슈
- 문서설정 팝업이 X 클릭으로 닫히지 않던 문제
  - 원인: `.modal-overlay`가 `display:flex`로 고정되어 `hidden`이 무시됨
  - 해결: `[hidden]{display:none;}` 규칙 추가
- highlight.js 경고
  - 원인: 이미 하이라이트된 블록에 다시 `highlightElement` 호출
  - 해결: iframe 내부 highlight 재실행 제거
- 되돌리기/다시 실행 미작동
  - 원인: `execCommand` 비정상 동작
  - 해결: 커스텀 스택 기반 undo/redo 구현
- 설정 패널이 미리보기 가림
  - 원인: 중앙 모달 방식
  - 해결: 우측 고정 + 워크스페이스 여백

## 현재 파일 구조
- `index.html`
  - 전체 UI 레이아웃
  - 모달(정보/프리셋/도움말/설정) 마크업 포함
  - CDN: `markdown-it`, `highlight.js`
- `styles.css`
  - 레이아웃/모달/패널/테마 스타일
  - `[hidden]` 처리 포함
- `app.js`
  - 모든 동작 로직
  - 설정/프리셋/도움말/미리보기/내보내기 처리

## 핵심 동작 흐름
1) 편집기 입력 → `renderMarkdown()`  
2) `buildDocumentHtml()`로 미리보기/내보내기용 HTML 생성  
3) 미리보기는 iframe `srcdoc`로 렌더링  
4) 설정 변경 시 CSS 변수로 즉시 반영  
5) 편집창 너비는 splitter 드래그로 조절  

## 중요한 구현 포인트
- 마크다운 Frontmatter 파싱
  - `---` 구간을 파싱하여 `title`, `date` 등 추출
  - 헤더/푸터/표지/목차에 사용
- 설정 데이터 저장
  - `localStorage`에 `settings`, `markdown`, `presets` 저장
- HTML/PDF 내보내기
  - HTML: `downloadFile()`로 바로 저장
  - PDF: 새 창에서 HTML 렌더 후 `window.print()`
- 되돌리기/다시 실행
  - `undoStack`/`redoStack` 기반 스냅샷 관리
  - 입력/삽입/헤딩 변경 시 스냅샷 저장

## 개선 로드맵 (2026-02-06 수립)

원본 사이트(`md.takjakim.kr`) 분석 및 경쟁 에디터 비교를 통해 수립한 단계별 개선 계획입니다.

---

### Phase 1 — 즉시 적용 가능한 UX 개선 (난이도: ★☆☆) ✅ 완료
> 목표: 원본 사이트와 동등한 편의성 확보

- [x] **1-1. 키보드 단축키** *(2026-02-06)*
  - `Ctrl+B` 굵게, `Ctrl+I` 이탤릭, `Ctrl+S` 저장
  - `Ctrl+Z` 되돌리기, `Ctrl+Y` 다시 실행
  - `Tab`/`Shift+Tab` 들여쓰기/내어쓰기 (2칸)
  - `Ctrl+Shift+K` 코드 블록, `Ctrl+Shift+X` 취소선
- [x] **1-2. 에디터-미리보기 동기 스크롤** *(2026-02-06)*
  - 에디터 스크롤 비율을 미리보기 iframe에 전달
  - `syncPreviewScroll()` 함수 추가
- [x] **1-3. 헤딩 드롭다운 동기화** *(2026-02-06)*
  - 커서 위치의 헤딩 레벨을 드롭다운에 자동 반영
  - `syncHeadingDropdown()` — `updateStatus()` 내에서 호출
- [x] **1-4. Splitter 위치 저장** *(2026-02-06)*
  - `localStorage("splitterWidth")`에 드래그 분할 바 위치 저장
  - 새로고침 후 자동 복원
- [x] **1-5. 설정 패널 단일 오픈 아코디언** *(2026-02-06)*
  - `bindAccordion()` — `toggle` 이벤트로 나머지 자동 닫기
- [x] **1-6. 자동 저장 표시기** *(2026-02-06)*
  - 상태바에 "저장됨 HH:MM:SS" 표시 (3초 후 자동 소멸)
  - `showSaveIndicator()` 함수 추가
- [x] **1-7. 미리보기 렌더링 디바운스** *(2026-02-06)*
  - `debouncedPreview()` — 150ms 디바운스 적용
  - 빠른 타이핑 시 불필요한 렌더링 방지
- [x] **1-8. 브라우저 탭 제목 자동 반영** *(2026-02-06)*
  - `updateDocumentTitle()` — frontmatter `title`을 `document.title`에 반영

### Phase 2 — 내보내기 품질 강화 (난이도: ★★☆) ✅ 완료
> 목표: HWP 문서에 가까운 고품질 출력

- [x] **2-1. HTML 내보내기 템플릿 고도화** *(2026-02-06)*
  - `@page { size: A4 }` CSS 규칙 추가
  - HWP 관공서 스타일 표 (이중선 상하단 `border-top/bottom: 2px solid`, 머리글 `#e8e8e8` 배경)
  - 표지: 이중선 하단, 간지: 하단 강조선, 목차: 레벨별 들여쓰기+굵기 구분
  - 인라인 코드 `<code>` 배경/테두리 스타일 추가
  - 폰트맵 정밀화 (NanumGothic/NanumMyeongjo/NotoSerifKR/Pretendard)
  - Google Fonts CSS를 내보내기 HTML에 포함
- [x] **2-2. PDF `@media print` 최적화** *(2026-02-06)*
  - `@media print` 블록: 표/코드/인용/이미지 `page-break-inside: avoid`
  - `orphans: 2; widows: 2` 고아/과부 줄 방지
  - 인쇄 시 링크 밑줄/색상 제거, `print-color-adjust: exact` 적용
- [x] **2-3. 코드 블록 테마 연동** *(2026-02-06)*
  - 미리보기: 다크 테마일 때 `tomorrow-night`, 라이트 `tomorrow`
  - 내보내기(HTML/PDF): 항상 `tomorrow` (인쇄 최적)
- [x] **2-4. HTML 클립보드 복사** *(2026-02-06)*
  - `copyHtmlToClipboard()` — `ClipboardItem` API로 `text/html` + `text/plain` 동시 복사
  - 툴바에 "복사" 버튼 추가, 복사 완료 시 "복사됨!" 피드백 (1.5초)
  - 폴백: `execCommand("copy")`로 텍스트 복사

### Phase 3 — 마크다운 확장 기능 (난이도: ★★☆) ✅ 완료
> 목표: 고급 문서 작성 지원

- [x] **3-1. KaTeX 수식 지원** *(2026-02-06)*
  - `$...$` 인라인, `$$...$$` 블록 수식
  - CDN 직접 연동 (KaTeX 0.16.9), `renderKatex()` 후처리
  - 내보내기 HTML에 KaTeX CSS 자동 포함
- [x] **3-2. Mermaid 다이어그램** *(2026-02-06)*
  - ` ```mermaid ` 코드 블록 → `<div class="mermaid">` 렌더링
  - CDN (Mermaid 11.4.1), `startOnLoad: true`
  - 내보내기 HTML에 Mermaid 스크립트 조건부 포함
- [x] **3-3. 이미지 붙여넣기 + 드래그 앤 드롭** *(2026-02-06)*
  - `Ctrl+V` 클립보드 이미지 → Base64 `![name](data:...)` 삽입
  - 드래그 앤 드롭: 이미지 파일은 Base64 삽입, `.md/.txt` 파일은 내용 로드
  - `handleEditorPaste()`, `handleEditorDrop()`, `insertImageAsBase64()`
- [x] **3-4. 검색/치환** *(2026-02-06)*
  - `Ctrl+F` 검색 바, `Ctrl+H` 치환 바 표시
  - 검색: ▲/▼ 탐색, 매치 카운트 표시, 커서 이동 + 스크롤
  - 치환: 단건 치환 / 모두 치환
  - Esc로 닫기, 검색 바 UI/CSS 추가
- [x] **3-5. 이모지 자동완성** *(2026-02-06)*
  - `:` 입력 시 팝업 표시, 80+ 이모지 목록 (`EMOJI_MAP`)
  - ↑/↓ 키보드 탐색, Enter/Tab 선택, Esc 닫기
  - `initEmojiAutocomplete()`, 팝업 CSS 스타일
- [x] **3-6. 각주(Footnote) 지원** *(2026-02-06)*
  - `[^id]` 참조 → `<sup>` 상위첨자 링크
  - `[^id]: 내용` 정의 → 문서 하단 각주 섹션 자동 생성
  - `renderFootnotes()`, 역참조 `↩` 링크, 각주 CSS 스타일
- [x] **3-7. 템플릿 시스템** *(2026-02-06)*
  - "새 문서" 버튼 → 템플릿 선택 모달로 변경
  - 빈 문서, 기본 문서, 관공서 보고서, 회의록, 제안서 5종
  - 템플릿 모달 UI/CSS, `renderTemplates()`
- [x] **3-8. 문서 공유 URL** *(2026-02-06)*
  - `shareDocument()` — 에디터 내용을 Base64 인코딩 → URL 파라미터 `?doc=`
  - 클립보드에 공유 URL 복사, "복사됨!" 피드백
  - `loadFromUrlParam()` — 접속 시 URL에서 자동 로드 후 파라미터 제거
  - 용량 제한 안내 (약 24KB)

### Phase 4 — 코드 아키텍처 개선 (난이도: ★★★)
> 목표: 유지보수성 확보 및 빌드 체계 현대화

- [ ] **4-1. Vite + ES Modules 전환**
  - `app.js` → `editor.js`, `preview.js`, `settings.js`, `export.js`, `presets.js`, `utils.js` 분리
  - CDN 의존성을 npm 패키지로 전환
  - HMR(Hot Module Replacement) 개발 환경
- [ ] **4-2. 상태 관리 통합**
  - 전역 변수(`settings`, `zoom`, `helpIndex` 등)를 단일 `state` 객체로 통합
  - 상태 변경 시 자동 UI 갱신 패턴 적용
- [ ] **4-3. PWA + Service Worker**
  - `manifest.json`으로 설치형 앱 동작
  - CDN 리소스 캐시로 오프라인 사용 지원
- [ ] **4-4. File System Access API**
  - 폴더 연결 기능 (Chrome/Edge 지원)
  - Electron 없이 로컬 파일/이미지 접근

### Phase 5 — 차별화 고급 기능 (난이도: ★★★)
> 목표: 원본 사이트를 초월하는 독자 기능

- [ ] **5-1. 프레젠테이션 모드**
  - `---`로 슬라이드 구분 (Marp 스타일)
  - 풀스크린 프레젠테이션 뷰
- [ ] **5-2. 다중 탭/문서**
  - 여러 마크다운 파일을 탭으로 동시 편집
  - 탭별 독립 설정/히스토리
- [ ] **5-3. 원고지 매수/읽기 시간 표시**
  - 상태바에 단어 수, 원고지 매수(200자), 읽기 예상 시간 추가
- [ ] **5-4. 버전 히스토리**
  - 자동 저장 시점 기록 및 diff 비교/복원
- [ ] **5-5. DOCX 내보내기**
  - `docx.js` 라이브러리로 Word 문서 직접 생성
- [ ] **5-6. 반응형/모바일 지원**
  - 모바일 자동 편집 모드 전환, 터치 친화 UI
- [ ] **5-7. 커스텀 CSS 주입**
  - 사용자 직접 CSS 작성으로 내보내기 스타일 커스터마이징

---

## 메모
- 현재 프로젝트는 순수 정적 앱이라 로컬에서 바로 열 수 있음
- 실행: `D:\GITHUB\Cursor\md_to_html\index.html`
- 원본 사이트: `https://md.takjakim.kr/` (Vite 기반, 소스 비공개)
- 원본 개발자: `takjakim` (GitHub, Marp 테마/투자 분석 자동화 관심)
