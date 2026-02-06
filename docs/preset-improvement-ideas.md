# 프리셋 개선 아이디어 (원본 md.takjakim.kr 기준)

원본 사이트(https://md.takjakim.kr/)에서 내보낸 `markdown-hangul-presets.json`과 현재 클론의 설정 구조를 비교한 분석입니다.

**▶ 2026-02-06:** 우리 코드를 원본 JSON 키/구조에 맞춰 통일함. 이제 내보낸 프리셋 JSON을 원본과 서로 교환·가져오기 시 별도 변환 없이 호환됨.

---

## 1. 키 이름 비교 (원본 → 우리)

| 원본 (md.takjakim.kr) | 우리 (클론) | 비고 |
|------------------------|-------------|------|
| `breaks` | `convertBreaks` | 이름만 다름 |
| `emoji` | `enableEmoji` | 이름만 다름 |
| `highlight` | `enableHighlight` | 이름만 다름 |
| `fontFamily: "nanum-gothic"` | `fontFamily: "NanumGothic"` | 케이스/하이픈 차이 |
| `scale` | `pdfScale` | 이름만 다름 |
| `textIndent` | `indent` | 이름만 다름 |
| `margin: { top, right, bottom, left }` | `marginTop`, `marginBottom`, `marginLeft`, `marginRight` | 구조 다름 (객체 vs 개별 키) |
| `headerFontSize` | `headerSize` | 이름만 다름 |
| `footerFontSize` | `footerSize` | 이름만 다름 |
| `footerCenter: "pageNumber"` | `footerCenter: "page"` | 값 이름 다름 (동일 의미) |
| `headingStyle: "default"` | `headingStyle: "basic"` | 값 이름 다름 (동일 의미) |
| `pageBreakBeforeH1/H2/H3` | `breakH1`, `breakH2`, `breakH3` | 이름만 다름 |
| `displayHeaderFooter` | (없음) | 우리는 headerEnabled + footerEnabled 로 분리 |
| `hideHeaderFooterOnSpecialPages` | `hideOnSpecial` | 이름만 다름 |

---

## 2. 원본에만 있는 항목 (기능 확장 아이디어)

| 항목 | 설명 | 개선 제안 |
|------|------|-----------|
| **headerLeftCustom / headerCenterCustom / headerRightCustom** | 헤더 좌/중/우에 **사용자 입력 텍스트** | "맞춤" 옵션 추가 + 입력 필드 3개 (헤더), 3개 (푸터) |
| **footerLeftCustom / footerCenterCustom / footerRightCustom** | 푸터 좌/중/우 맞춤 텍스트 | 위와 동일 |
| **headingBoxDepth** | 박스형 제목 스타일을 적용할 **최대 깊이** (예: 3 → H1~H3만 박스) | `headingStyle: "boxed"` 일 때 H1~H? 까지 제한 옵션 |
| **headingSizeH1 ~ headingSizeH6** | **제목 레벨별 글자 크기** (pt) | 현재는 본문 기준만 있음 → H1~H6 개별 크기 설정 |
| **tocDepth** | 목차에 포함할 **헤딩 깊이** (예: 3 → H1~H3만) | 목차 "몇 단계까지?" 설정 추가 |
| **customFontFamily** | **사용자 지정 글꼴명** (폰트맵에 없을 때) | fontFamily가 "custom" 일 때 이 값 사용 |
| **includeDefaultStyles** | 기본 스타일 포함 여부 | 테마/스타일 번들 on·off 용도로 활용 가능 |
| **highlightStyle** | 구문 강조 **테마명** (빈 문자열 = 기본) | 우리는 다크/라이트만 있음 → 테마 선택 확장 시 사용 |

---

## 3. 개선 제안 요약

### A. 원본 프리셋 가져오기 호환 (우선 권장)

- **목적**: 원본에서 내보낸 `markdown-hangul-presets.json`을 우리 앱에서 "프리셋 가져오기"로 불러왔을 때 정상 적용.
- **방법**: `importPresets()` 또는 프리셋 적용 시 **원본 키 → 우리 키 매핑** 한 번 수행.
  - 예: `breaks` → `convertBreaks`, `scale` → `pdfScale`, `margin.top` → `marginTop`, `footerCenter: "pageNumber"` → `footerCenter: "page"`, `headingStyle: "default"` → `headingStyle: "basic"`, `fontFamily: "nanum-gothic"` → `fontFamily: "NanumGothic"` 등.
- **효과**: 원본 사용자가 클론으로 옮겨와도 기존 프리셋을 그대로 사용 가능.

### B. 설정 구조 정리 (선택)

- **margin**: 우리도 `margin: { top, right, bottom, left }` 형태로 저장하고, UI/내보내기 시만 개별 키로 풀어쓰기. 저장 포맷을 원본과 비슷하게 맞추면 호환·확장에 유리.

### C. 기능 추가 (우선순위 제안)

1. **헤더/푸터 맞춤 텍스트**  
   - 원본의 `headerLeftCustom` 등 6개 필드.  
   - "없음 / 제목 / 날짜 / 페이지 / **맞춤**" 중 "맞춤" 선택 시 입력 필드 노출.

2. **목차 깊이 (tocDepth)**  
   - "목차 페이지" 사용 시 "H1만 / H1~H2 / H1~H3" 등 선택.

3. **제목 레벨별 크기 (headingSizeH1~H6)**  
   - 고급 레이아웃 요구 시 유용.  
   - 없어도 동작에는 문제 없으므로 중·장기 검토.

4. **박스형 제목 깊이 (headingBoxDepth)**  
   - "boxed" 스타일일 때 H1~H3만 박스 등 제한.

---

## 4. 참고: 원본 기본 프리셋 한 줄 요약

- `breaks`, `emoji`, `highlight` = true  
- `fontFamily`: nanum-gothic, `fontSize`: 10, `lineHeight`: 1.6, `wordBreak`: keep-all  
- `tableStyle`: hwp, `headingStyle`: default  
- `margin`: 15mm / 20mm / 15mm / 20mm (상/우/하/좌)  
- 표지·목차·간지: false, 페이지 나누기: false  
- 헤더: 좌=title, 중=none, 우=date / 푸터: 좌=none, 중=pageNumber, 우=none  
- `hideHeaderFooterOnSpecialPages`: true  

위 구조를 우리 쪽 **키/값으로 변환**하면, 원본에서 내보낸 JSON을 그대로 활용할 수 있고, 나머지는 위 개선 제안대로 단계적으로 반영하면 됩니다.
