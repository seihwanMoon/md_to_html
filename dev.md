# 개발 진행 기록 (2026-02-06)

> **다음 세션에서 이어서 구현할 때** → **`CONTINUE.md`** 를 먼저 읽어주세요. (완료 현황, 다음 할 일, 파일 위치 정리)

## 개요
`md_to_html` 프로젝트는 `https://md.takjakim.kr/`의 UI/UX를 참고한 개인용 클론입니다.  
**Vite 6 + ES 모듈** 기반 단일 페이지 앱으로, 마크다운 편집·실시간 미리보기, **HTML/PDF/DOCX** 내보내기, **프레젠테이션 모드**(`---` 슬라이드), **커스텀 CSS** 주입, 설정·프리셋·도움말 모달, PWA·폴더 연결(File System Access API)을 지원합니다.  
실행: `npm run dev` (개발), `npm run build` (배포 빌드).

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
  - 특수 페이지(표지/목차/간지), 목차 깊이·박스형 제목 깊이
  - 헤더/푸터 옵션(맞춤 텍스트 6필드 포함, 페이지 번호 시작·형식·맞춤 형식)
  - 커스텀 CSS (내보내기용)
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
- 프리셋 가져오기 시 원본(md.takjakim.kr) JSON 호환 *(2026-02-06)*
  - `normalizeImportedPresetSettings()`로 원본 키/값을 우리 설정 형식으로 변환 후 저장·적용
  - 키 매핑(breaks→convertBreaks, scale→pdfScale, margin 객체→marginTop 등), pageNumber→page, default→basic, nanum-gothic→NanumGothic 등
- **설정 구조를 원본(md.takjakim.kr) JSON과 동일하게 통일** *(2026-02-06)*
  - `DEFAULT_SETTINGS` 및 저장 형식: `breaks`, `emoji`, `highlight`, `scale`, `textIndent`, `margin: { top, right, bottom, left }`, `headerFontSize`, `footerFontSize`, `footerCenter: "pageNumber"`, `headingStyle: "default"`, `pageBreakBeforeH1/H2/H3`, `hideHeaderFooterOnSpecialPages`, `fontFamily: "nanum-gothic"` 등 원본 키/값 사용
  - `getMargin(settings)`, `getTextIndent(settings)` 헬퍼로 margin·textIndent 읽기 통일
  - `loadSettings()`에서 예전 형식(convertBreaks, marginTop 등) → 원본 형식 자동 마이그레이션
  - 프리셋 가져오기 시 예전 우리 형식도 그대로 호환되도록 `normalizeImportedPresetSettings()` 유지
  - 설정 폼 id/option 값을 원본과 맞춤(scale, textIndent, breaks, pageNumber 등). `refreshSettingsForm()`으로 패널 열기·프리셋 적용 시 폼 동기화
- Phase 3.1 개선 로드맵 추가 *(2026-02-06)*
  - 원본 JSON·HTML 분석 반영: 표 스타일(줄무늬/thead 배경), orphans·widows 3, 코드 폰트(D2Coding), 링크 색, (선택) 프리셋 확장. `CONTINUE.md`에 이어하기 순서(3.1 → 4) 및 수정 위치 정리
- Phase 3.1 구현 완료 *(2026-02-06)*
  - 3.1-1: 표 thead `#f0f0f0`, tbody 짝수 행 `#fafafa` / 3.1-2: `orphans: 3; widows: 3` / 3.1-3: 코드 폰트 D2Coding 선두, 인라인 코드 `:not(pre):not(.hljs) > code` 통일 / 3.1-4: 링크 색 `#0563c1`·인쇄 시 검정 유지 확인
- Phase 3.1-5 프리셋 확장 *(2026-02-06)*
  - 헤더/푸터 좌·중·우 "맞춤" 옵션 + 6개 맞춤 텍스트 필드, 목차 깊이(tocDepth), 박스형 제목 깊이(headingBoxDepth)
- Phase 4 코드 아키텍처 개선 *(2026-02-06)*
  - 4-1: Vite 6 + ES 모듈 (`src/` 분리, npm 패키지, HMR) / 4-2: 단일 `state` 객체 통합 / 4-3: PWA manifest + Service Worker / 4-4: File System Access API 폴더 연결
- Phase 5-1 프레젠테이션 모드 *(2026-02-06)* — `---` 슬라이드 구분, 풀스크린, 키보드/버튼 이동
- Phase 5-7 커스텀 CSS 주입 *(2026-02-06)* — 설정 `customCss`, 내보내기 HTML에 스타일 주입
- Phase 5-5 DOCX 내보내기 *(2026-02-06)* — `docx` 패키지, 제목/표/목록/인용/코드 등 지원
- **DOCX 내보내기 개선** *(2026-02-06)*
  - 1단계: 기본 스타일 반영 (state.settings 폰트/크기/줄간격/여백, A4, SectionProperties)
  - 2단계: 프론트매터·표지/목차/간지 페이지 (coverPage, tocPage, dividerPage, tocDepth)
  - 3단계: 헤더/푸터 3열 (title/date/pageNumber/custom, headerFontSize/footerFontSize)
  - 4단계: 박스형 제목 (headingStyle, headingBoxDepth, Shading·Border)
  - 5단계: Base64 이미지 지원 (![alt](data:image/...))
  - 6단계 각주는 미구현 (선택)
- **PDF 정교화 방안** *(2026-02-06)* — DOCX 한계를 보완하기 위해 PDF를 메인 출력 채널로 강화하는 제안. **`docs/pdf-export-improvement.md`** 참고. 트랙 A(현재 인쇄 경로 품질 극대화), 트랙 B(클라이언트 PDF 직접 다운로드, html2pdf.js 등).
- **페이지 나눔 문법 (PDF)** *(2026-02-06)* — 원하는 위치에서 페이지 나누기: 마크다운에 `\newpage`, `[pagebreak]`, `<!-- pagebreak -->` 중 하나를 한 줄로 넣으면, 인쇄/PDF에서 해당 위치에 `page-break-before: always` 로 정확히 반영. 트랙 A(인쇄 경로)가 이 용도에 적합.
- **페이지 나누기 버튼** *(2026-02-06)* — 포맷바에 "페이지 나누기" 버튼 추가. 클릭 시 커서 위치에 `\newpage` 삽입.
- **페이지 나눔 시 헤더/푸터 반복** *(2026-02-06)* — `\newpage`가 있으면 본문을 구간으로 나누고, 각 구간마다 헤더·푸터를 DOM에 반복해 인쇄/PDF 시 각 "페이지"에 헤더·푸터가 나오도록 함.
- **미리보기 = PDF처럼 페이지 단위 표시** *(2026-02-06)* — `\newpage`가 있을 때 미리보기에서 각 구간을 `.preview-page`로 감싸 A4 높이(297mm) 박스·그림자로 표시, "↓ 다음 페이지" 구분선.
- **푸터 A4 하단 고정** *(2026-02-06)* — 인쇄용에서 각 구간을 `.segment-page`(min-height: 297mm, flex column) + `.segment-body`(flex: 1)로 감싸 푸터가 A4 용지 하단에 오도록 함.
- **페이지 번호 동적 표시** *(2026-02-06)* — 헤더/푸터의 "페이지 번호"를 고정 "1/1" 대신 CSS `counter(page) " / " counter(pages)` 로 출력해 인쇄 시 실제 현재/총 페이지 표시.
- **페이지 나눔 시 푸터 PDF 반영** *(2026-02-06)* — `@media print`에서 `.segment-page` 내 헤더/푸터는 `position: static` 유지(브라우저 `position: running()` 미지원으로 푸터가 빠지던 문제 해결). `.segment-page` 높이를 인쇄용 콘텐츠 영역 `calc(297mm - margin.top - margin.bottom)`에 맞춰 푸터가 페이지 하단에 고정. 미리보기 `.preview-page`도 flex + `.preview-page-body`로 푸터 하단 고정.
- **페이지 번호 사용자 설정** *(2026-02-06)* — 페이지 나눔(`\newpage` 등) 사용 시 세그먼트별로 실제 번호를 HTML에 주입(1/5, 2/5 …). 설정 푸터: **페이지 번호 시작**(첫 페이지 번호), **페이지 번호 형식**(현재/총, 현재만, 맞춤), **맞춤 형식**(`{{page}}`, `{{total}}` 플레이스홀더). 페이지 나눔 없을 때는 빈 span + CSS `counter` 유지(`.hwp-page-number:empty::after`).

## 한글(아래한글) HTML 호환 개선 (트랙 C, 2026-02-06 추가)
- Phase C-1 *(기본 호환)*:
  - 내보내기 HTML에 한글 호환 메타 태그/클래스 추가: `Generator=Hwp 2022`, `Content-Type`, `HWP*` 클래스
  - 표 태그에 HTML4 속성 보강: `border/cellspacing/cellpadding`
  - 폰트 맵에 한글 기본 폰트 키(`바탕/돋움/굴림`) 매핑 추가
- Phase C-2 *(스타일 강화)*:
  - 문단/헤딩에 인라인 스타일 주입(줄간격 %, 들여쓰기 px, 헤딩 폰트 pt 등)
  - 단순 color span → `<font color>` 변환으로 색상 보존률 개선
- Phase C-3 *(한글 전용 복사 기능)*:
  - 툴바에 **"한글 HTML 복사"** 버튼 추가
  - `src/export-hwp-html.js`에서 한글 붙여넣기 최적 HTML 생성 및 클립보드 복사(`text/html` + `text/plain`)
  - 한글 붙여넣기 안정화 후처리:
    - 외부 리소스 제거: `<link>`, `<script>`
    - KaTeX는 `[수식] TeX...` 텍스트로 폴백(마크업 노출 방지)
    - 각주는 링크/앵커 제거 후 `[n]` + 목록 형태로 단순화
    - 표 색상 유지: thead/줄무늬를 `bgcolor` 중심으로 주입(환경별 tr 무시 대비 td까지 보강)
    - 코드 블록: `<pre>`를 table 기반 코드 박스로 변환(배경/여백/고정폭 폰트 보존률↑)
- 테스트 문서:
  - `docs/hwp-paste-test.md` 추가 (표 병합/색상/배경/코드/수식/각주 등)

## 기타 수정
- HTML 다운로드(`downloadFile`) 시 `.html`에 UTF-8 BOM을 붙여 한글에서 문자코드 경고를 줄임 (`src/utils.js`)

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
- PDF 내보내기 버튼 클릭 시 Google 로그인/검색 창 등 다른 사이트가 열리던 문제 *(Phase 4 준비)*
  - **원인**: `window.open(blobUrl)` 호출 시 팝업이 차단되거나 브라우저가 기본 새 탭(Google 등)을 열어, 우리 문서 대신 다른 페이지가 표시됨.
  - **해결(근본)**: **`window.open` 사용 제거.** 같은 페이지에 숨겨진 **iframe**을 만들고, iframe의 **src**에 내보내기 HTML의 **Blob URL**을 넣어 로드. iframe `onload`에서 `iframe.contentWindow.print()`만 호출 → **새 탭/창을 전혀 열지 않음**, 인쇄 대화상자만 표시. iframe 크기 210mm×297mm(인쇄 레이아웃용), 인쇄 후 2초 뒤 iframe 제거 및 URL 해제. 클릭 시 `stopPropagation()` 추가로 이벤트 전파 차단.
- 페이지 나눔 시 푸터가 PDF에 나오지 않던 문제 *(2026-02-06)*
  - **원인**: `@media print`에서 `.hwp-header`/`.hwp-footer`에 `position: running()`을 적용해 세그먼트 내 헤더/푸터가 문서 흐름에서 빠짐(브라우저 running 지원 제한). `.segment-page` 높이(297mm)가 @page 여백을 고려하지 않아 푸터가 다음 페이지로 밀림.
  - **해결**: `.segment-page .hwp-header`, `.segment-page .hwp-footer`에 `position: static` 유지. `.segment-page` 높이를 `calc(297mm - margin.top - margin.bottom)`로 조정. `.segment-body`에 `overflow: hidden`으로 한 페이지 내 고정.
- 페이지 번호가 0/0으로만 나오던 문제 *(2026-02-06)*
  - **원인**: CSS `counter(page)/counter(pages)`는 인쇄 시에만 채워지며, 페이지 나눔 시 세그먼트별로 값을 넣지 않아 미리보기/인쇄에서 0/0 또는 빈 칸.
  - **해결**: 페이지 나눔 시 세그먼트별로 `buildHeader(frontmatter, pageInfo)`, `buildFooter(frontmatter, pageInfo)` 호출해 실제 번호(1/5, 2/5 등)를 HTML에 주입. 설정에 페이지 번호 시작·형식(현재/총, 현재만, 맞춤)·맞춤 형식({{page}}, {{total}}) 추가. CSS는 빈 span일 때만 `.hwp-page-number:empty::after`로 counter 사용.

## 원본 사이트 HTML 내보내기 분석 (참고)

원본(https://md.takjakim.kr/)에서 저장한 HTML(`document (2).html`) 기준으로, 우리가 참고·반영할 수 있는 점을 정리함.

### 스타일 구조 (원본)

1. **VSCode Markdown CSS** — Microsoft 확장 스타일(.vscode-light/dark, .code-line 등). 미리보기용이라 **내보내기에는 불필요**. 우리는 HWP/인쇄 중심이므로 미적용 유지.
2. **Tomorrow (highlight.js)** — 코드 블록 테마. 우리와 동일하게 사용 중.
3. **HWP Government Document Style** — 본문/제목/표/인용/코드/hr/링크/이미지 공통 스타일. 아래 항목 참고.
4. **컴포넌트** — `.hwp-cover-page`, `.hwp-toc-page`, `.hwp-divider-page`, `.hwp-heading-box`(박스형 제목). 우리도 동일 클래스명·유사 스타일 사용 중.

### 참고·개선 포인트

| 항목 | 원본 | 우리 | 제안 |
|------|------|------|------|
| **표 thead 배경** | `#f0f0f0` | `#e8e8e8` | 관공서 톤 유지 시 `#e8e8e8` 유지. 원본에 맞추려면 `#f0f0f0` 선택 가능. |
| **표 tbody 짝수 행** | `tbody tr:nth-child(even) { background: #fafafa }` | 없음 | 가독성용 **줄무늬 배경** 추가 검토. |
| **단 나눔** | `orphans: 3; widows: 3` | `orphans: 2; widows: 2` | 원본은 3. 인쇄 품질에 따라 3으로 올릴 수 있음. |
| **인라인 코드** | `:not(pre):not(.hljs) > code { background: #f0f0f0; padding: 0.15em 0.3em; border-radius: 2px }` | 있음 | 스타일 일치 여부만 확인. |
| **코드 글꼴** | `'D2Coding', 'Nanum Gothic Coding', ...` | fontMap 기반 (Nanum Gothic Coding 등) | **D2Coding**을 코드용 폰트 스택 앞에 넣을지 선택. |
| **링크 색상** | `#0563C1` | 인쇄 시 검정/밑줄 제거 | 화면용 링크 색은 원본과 통일 가능. |
| **헤더/푸터 클래스** | `hwp-preview-header`, `hwp-preview-footer` | `hwp-header`, `hwp-footer` | 동작 동일. 클래스명 통일은 선택 사항. |
| **meta charset** | `<meta http-equiv="Content-type" content="text/html;charset=UTF-8">` | `<meta charset="UTF-8">` | 둘 다 유효. 현재 방식 유지 가능. |
| **KaTeX CDN** | jsDelivr | cdnjs | 동일 버전이면 유지. |

### 우리가 이미 잘 맞춘 부분

- `:root` CSS 변수(폰트/크기/줄간격/word-break), body 여백 `margin: 15mm 20mm ...`
- 제목 H1~H6 크기·테두리, 표 관공서 스타일(상하 2px, thead 배경)
- 표지/목차/간지/박스형 제목 클래스 구조
- `@media print` 내 페이지 나누기·고아/과부 방지
- 헤더/푸터 3칸(좌/중/우) flex 레이아웃

### 정리

- **즉시 반영 권장**: 표 짝수 행 배경(`#fafafa`), 인쇄용 orphans/widows 3 (선택).
- **선택 반영**: 코드 폰트에 D2Coding 추가, 링크 색 `#0563C1`, thead 배경 `#f0f0f0`.
- **불필요**: VSCode Markdown CSS 블록(내보내기 목적과 무관).

(분석 기준: 원본에서 저장한 `document (2).html`, 2026-02-06)

## 현재 파일 구조
- `index.html` — 전체 UI, 모달 마크업, `<script type="module" src="/src/main.js">`
- `styles.css` — 레이아웃/모달/패널/테마, `[hidden]` 처리
- `app.js` — (레거시, 참고용) 이전 단일 파일 로직. 실제 동작은 `src/` 모듈 사용
- `src/main.js` — 진입점, 초기화·모달·액션·SW 등록
- `src/state.js` — 단일 state, loadSettings/saveSettings/loadMarkdown/loadPresets
- `src/constants.js` — DEFAULT_SETTINGS(페이지 번호 시작·형식·맞춤 포함), DEFAULT_MARKDOWN, HELP_STEPS, EMOJI_MAP, getTemplates()
- `src/utils.js` — getMargin, getTextIndent, escapeHtml, formatDate, slugify, downloadFile, normalizeImportedPresetSettings
- `src/render.js` — markdown-it, buildDocumentHtml, buildBaseStyles, parseFrontmatter, renderMarkdown, buildHeader/Footer(frontmatter, pageInfo), 페이지 번호 형식 주입
- `src/editor.js` — 툴바·에디터 이벤트, undo/redo, 검색·치환, 이모지 자동완성
- `src/preview.js` — updatePreview, setZoom, syncPreviewScroll, debouncedPreview
- `src/settings.js` — bindSettings, handleSettingsChange, refreshSettingsForm
- `src/export.js` — buildExportHtml, openPrintWindow, copyHtmlToClipboard, downloadFile
- `src/export-docx.js` — DOCX 내보내기 (markdownToDocxBlob, exportDocx)
- `src/presentation.js` — 프레젠테이션 모드 (getSlides, openPresentation, closePresentation)
- `src/presets.js` — renderPresets, savePresetPrompt, applyPreset, importPresets 등
- `src/folder.js` — File System Access API (requestFolderAccess)
- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service Worker 캐시
- `vite.config.js`, `package.json` — Vite 6, npm 스크립트 (dev/build/preview)

## 핵심 동작 흐름
1) 편집기 입력 → `renderMarkdown()`  
2) `buildDocumentHtml()`로 미리보기/내보내기용 HTML 생성 (설정 `customCss` 반영)  
3) 미리보기는 iframe `srcdoc`로 렌더링  
4) 설정 변경 시 CSS 변수로 즉시 반영  
5) 편집창 너비는 splitter 드래그로 조절  
6) 프레젠테이션: `---` 구분 슬라이드 → 풀스크린 오버레이  
7) DOCX: 마크다운 → `docx` 패키지로 Word 문서 생성 후 다운로드  

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

### Phase 3.1 — 원본(JSON/HTML) 참고 출력·스타일 정리 (난이도: ★☆☆) ✅ 완료

> 목표: 원본 사이트 프리셋 JSON·내보내기 HTML 분석을 반영해 출력 품질·원본 호환 정리

- [x] **3.1-1. 표 스타일 원본 맞춤** *(2026-02-06)*
  - 표 tbody 짝수 행 줄무늬: `tbody tr:nth-child(even) { background: #fafafa }` 추가
  - 표 thead 배경을 원본과 통일: `#f0f0f0` (기존 `#e8e8e8`에서 변경)
  - 적용 위치: `app.js` 내 `buildBaseStyles()` — 표 관련 CSS 블록
- [x] **3.1-2. 인쇄 단 나눔 강화** *(2026-02-06)*
  - 본문 `p` 스타일에서 `orphans: 2; widows: 2` → `orphans: 3; widows: 3` (원본과 동일)
  - 적용 위치: `app.js` — `buildBaseStyles()` 내 `p { ... }`
- [x] **3.1-3. 코드 블록·인라인 코드 스타일** *(2026-02-06)*
  - 코드용 폰트 스택: `'D2Coding', 'Nanum Gothic Coding', 'Consolas', 'Courier New'` (D2Coding 선두)
  - 인라인 코드 셀렉터를 `:not(pre):not(.hljs) > code`로 통일, 패딩 `0.15em 0.3em`, radius `2px`
  - 적용 위치: `app.js` — `buildBaseStyles()` 내 `code` 스타일
- [x] **3.1-4. 링크 색상 (화면용)** *(2026-02-06)*
  - 미리보기·내보내기 HTML에서 링크 색 `#0563c1` 적용됨(원본과 동일). 인쇄 시 `@media print`에서 검정/밑줄 제거 유지 확인
  - 적용 위치: `app.js` — `buildBaseStyles()` 내 `a` 및 `@media print` 내 `a` 규칙
- [x] **3.1-5. 프리셋 확장** *(2026-02-06)*
  - 헤더/푸터 좌·중·우에 "맞춤" 옵션 + `headerLeftCustom` 등 6개 필드
  - 목차 깊이 `tocDepth` (H1만 ~ H1~H6), 박스형 제목 깊이 `headingBoxDepth`
  - 설정 패널: 맞춤 선택 시 입력란 표시, 목차 깊이/박스 깊이 선택 추가
  - `normalizeImportedPresetSettings()`에 새 키 반영

참고: 원본 HTML 분석은 `dev.md`의 "원본 사이트 HTML 내보내기 분석 (참고)" 섹션, 프리셋 항목은 `docs/preset-improvement-ideas.md`.

### Phase 4 — 코드 아키텍처 개선 (난이도: ★★★) ✅ 완료
> 목표: 유지보수성 확보 및 빌드 체계 현대화

- [x] **4-1. Vite + ES Modules 전환** *(2026-02-06)*
  - `app.js` → `src/editor.js`, `preview.js`, `settings.js`, `export.js`, `presets.js`, `utils.js`, `render.js`, `state.js`, `constants.js`, `folder.js` 분리
  - CDN 의존성 → npm 패키지 (markdown-it, highlight.js, katex, mermaid)
  - Vite 6 빌드, HMR 개발 환경 (`npm run dev`)
- [x] **4-2. 상태 관리 통합** *(2026-02-06)*
  - `src/state.js`에 단일 `state` 객체 (settings, zoom, helpIndex, undoStack, redoStack 등)
  - 설정/프리셋 적용 시 `state.settings` 갱신 후 UI 동기화
- [x] **4-3. PWA + Service Worker** *(2026-02-06)*
  - `public/manifest.json` (이름, start_url, display: standalone)
  - `public/sw.js`로 JS/CSS/HTML 캐시, 오프라인 지원
  - `main.js`에서 Service Worker 등록
- [x] **4-4. File System Access API** *(2026-02-06)*
  - `src/folder.js`: `requestFolderAccess()` — `showDirectoryPicker()` (Chrome/Edge)
  - 툴바 "폴더 연결" 버튼 클릭 시 API 호출, 미지원 시 안내 메시지

### Phase 5 — 차별화 고급 기능 (난이도: ★★★)
> 목표: 원본 사이트를 초월하는 독자 기능

- [x] **5-1. 프레젠테이션 모드** *(2026-02-06)*
  - `---`로 슬라이드 구분 (Marp 스타일), `src/presentation.js` — `getSlides()`, `openPresentation()`
  - 풀스크린 오버레이, 이전/다음·키보드(←/→/Space/Esc), 슬라이드 카운터
  - 툴바 "프레젠테이션" 버튼, Mermaid 슬라이드 자동 실행
- [ ] **5-2. 다중 탭/문서**
  - 여러 마크다운 파일을 탭으로 동시 편집
  - 탭별 독립 설정/히스토리
- [ ] **5-3. 원고지 매수/읽기 시간 표시**
  - 상태바에 단어 수, 원고지 매수(200자), 읽기 예상 시간 추가
- [ ] **5-4. 버전 히스토리**
  - 자동 저장 시점 기록 및 diff 비교/복원
- [x] **5-5. DOCX 내보내기** *(2026-02-06)*
  - `docx` npm 패키지로 Word 문서 직접 생성, `src/export-docx.js` — `markdownToDocxBlob()`, `exportDocx()`
  - 제목/본문/표/목록/인용/코드 블록/구분선 지원, 툴바 "DOCX" 버튼
- [ ] **5-6. 반응형/모바일 지원** (검토 예정)
  - 모바일 자동 편집 모드 전환, 터치 친화 UI
- [x] **5-7. 커스텀 CSS 주입** *(2026-02-06)*
  - 설정에 `customCss` 추가, HTML/PDF 내보내기 시 `<style>` 블록으로 주입
  - 설정 패널 "커스텀 CSS (내보내기)" 아코디언 + textarea

---

## 현재까지 개발 완료 요약

| 구분 | 내용 |
|------|------|
| **Phase 1** | 키보드 단축키, 동기 스크롤, 헤딩 동기화, Splitter 저장, 단일 아코디언, 자동저장 표시, 디바운스, 탭 제목 |
| **Phase 2** | HTML/PDF 템플릿 고도화, @media print, 코드 블록 테마, HTML 클립보드 복사 |
| **Phase 3** | KaTeX, Mermaid, 이미지 붙여넣기·드래그앤드롭, 검색/치환, 이모지 자동완성, 각주, 템플릿, 공유 URL |
| **Phase 3.1** | 표 스타일(thead #f0f0f0, tbody 짝수 행 #fafafa), orphans/widows 3, 코드 폰트 D2Coding, 링크 색 |
| **Phase 3.1-5** | 프리셋 확장(헤더/푸터 맞춤 6필드, tocDepth, headingBoxDepth) |
| **Phase 4** | Vite + ES 모듈 분리, 단일 state 통합, PWA + Service Worker, File System Access API 폴더 연결 |
| **Phase 5-1** | 프레젠테이션 모드 (--- 슬라이드, 풀스크린) |
| **Phase 5-7** | 커스텀 CSS 주입 (내보내기 스타일) |
| **Phase 5-5** | DOCX 내보내기 (Word 문서 생성) |
| **PDF/페이지 나눔** | 페이지 나눔 문법(\newpage 등), 페이지 나누기 버튼, 헤더/푸터 구간별 반복, 미리보기 페이지 단위(.preview-page), 푸터 A4 하단(.segment-page), 페이지 번호 counter(page)/counter(pages) |
| **PDF/페이지 나눔 보강** | 푸터 인쇄 반영(segment 내 position:static·높이 calc(297mm-margin)), 미리보기 flex 푸터 하단, 페이지 번호 설정(시작·형식·맞춤 {{page}}/{{total}}) |

---

## 이후 개발 진행할 사항 (Phase 5)

다음 단계는 **Phase 5 — 차별화 고급 기능**입니다. 원본 사이트를 넘어서는 독자 기능을 목표로 합니다.

| 순번 | 항목 | 난이도 | 설명 |
|------|------|--------|------|
| **5-1** | 프레젠테이션 모드 | ★★★ ✅ | `---`로 슬라이드 구분(Marp 스타일), 풀스크린 프레젠테이션 뷰 |
| **5-2** | 다중 탭/문서 | ★★★ | 여러 마크다운 파일을 탭으로 동시 편집, 탭별 독립 설정·히스토리 *(검토 예정)* |
| **5-3** | 원고지 매수/읽기 시간 | ★★☆ | 상태바에 단어 수, 원고지 매수(200자 기준), 읽기 예상 시간 표시 *(검토 예정)* |
| **5-4** | 버전 히스토리 | ★★★ | 자동 저장 시점 기록, diff 비교·복원 *(검토 예정)* |
| **5-5** | DOCX 내보내기 | ★★★ ✅ | `docx` 패키지로 Word 문서 직접 생성 |
| **5-6** | 반응형/모바일 지원 | ★★★ | 모바일 자동 편집 모드, 터치 친화 UI *(검토 예정)* |
| **5-7** | 커스텀 CSS 주입 | ★★☆ ✅ | 사용자 CSS로 내보내기 스타일 커스터마이징 |

**완료 (5-1 → 5-7 → 5-5 순)**  
- **5-1** 프레젠테이션 모드 ✅  
- **5-7** 커스텀 CSS 주입 ✅  
- **5-5** DOCX 내보내기 ✅  

**검토 예정 (추가 논의 후 진행)**  
- **5-2** 다중 탭/문서, **5-3** 원고지 매수·읽기 시간, **5-4** 버전 히스토리, **5-6** 반응형/모바일

상세 스펙은 위 "개선 로드맵" Phase 5 블록 참고.

---

## 메모
- **실행**: `npm run dev` (개발 서버 + HMR), `npm run build` 후 `npm run preview` 또는 `dist/` 배포
- 로컬에서 `index.html` 직접 열면 ES 모듈 경로 때문에 동작하지 않을 수 있음 — Vite 서버 사용 권장
- **의존성**: markdown-it, highlight.js, katex, mermaid, docx (npm)
- **원본 사이트**: `https://md.takjakim.kr/` (Vite 기반, 소스 비공개) · 개발자: takjakim
- **문서 최신화**: 2026-02-06 — Phase 1~5-5, DOCX 개선, PDF/페이지 나눔 보강(푸터 인쇄 반영, 페이지 번호 시작·형식·맞춤) 반영. 다음 세션은 `CONTINUE.md` 먼저 참고.
