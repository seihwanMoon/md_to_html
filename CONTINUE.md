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

상세 내역은 **`dev.md`** 의 "개선 로드맵" 및 "완료된 기능" 섹션 참고.

---

## 다음에 할 일

- **완료**: Phase 1~4, Phase 3.1, Phase 3.1-5, Phase 5-1(프레젠테이션), 5-7(커스텀 CSS), 5-5(DOCX).
- **검토 예정**: Phase 5-2(다중 탭), 5-3(원고지 매수·읽기 시간), 5-4(버전 히스토리), 5-6(반응형/모바일).
- 이후: 위 Phase 5 잔여 항목 검토 또는 신규 기능 논의. 상세 로드맵은 **`dev.md`** Phase 5 블록 참고.

---

## 핵심 파일 위치

| 파일 | 용도 |
|------|------|
| `dev.md` | 개발 기록, **완료된 기능** 목록, **전체 로드맵(Phase 1~5, 3.1)** |
| `CONTINUE.md` | **이어하기 가이드** — 완료 현황, 다음 할 일, 파일 위치 |
| `src/main.js` | 진입점, 초기화·모달·액션·SW 등록 |
| `src/state.js` | 단일 state, loadSettings, loadMarkdown, loadPresets |
| `src/render.js` | buildDocumentHtml, buildBaseStyles, parseFrontmatter, customCss 반영 |
| `src/editor.js` | 툴바·에디터·undo/redo·검색·이모지 |
| `src/preview.js` | updatePreview, setZoom, syncPreviewScroll |
| `src/settings.js` | bindSettings, refreshSettingsForm (customCss 포함) |
| `src/export.js` | buildExportHtml, openPrintWindow, copyHtmlToClipboard |
| `src/export-docx.js` | DOCX 내보내기 (markdownToDocxBlob, exportDocx) |
| `src/presentation.js` | 프레젠테이션 모드 (getSlides, openPresentation) |
| `src/presets.js` | renderPresets, applyPreset, importPresets |
| `src/folder.js` | File System Access API (requestFolderAccess) |
| `index.html` | 레이아웃, 모달, 툴바(프레젠테이션/DOCX 버튼 포함) |
| `styles.css` | 레이아웃, 테마, 모달, 프레젠테이션 오버레이 |
| `public/manifest.json`, `public/sw.js` | PWA manifest, Service Worker |
| `docs/preset-improvement-ideas.md` | 원본 프리셋 JSON 비교·개선 아이디어 |

---

## 새 세션에서 시작할 때

1. **`CONTINUE.md`** (이 파일)에서 "완료된 단계"·"다음에 할 일" 확인.
2. **`dev.md`** 에서 "완료된 기능"·"개선 로드맵"·"현재 파일 구조" 참고.
3. 실행: `npm run dev` (개발), `npm run build` (배포용 빌드).

---

*마지막 업데이트: 2026-02-06 — Phase 1~4, 3.1, 3.1-5, 5-1/5-7/5-5 반영*
