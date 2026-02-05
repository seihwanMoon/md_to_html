# 개발 진행 기록 (2026-02-05)

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

## 해결된 이슈
- 문서설정 팝업이 X 클릭으로 닫히지 않던 문제
  - 원인: `.modal-overlay`가 `display:flex`로 고정되어 `hidden`이 무시됨
  - 해결: `[hidden]{display:none;}` 규칙 추가
- highlight.js 경고
  - 원인: 이미 하이라이트된 블록에 다시 `highlightElement` 호출
  - 해결: iframe 내부 highlight 재실행 제거

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

## 중요한 구현 포인트
- 마크다운 Frontmatter 파싱
  - `---` 구간을 파싱하여 `title`, `date` 등 추출
  - 헤더/푸터/표지/목차에 사용
- 설정 데이터 저장
  - `localStorage`에 `settings`, `markdown`, `presets` 저장
- HTML/PDF 내보내기
  - HTML: `downloadFile()`로 바로 저장
  - PDF: 새 창에서 HTML 렌더 후 `window.print()`

## 남은 과제 (내일 이어서)
### 1) 설정 패널 UI를 원본처럼 개선
- 현재 `details/summary` 기본 UI
- 목표: 원본처럼 섹션 카드형(접힘/펼침 커스텀) 스타일
- 예상 작업
  - `index.html`의 설정 패널 마크업 구조 수정
  - `styles.css`에 커스텀 아코디언 스타일 추가

### 2) HTML 내보내기 템플릿 고도화
- 원본 사이트에서 export된 HTML 구조를 더 유사하게 맞춤
- 목표
  - 헤더/푸터 레이아웃
  - 표지/목차/간지 스타일 개선
- 참고: 기존 `buildBaseStyles()`에 실제 HWP 스타일을 더 반영

### 3) PDF 내보내기 품질 개선
- 현재는 브라우저 프린트 기반
- 가능 옵션
  - Node + Puppeteer로 서버 기반 PDF 생성
  - PDF 여백/배율 옵션을 더 정확히 반영

### 4) 코드 블록/구문 강조 개선
- 현재는 markdown-it highlight 옵션만 사용
- 개선안
  - language 미지정일 때 테마 유지
  - 다크 테마일 때 highlight 테마 변경

### 5) 폴더 연결 기능(선택)
- 브라우저 환경에서는 불가
- 데스크톱 앱(Electron) 전환 시 구현 가능

## 내일 바로 시작할 작업 가이드
1) `index.html`에서 설정 패널 구조 리팩터링  
2) `styles.css`에서 아코디언 UI 적용  
3) `app.js`에서 설정 패널 이벤트 연결 점검  

## 메모
- 현재 프로젝트는 순수 정적 앱이라 로컬에서 바로 열 수 있음
- 실행: `D:\GITHUB\Cursor\md_to_html\index.html`
