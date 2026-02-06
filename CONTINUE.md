# 이어하기 가이드 (다음 세션용)

새 창/세션에서 이어서 구현할 때 이 파일을 먼저 읽어주세요.

---

## 프로젝트 개요

- **이름**: `md_to_html` — 마크다운 → HWP 스타일 HTML/PDF 변환기 (원본: https://md.takjakim.kr/)
- **구조**: 순수 정적 앱 — `index.html`, `styles.css`, `app.js` (단일 파일, 약 1,900줄+)
- **실행**: `index.html`을 브라우저에서 직접 열기

---

## 완료된 단계

| Phase | 내용 | 상태 |
|-------|------|------|
| **Phase 1** | 키보드 단축키, 동기 스크롤, 헤딩 동기화, Splitter 저장, 단일 아코디언, 자동저장 표시, 디바운스, 탭 제목 | ✅ 완료 |
| **Phase 2** | HTML/PDF 템플릿 고도화, @media print, 코드 블록 테마, HTML 클립보드 복사 | ✅ 완료 |
| **Phase 3** | KaTeX, Mermaid, 이미지 붙여넣기/드래그앤드롭, 검색/치환, 이모지 자동완성, 각주, 템플릿, 공유 URL | ✅ 완료 |

상세 내역은 **`dev.md`** 의 "개선 로드맵" 및 "완료된 기능" 섹션 참고.

---

## 다음에 할 일 (Phase 4)

**Phase 4 — 코드 아키텍처 개선** (난이도 ★★★)

1. **4-1. Vite + ES Modules 전환**
   - `app.js` → `editor.js`, `preview.js`, `settings.js`, `export.js`, `presets.js`, `utils.js` 등으로 분리
   - CDN 의존성을 npm 패키지로 전환
   - HMR 개발 환경

2. **4-2. 상태 관리 통합**
   - 전역 변수(`settings`, `zoom`, `helpIndex` 등)를 단일 `state` 객체로 통합

3. **4-3. PWA + Service Worker**
   - `manifest.json`, CDN 리소스 캐시, 오프라인 지원

4. **4-4. File System Access API**
   - 폴더 연결 기능 (Chrome/Edge)

로드맵 전체는 **`dev.md`** 의 Phase 4, Phase 5 블록 참고.

---

## 핵심 파일 위치

| 파일 | 용도 |
|------|------|
| `dev.md` | 개발 기록, 완료 기능 목록, **전체 로드맵(Phase 1~5)** |
| `app.js` | 모든 로직 (초기화, 툴바, 에디터, 미리보기, 설정, 프리셋, 내보내기, 검색, 이모지, 템플릿, 공유 등) |
| `index.html` | 레이아웃, 모달(정보/프리셋/도움말/설정/템플릿), 검색 바, 스크립트/CDN 로드 |
| `styles.css` | 레이아웃, 테마, 모달, 검색 바, 이모지 팝업, 템플릿 리스트 |

---

## 새 세션에서 시작할 때

1. **`dev.md`** 를 열어 "개선 로드맵" → Phase 4 항목 확인.
2. Phase 4부터 진행할 경우: Vite 프로젝트 생성 후 기존 `app.js`를 모듈별로 분리하는 작업부터 진행하면 됨.
3. 구현이 끝나면 **`dev.md`** 의 해당 Phase를 `[x]`로 체크하고 "완료된 기능" 섹션에 한 줄씩 추가하는 규칙 유지.

---

*마지막 업데이트: 2026-02-06 (Phase 3 완료 기준)*
