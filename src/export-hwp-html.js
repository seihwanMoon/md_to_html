import { buildDocumentHtml } from "./render.js";

function getEditor() {
  return document.getElementById("editor");
}

function decodeHtmlEntities(text) {
  // 브라우저 DOM을 이용해 안전하게 디코딩
  const el = document.createElement("textarea");
  el.innerHTML = String(text);
  return el.value;
}

function fallbackKatexToTextForHwp(html) {
  // KaTeX 출력에는 MathML annotation(application/x-tex)이 포함됨.
  // 한글 붙여넣기에서 KaTeX 마크업이 그대로 보이는 경우가 많아, TeX 텍스트로 폴백한다.
  return String(html).replace(/<span\s+class="katex"[\s\S]*?<\/span>/gi, (block) => {
    const m = block.match(/<annotation[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/i);
    if (!m) return block;
    const tex = decodeHtmlEntities(m[1]).trim();
    if (!tex) return block;
    return `<span>[수식] ${tex}</span>`;
  });
}

function simplifyFootnotesForHwp(html) {
  return String(html)
    // 각주 참조: <sup><a ...>[n]</a></sup> → [n]
    .replace(/<sup[^>]*class="footnote-ref"[^>]*>\s*<a[^>]*>\s*(\[[0-9]+\])\s*<\/a>\s*<\/sup>/gi, "$1")
    // 각주 backref(↩) 제거
    .replace(/\s*<a[^>]*class="footnote-backref"[^>]*>↩<\/a>\s*/gi, "")
    // href/id 같은 앵커 속성 제거(붙여넣기 시 깨짐/노이즈 방지)
    .replace(/\s+(id|href)="[^"]*"/gi, "");
}

function legacyTableColorsForHwp(html) {
  // 한글은 table 관련 CSS(특히 :nth-child, thead 배경 등)를 무시하는 경우가 많아
  // HTML 속성(bgcolor)로 내려주는 편이 유지율이 높다.
  try {
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    const tables = doc.querySelectorAll("table");
    tables.forEach((table) => {
      // 이미 render.js에서 border/cellspacing/cellpadding을 넣지만, 혹시 없으면 보강
      if (!table.getAttribute("border")) table.setAttribute("border", "1");
      if (!table.getAttribute("cellspacing")) table.setAttribute("cellspacing", "0");
      if (!table.getAttribute("cellpadding")) table.setAttribute("cellpadding", "0");

      // thead th 배경
      table.querySelectorAll("thead th").forEach((th) => {
        th.setAttribute("bgcolor", "#f0f0f0");
        // 한글에서 th 정렬이 흔들릴 때가 있어 기본값 보강
        if (!th.getAttribute("align")) th.setAttribute("align", "center");
        // padding은 style이 더 먹힐 때도 있어 최소 인라인도 같이
        const prev = th.getAttribute("style") || "";
        const next = prev ? `${prev}; ` : "";
        const rules = [];
        if (!/padding\s*:/i.test(prev)) rules.push("padding:8px 10px");
        if (!/background(-color)?\s*:/i.test(prev)) rules.push("background-color:#f0f0f0");
        if (rules.length) th.setAttribute("style", `${next}${rules.join("; ")};`);
      });

      // tbody 짝수행 줄무늬
      table.querySelectorAll("tbody tr").forEach((tr, idx) => {
        // idx는 0-based → 1-based로 2,4,6..에 해당하는 줄에 배경 적용
        if ((idx + 1) % 2 === 0) {
          tr.setAttribute("bgcolor", "#fafafa");
          // 어떤 환경에서는 tr bgcolor가 무시되므로 td에도 같이 주입
          tr.querySelectorAll("td").forEach((td) => td.setAttribute("bgcolor", "#fafafa"));
        }
      });
    });
    return "<!doctype html>\n" + doc.documentElement.outerHTML;
  } catch (_e) {
    return String(html);
  }
}

function codeBlocksToTableBoxesForHwp(html) {
  // 한글은 pre/code 스타일을 제한적으로 적용하는 경우가 많아,
  // table 기반 박스로 감싸 배경/여백/고정폭 폰트 유지율을 높인다.
  try {
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    const pres = doc.querySelectorAll("pre");
    pres.forEach((pre) => {
      const text = pre.innerText || pre.textContent || "";

      const table = doc.createElement("table");
      table.setAttribute("border", "1");
      table.setAttribute("cellspacing", "0");
      table.setAttribute("cellpadding", "0");
      table.setAttribute("width", "100%");
      table.setAttribute("style", "border-collapse:collapse; margin:8px 0;");

      const tr = doc.createElement("tr");
      const td = doc.createElement("td");
      td.setAttribute("bgcolor", "#f5f5f5");
      td.setAttribute(
        "style",
        [
          "font-family:Consolas, 'Courier New', monospace",
          "font-size:9pt",
          "padding:10px 12px",
          "white-space:pre",
          "line-height:140%",
        ].join("; ") + ";"
      );
      td.textContent = text.replace(/\n+$/g, "");
      tr.appendChild(td);
      table.appendChild(tr);

      pre.replaceWith(table);
    });
    return "<!doctype html>\n" + doc.documentElement.outerHTML;
  } catch (_e) {
    return String(html);
  }
}

function postProcessForHwpPaste(html) {
  // 한글 "HTML 문서 붙이기"는 외부 리소스(link/script) 의존성이 있으면 품질이 흔들리거나
  // 붙여넣기 시 무시되는 경우가 많아서, 결과물을 최대한 "자급자족" 형태로 단순화한다.
  let out = String(html);
  out = out.replace(/<link\b[^>]*?>/gi, "");
  out = out.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  out = legacyTableColorsForHwp(out);
  out = codeBlocksToTableBoxesForHwp(out);
  out = fallbackKatexToTextForHwp(out);
  out = simplifyFootnotesForHwp(out);
  out = out.replace(/[ \t]+\n/g, "\n");
  return out;
}

/**
 * 한글(아래한글) "HTML 문서 붙이기"에 최적화된 HTML 생성
 * - 외부 리소스 제거 (link/script)
 * - render.js에서 이미 적용된 HWP 메타/클래스/표 속성/인라인 스타일을 최대 활용
 */
export function buildHwpHtml(content) {
  const full = buildDocumentHtml(content, { forExport: true });
  return postProcessForHwpPaste(full);
}

export async function copyHwpHtmlToClipboard() {
  const editor = getEditor();
  if (!editor) return;
  const html = buildHwpHtml(editor.value);

  try {
    const htmlBlob = new Blob([html], { type: "text/html" });
    const plainBlob = new Blob([editor.value], { type: "text/plain" });
    await navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": plainBlob })]);

    const btn = document.querySelector('[data-action="copy-hwp-html"]');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = "복사됨!";
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    }
  } catch (err) {
    // 폴백: 텍스트로라도 제공
    const textarea = document.createElement("textarea");
    textarea.value = html;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("한글 붙여넣기용 HTML이 클립보드에 복사되었습니다. (텍스트 형식)");
  }
}

