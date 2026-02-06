# 한글(아래한글) HTML 붙여넣기 테스트 문서

이 문서는 **"한글 HTML 복사"** 기능의 호환성을 점검하기 위한 테스트 케이스 모음입니다.

## 0) 테스트 방법

1. 본 문서를 앱 에디터에 붙여넣기
2. 상단 버튼 **"한글 HTML 복사"** 클릭
3. 한글에서 **편집 → 붙여넣기 → HTML 문서 붙이기**
4. 아래 항목별로 결과 확인

---

## 1) 문단/들여쓰기/줄간격

첫 문단입니다. 기본 줄간격과 들여쓰기 적용을 확인합니다.

두 번째 문단입니다. 문단 간 간격이 과하게 벌어지지 않는지 확인합니다.

---

## 2) 헤딩 스타일

# 제목 1
본문입니다.

## 제목 2
본문입니다.

### 제목 3
본문입니다.

---

## 3) 텍스트 강조/링크

굵게: **굵은 텍스트**  
이탤릭: *이탤릭 텍스트*  
취소선: ~~취소선 텍스트~~  
인라인 코드: `const a = 1;`

링크: [링크 텍스트](https://example.com)

---

## 4) 색상/배경(레거시 태그/스타일)

아래는 HTML을 직접 넣어서 색상/배경 보존률을 확인합니다.

<span style="color:#ff0000">빨강(단순 color span)</span>  
<span style="color:#0066cc">파랑(단순 color span)</span>

<span style="background:#ffff00">노랑 배경(배경 span)</span>  
<span style="background:#d9ead3">연두 배경(배경 span)</span>

---

## 5) 표(기본)

| 항목 | 설명 |
|---|---|
| A | 첫 번째 |
| B | 두 번째 |

---

## 6) 표 병합(HTML 직접 작성)

마크다운 표는 `rowspan`을 직접 표현하기 어렵기 때문에, 아래는 HTML 표로 테스트합니다.

<table border="1" cellspacing="0" cellpadding="0">
  <tr>
    <th>구분</th>
    <th>값</th>
    <th>비고</th>
  </tr>
  <tr>
    <td rowspan="2">rowspan 2</td>
    <td>A</td>
    <td>첫 줄</td>
  </tr>
  <tr>
    <td>B</td>
    <td>둘째 줄</td>
  </tr>
  <tr>
    <td colspan="2">colspan 2</td>
    <td>마지막</td>
  </tr>
</table>

---

## 7) 목록

- 목록 항목 1
- 목록 항목 2
  - 하위 항목

1. 번호 목록 1
2. 번호 목록 2

---

## 8) 인용/코드 블록

> 인용문 블록입니다.

```javascript
function hello() {
  console.log("Hello, HWP!");
}
```

---

## 9) 수식/각주(참고)

한글 붙여넣기에서 KaTeX/각주 UI는 환경에 따라 손실될 수 있습니다.

인라인 수식: $E=mc^2$  
블록 수식:

$$
\int_0^1 x^2 dx = \frac{1}{3}
$$

각주 테스트입니다.[^a]

[^a]: 각주 내용입니다.

