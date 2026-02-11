import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import katex from "katex";
import container from "markdown-it-container";
import { state } from "./state.js";
import { EMOJI_MAP } from "./constants.js";
import { getMargin, getTextIndent, escapeHtml, formatDate } from "./utils.js";
import { slugify } from "./utils.js";

const CALLOUT_TYPES = ["info", "warning", "tip", "note", "danger"];

function replaceEmojis(text) {
  return text.replace(/:([a-z0-9_]+):/g, (match, name) => EMOJI_MAP[name] || match);
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: state.settings.breaks,
  highlight(code, lang) {
    if (lang === "mermaid") {
      return `<div class="mermaid">${escapeHtml(code)}</div>`;
    }
    if (!state.settings.highlight) return "";
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

const originalHeadingOpen =
  md.renderer.rules.heading_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const next = tokens[idx + 1];
  const text = next && next.content ? next.content : "";
  if (text) token.attrSet("id", slugify(text));
  // 인라인 스타일(한글 붙여넣기 호환)도 함께 적용
  const level = Number(token.tag.replace("h", ""));
  const sizePtByLevel = { 1: 18, 2: 16, 3: 14, 4: 12, 5: 11, 6: 10 };
  const sizePt = sizePtByLevel[level] || 12;
  mergeInlineStyle(token, `font-size:${sizePt}pt; font-weight:bold; margin:0; text-indent:0;`);
  return originalHeadingOpen(tokens, idx, options, env, self);
};

function mergeInlineStyle(token, nextStyle) {
  if (!nextStyle) return;
  const prev = token.attrGet("style");
  const merged = prev ? `${prev}; ${nextStyle}` : nextStyle;
  token.attrSet("style", merged);
}

// 한글 호환: 문단/헤딩에 인라인 스타일 추가 (붙여넣기 품질 개선)
const originalParagraphOpen =
  md.renderer.rules.paragraph_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const s = state.settings;
  const lineHeightPct = Math.round((Number(s.lineHeight) || 1.6) * 100);
  const indentPx = Math.max(0, Number(getTextIndent(s)) || 0);
  // 한글은 px 인라인 스타일을 비교적 잘 흡수함 (mm는 브라우저/붙여넣기 경로에 따라 흔들림)
  mergeInlineStyle(token, `line-height:${lineHeightPct}%; text-indent:${indentPx}px; margin:0;`);
  return originalParagraphOpen(tokens, idx, options, env, self);
};

// 한글 호환: 표에 HTML4 속성 추가
const originalTableOpen =
  md.renderer.rules.table_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  token.attrSet("border", "1");
  token.attrSet("cellspacing", "0");
  token.attrSet("cellpadding", "0");
  return originalTableOpen(tokens, idx, options, env, self);
};

CALLOUT_TYPES.forEach((name) => {
  md.use(container, name, {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return `<div class="callout callout-${name}">\n`;
      }
      return "</div>\n";
    },
  });
});

function renderFootnotes(html) {
  const footnotes = [];
  let index = 0;
  html = html.replace(/\[\^([^\]]+?)\]:\s*(.+)/g, (_, id, text) => {
    footnotes.push({ id, text: text.trim() });
    return "";
  });
  html = html.replace(/\[\^([^\]]+?)\]/g, (_, id) => {
    index += 1;
    return `<sup class="footnote-ref"><a href="#fn-${id}" id="fnref-${id}">[${index}]</a></sup>`;
  });
  if (footnotes.length > 0) {
    const footnotesHtml = footnotes
      .map((fn) => `<li id="fn-${fn.id}"><p>${fn.text} <a href="#fnref-${fn.id}" class="footnote-backref">↩</a></p></li>`)
      .join("\n");
    html += `\n<hr class="footnotes-sep">\n<section class="footnotes">\n<ol>\n${footnotesHtml}\n</ol>\n</section>`;
  }
  return html;
}

function renderKatex(html) {
  html = html.replace(/\$\$([^$]+?)\$\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
    } catch (e) {
      return `<span class="katex-error">${escapeHtml(expr)}</span>`;
    }
  });
  html = html.replace(/\$([^$\n]+?)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return `<span class="katex-error">${escapeHtml(expr)}</span>`;
    }
  });
  return html;
}

// 한글 호환: 색상 span 일부를 <font color>로 변환 (붙여넣기 시 색상 보존률 ↑)
// - 스타일이 color만 있는 단순 span만 변환 (복잡한 style은 유지)
function legacyColorize(html) {
  return html.replace(
    /<span\s+style="[^"]*?\bcolor\s*:\s*([^;"']+)\s*;?[^"]*?"\s*>([\s\S]*?)<\/span>/gi,
    (m, color, inner) => {
      // style에 color 외 다른 속성이 있으면 변환하지 않음(보수적으로)
      const styleMatch = m.match(/style="([^"]+)"/i);
      const style = styleMatch ? styleMatch[1] : "";
      const cleaned = style
        .replace(/\s+/g, "")
        .replace(/;+/g, ";")
        .replace(/;$/g, "");
      // 허용: color:xxx 만
      const onlyColor = /^color:[^;]+$/.test(cleaned.toLowerCase());
      if (!onlyColor) return m;
      return `<font color="${escapeHtml(color.trim())}">${inner}</font>`;
    }
  );
}

export function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: text };
  const raw = match[1];
  const body = match[2];
  const frontmatter = {};
  raw.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (!key) return;
    frontmatter[key.trim()] = rest.join(":").trim();
  });
  return { frontmatter, body };
}

function extractHeadings(tokens) {
  const headings = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === "heading_open") {
      const level = Number(token.tag.replace("h", ""));
      const text = tokens[i + 1] && tokens[i + 1].content ? tokens[i + 1].content : "";
      const id = slugify(text || `heading-${i}`);
      headings.push({ level, text, id });
    }
  }
  return headings;
}

/**
 * @param {object} [pageInfo] - 페이지 나눔 시 { segmentIndex, totalSegments }. 있으면 실제 번호를 넣고, 없으면 CSS counter용 빈 span.
 */
function resolveHeaderFooterValue(type, frontmatter, slot, pageInfo) {
  if (type === "none") return "";
  if (type === "custom" && slot) {
    const customKey = slot + "Custom";
    const val = state.settings[customKey];
    return escapeHtml(typeof val === "string" ? val : "");
  }
  if (type === "title") return escapeHtml(frontmatter.title || "");
  if (type === "date") return escapeHtml(frontmatter.date || formatDate(new Date()));
  if (type === "page" || type === "pageNumber") {
    if (pageInfo && pageInfo.segmentIndex != null && pageInfo.totalSegments != null) {
      const start = Math.max(1, parseInt(state.settings.pageNumberStart, 10) || 1);
      const current = start + (pageInfo.segmentIndex - 1);
      const total = pageInfo.totalSegments;
      const fmt = state.settings.pageNumberFormat || "current/total";
      const custom = state.settings.pageNumberCustom || "{{page}} / {{total}}";
      let text;
      if (fmt === "current") text = String(current);
      else if (fmt === "custom") text = custom.replace(/\{\{page\}\}/g, String(current)).replace(/\{\{total\}\}/g, String(total));
      else text = `${current} / ${total}`;
      return `<span class="hwp-page-number">${escapeHtml(text)}</span>`;
    }
    return '<span class="hwp-page-number"></span>';
  }
  return "";
}

/** @param {object} [pageInfo] - { segmentIndex, totalSegments } 페이지 나눔 시에만 전달 */
function buildHeader(frontmatter, pageInfo) {
  const s = state.settings;
  const left = resolveHeaderFooterValue(s.headerLeft, frontmatter, "headerLeft", pageInfo);
  const center = resolveHeaderFooterValue(s.headerCenter, frontmatter, "headerCenter", pageInfo);
  const right = resolveHeaderFooterValue(s.headerRight, frontmatter, "headerRight", pageInfo);
  return `<header class="hwp-header">
    <div>${left}</div>
    <div>${center}</div>
    <div>${right}</div>
  </header>`;
}

/** @param {object} [pageInfo] - { segmentIndex, totalSegments } 페이지 나눔 시에만 전달 */
function buildFooter(frontmatter, pageInfo) {
  const s = state.settings;
  const left = resolveHeaderFooterValue(s.footerLeft, frontmatter, "footerLeft", pageInfo);
  const center = resolveHeaderFooterValue(s.footerCenter, frontmatter, "footerCenter", pageInfo);
  const right = resolveHeaderFooterValue(s.footerRight, frontmatter, "footerRight", pageInfo);
  return `<footer class="hwp-footer">
    <div>${left}</div>
    <div>${center}</div>
    <div>${right}</div>
  </footer>`;
}

function buildCover(frontmatter) {
  return `<section class="hwp-cover-page">
    <div class="hwp-cover-org">${escapeHtml(frontmatter.organization || "")}</div>
    <div class="hwp-cover-title">${escapeHtml(frontmatter.title || "제목")}</div>
    <div class="hwp-cover-subtitle">${escapeHtml(frontmatter.subtitle || "")}</div>
    <div class="hwp-cover-meta">
      <div class="hwp-cover-date">${escapeHtml(frontmatter.date || formatDate(new Date()))}</div>
      <div class="hwp-cover-author">${escapeHtml(frontmatter.author || "")}</div>
    </div>
  </section>`;
}

function buildToc(tocHtml) {
  return `<section class="hwp-toc-page">
    <div class="hwp-toc-heading">목차</div>
    <div class="hwp-toc-list">${tocHtml || "<p>목차가 없습니다.</p>"}</div>
  </section>`;
}

function buildDivider(headings) {
  if (!headings.length) return "";
  const first = headings.find((h) => h.level === 1) || headings[0];
  return `<section class="hwp-divider-page">
    <div class="hwp-divider-title">${escapeHtml(first.text || "구분")}</div>
  </section>`;
}

function buildBaseStyles({ forExport }) {
  const s = state.settings;
  const margin = getMargin(s);
  const scale = forExport ? s.scale : state.zoom;
  const breakStyles = [
    s.pageBreakBeforeH1 ? "h1 { page-break-before: always; }" : "",
    s.pageBreakBeforeH2 ? "h2 { page-break-before: always; }" : "",
    s.pageBreakBeforeH3 ? "h3 { page-break-before: always; }" : "",
  ].join("\n");

  const fontMap = {
    "nanum-gothic": "'Nanum Gothic', sans-serif",
    "nanum-myeongjo": "'Nanum Myeongjo', serif",
    "noto-serif-kr": "'Noto Serif KR', serif",
    pretendard: "'Pretendard Variable', sans-serif",
    // 한글 기본 폰트 매핑 (한글 편집기 호환)
    "바탕": "'Nanum Myeongjo', 'Batang', serif",
    "돋움": "'Nanum Gothic', 'Dotum', sans-serif",
    "굴림": "'Nanum Gothic', 'Gulim', sans-serif",
  };
  const fontStack = fontMap[s.fontFamily] || fontMap["nanum-gothic"];

  /* 인쇄 시 페이지당 콘텐츠 영역 높이 (A4 297mm - 상하 여백). 세그먼트 푸터가 페이지 하단에 오도록 사용 */
  const segmentPrintHeight = `calc(297mm - ${margin.top} - ${margin.bottom})`;
  return `
    @page { size: A4; margin: ${margin.top} ${margin.right} ${margin.bottom} ${margin.left}; }
    @media print {
      body { margin: 0; }
      /* running()은 브라우저 지원이 제한적이며, 세그먼트 내 헤더/푸터는 흐름에 남겨야 PDF에 반영됨 */
      .hwp-header { position: running(hwpHeader); }
      .hwp-footer { position: running(hwpFooter); }
      .segment-page .hwp-header { position: static; }
      .segment-page .hwp-footer { position: static; }
      .hwp-page-number:empty::after { content: counter(page) " / " counter(pages); }
      .segment-page { min-height: ${segmentPrintHeight}; height: ${segmentPrintHeight}; display: flex; flex-direction: column; page-break-after: always; }
      .segment-body { flex: 1; min-height: 0; overflow: hidden; }
      .hwp-cover-page, .hwp-toc-page, .hwp-divider-page { page-break-after: always; }
      table, pre, blockquote, img { page-break-inside: avoid; }
      h1, h2, h3, h4, h5, h6 { page-break-after: avoid; page-break-inside: avoid; }
      a { color: #000 !important; text-decoration: none !important; }
      a[href]::after { content: none !important; }
    }
    :root {
      --hwp-font-family: ${fontStack};
      --hwp-font-size: ${s.fontSize}pt;
      --hwp-line-height: ${s.lineHeight};
      --hwp-word-break: ${s.wordBreak};
      --hwp-indent: ${getTextIndent(s)}px;
    }
    * { box-sizing: border-box; }
    body {
      font-family: var(--hwp-font-family);
      font-size: var(--hwp-font-size);
      line-height: var(--hwp-line-height);
      word-break: var(--hwp-word-break);
      margin: ${margin.top} ${margin.right} ${margin.bottom} ${margin.left};
      color: #000; background: #fff; text-align: justify;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    p { margin: 0.4em 0; text-indent: var(--hwp-indent); orphans: 3; widows: 3; }
    h1, h2, h3, h4, h5, h6 { font-weight: bold; margin: 1.2em 0 0.5em; page-break-after: avoid; text-indent: 0; }
    h1 { font-size: 16pt; border-bottom: 2px solid #000; padding-bottom: 0.3em; }
    h2 { font-size: 14pt; border-bottom: 1px solid #333; padding-bottom: 0.2em; }
    h3 { font-size: 12pt; } h4 { font-size: 11pt; } h5, h6 { font-size: 10pt; color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 9pt; border-top: 2px solid #000; border-bottom: 2px solid #000; page-break-inside: avoid; }
    table thead th { background: #f0f0f0; border-top: 2px solid #000; border-bottom: 2px solid #000; border-left: 1px solid #999; border-right: 1px solid #999; padding: 8px 10px; text-align: center; font-weight: bold; font-size: 9pt; }
    table thead th:first-child { border-left: none; } table thead th:last-child { border-right: none; }
    table tbody td { border-bottom: 1px solid #ccc; border-left: 1px solid #ddd; border-right: 1px solid #ddd; padding: 6px 10px; vertical-align: top; }
    table tbody td:first-child { border-left: none; } table tbody td:last-child { border-right: none; }
    table tbody tr:nth-child(even) { background: #fafafa; }
    table tbody tr:last-child td { border-bottom: none; }
    table caption { caption-side: top; text-align: left; font-size: 9pt; font-weight: bold; padding: 4px 0; color: #333; }
    blockquote { border-left: 3px solid #333; background: #f9f9f9; padding: 0.5em 1em; margin: 1em 0; color: #222; page-break-inside: avoid; }
    blockquote p { text-indent: 0; }
    .callout { padding: 0.8em 1.2em; margin: 1em 0; border-radius: 4px; border-left: 4px solid; page-break-inside: avoid; }
    .callout p { text-indent: 0; margin: 0.3em 0; }
    .callout-info { background: #e8f4fd; border-left-color: #2196f3; }
    .callout-warning { background: #fff8e6; border-left-color: #ff9800; }
    .callout-tip { background: #e8f5e9; border-left-color: #4caf50; }
    .callout-note { background: #f5f5f5; border-left-color: #9e9e9e; }
    .callout-danger { background: #ffebee; border-left-color: #f44336; }
    pre { background: #f5f5f5; border: 1px solid #ddd; padding: 12px 16px; border-radius: 2px; overflow-x: auto; font-size: 9pt; white-space: pre-wrap; word-wrap: break-word; page-break-inside: avoid; }
    code { font-family: 'D2Coding', 'Nanum Gothic Coding', 'Consolas', 'Courier New', monospace; }
    :not(pre):not(.hljs) > code { background: #f0f0f0; padding: 0.15em 0.3em; border-radius: 2px; font-size: 0.9em; border: 1px solid #e0e0e0; }
    hr { border: none; border-top: 1px solid #000; margin: 1.5em 0; }
    a { color: #0563c1; text-decoration: underline; }
    img { max-width: 100%; height: auto; page-break-inside: avoid; }
    ul, ol { margin: 0.5em 0; padding-left: 2em; }
    li { margin: 0.2em 0; } li p { text-indent: 0; margin: 0.2em 0; }
    li.task-list-item { list-style: none; margin-left: -1.5em; }
    li.task-list-item input[type="checkbox"] { margin-right: 0.4em; }
    .hwp-header { font-size: ${s.headerFontSize}px; display: flex; justify-content: space-between; align-items: center; color: #888; border-bottom: 1px solid #ccc; padding: 0.3em 0 0.5em; margin-bottom: 1em; }
    .hwp-footer { font-size: ${s.footerFontSize}px; display: flex; justify-content: space-between; align-items: center; color: #888; border-top: 1px solid #ccc; padding: 0.5em 0 0.3em; margin-top: 1em; }
    .hwp-cover-page { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; text-align: center; page-break-after: always; padding: 0 2em; }
    .hwp-cover-org { font-size: 14pt; color: #333; margin-bottom: 3em; letter-spacing: 0.15em; }
    .hwp-cover-title { font-size: 28pt; font-weight: bold; margin-bottom: 0.5em; border-bottom: 3px double #000; padding-bottom: 0.4em; }
    .hwp-cover-subtitle { font-size: 16pt; color: #555; margin-bottom: 3em; }
    .hwp-cover-meta { margin-top: auto; padding-bottom: 3em; text-align: center; }
    .hwp-cover-date { font-size: 12pt; margin-bottom: 0.5em; }
    .hwp-cover-author { font-size: 12pt; font-weight: bold; }
    .hwp-toc-page { padding-top: 2em; page-break-after: always; }
    .hwp-toc-heading { font-size: 20pt; font-weight: bold; text-align: center; margin-bottom: 2em; letter-spacing: 0.3em; }
    .hwp-toc-item { display: flex; align-items: baseline; padding: 0.25em 0; }
    .hwp-toc-item a { color: #000; text-decoration: none; }
    .hwp-toc-item::after { content: ""; flex: 1; border-bottom: 1px dotted #999; margin: 0 0.4em; position: relative; bottom: 0.25em; }
    .hwp-toc-level-1 { font-size: 11pt; font-weight: bold; }
    .hwp-toc-level-2 { font-size: 10pt; padding-left: 1.5em; }
    .hwp-toc-level-3 { font-size: 9pt; padding-left: 3em; color: #333; }
    .hwp-divider-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; page-break-after: always; }
    .hwp-divider-title { font-size: 24pt; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 0.3em; }
    ${(() => {
      const boxDepth = Math.min(6, Math.max(1, s.headingBoxDepth ?? 3));
      const selectors = Array.from({ length: boxDepth }, (_, i) => `.hwp-content.boxed h${i + 1}`).join(", ");
      const rules = [
        `${selectors} { border: none; padding: 8px 12px; background: #f4f4f4; border-left: 4px solid #333; border-radius: 0; }`,
        ".hwp-content.boxed h1 { border-left-width: 6px; border-left-color: #000; }",
        ".hwp-content.boxed h2 { border-left-width: 4px; border-left-color: #333; }",
        ".hwp-content.boxed h3 { border-left-width: 3px; border-left-color: #666; background: #f8f8f8; }",
      ];
      return rules.join("\n    ");
    })()}
    .hwp-content { transform: scale(${scale}); transform-origin: top left; }
    ${breakStyles}
    .special-hide .hwp-header, .special-hide .hwp-footer { display: none; }
    .page-break { page-break-before: always; height: 0; overflow: hidden; margin: 0; padding: 0; border: none; display: block; }
    @media screen {
      .page-break { margin: 0.5em 0 1em; height: 0; border: none; display: block; }
      .page-break::before { content: "↓ 다음 페이지"; display: block; text-align: center; color: #999; font-size: 0.85em; }
      .preview-page { min-height: 297mm; display: flex; flex-direction: column; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.1); margin-bottom: 1.5em; padding: 15mm 20mm; box-sizing: border-box; border: 1px solid #e5e5e5; }
      .preview-page .preview-page-body { flex: 1; min-height: 0; }
      .preview-page:last-child { margin-bottom: 0; }
    }
    .footnote-ref a { color: #0563c1; text-decoration: none; font-size: 0.8em; }
    .footnotes-sep { margin-top: 2em; }
    .footnotes { font-size: 9pt; color: #555; }
    .footnotes ol { padding-left: 1.5em; }
    .footnotes li { margin: 0.3em 0; }
    .footnote-backref { text-decoration: none; color: #0563c1; }
  `;
}

/** 마크다운 본문에서 "페이지 나눔" 문법을 HTML로 치환 (라인 단위). \newpage, [pagebreak]. 코드 블록(4칸 들여쓰기) 내부는 제외. */
function injectPageBreakHtml(text) {
  const pageBreakDiv = '<div class="page-break"></div>';
  return text
    .replace(/^[ \t]{0,3}\\newpage[ \t]*$/gm, pageBreakDiv)
    .replace(/^[ \t]{0,3}\[pagebreak\][ \t]*$/gim, pageBreakDiv);
}

/** 위키 링크 [[문서명]] → [문서명](#slug) (5.1). [[문서명|표시]] 지원. */
function convertWikiLinks(text) {
  return text.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, target, display) => {
    const t = (target || "").trim();
    const d = (display !== undefined ? display : t).trim();
    if (!t) return "[[";
    return `[${d}](#${slugify(t)})`;
  });
}

export function renderMarkdown(content) {
  md.set({ breaks: state.settings.breaks });
  const { frontmatter, body } = parseFrontmatter(content);
  let source = state.settings.emoji ? replaceEmojis(body) : body;
  source = injectPageBreakHtml(source);
  source = convertWikiLinks(source);
  const env = {};
  const tokens = md.parse(source, env);
  const headings = extractHeadings(tokens);
  let html = md.renderer.render(tokens, md.options, env);
  html = html.replace(/<!--\s*pagebreak\s*-->/gi, '<div class="page-break"></div>').replace(/<!--\s*newpage\s*-->/gi, '<div class="page-break"></div>');
  html = renderFootnotes(html);
  html = renderKatex(html);
  html = legacyColorize(html);
  const tocHtml = headings
    .map((h) => {
      const cls = `hwp-toc-level-${h.level}`;
      return `<div class="hwp-toc-item ${cls}"><a href="#${h.id}">${escapeHtml(h.text)}</a><span class="hwp-toc-page-num"> </span></div>`;
    })
    .join("");
  return { bodyHtml: html, tocHtml, frontmatter, headings };
}

export function buildDocumentHtml(content, { forExport }) {
  const { bodyHtml, tocHtml, frontmatter, headings } = renderMarkdown(content);
  const header = buildHeader(frontmatter);
  const footer = buildFooter(frontmatter);
  const cover = state.settings.coverPage ? buildCover(frontmatter) : "";
  const tocDepth = Math.min(6, Math.max(1, state.settings.tocDepth ?? 3));
  const filteredTocHeadings = headings.filter((h) => h.level <= tocDepth);
  const tocHtmlFiltered = filteredTocHeadings
    .map((h) => {
      const cls = `hwp-toc-level-${h.level}`;
      return `<div class="hwp-toc-item ${cls}"><a href="#${h.id}">${escapeHtml(h.text)}</a><span class="hwp-toc-page-num"> </span></div>`;
    })
    .join("");
  const toc = state.settings.tocPage ? buildToc(tocHtmlFiltered) : "";
  const divider = state.settings.dividerPage ? buildDivider(headings) : "";
  const hideHeaderFooterClass =
    state.settings.hideHeaderFooterOnSpecialPages && (state.settings.coverPage || state.settings.tocPage || state.settings.dividerPage)
      ? "special-hide"
      : "";
  const headingClass = state.settings.headingStyle === "boxed" ? "boxed" : "basic";
  const margin = getMargin(state.settings);
  const isDark = !forExport && document.body.dataset.theme === "dark";
  const highlightTheme = isDark ? "tomorrow-night" : "tomorrow";
  const highlightCss = state.settings.highlight
    ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${highlightTheme}.min.css">`
    : "";
  const fontsCss = `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Nanum+Myeongjo:wght@400;700;800&family=Nanum+Gothic+Coding:wght@400;700&family=Noto+Serif+KR:wght@400;700&family=Pretendard+Variable:wght@400;700&display=swap" rel="stylesheet">`;
  const katexCss = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">`;
  const hasMermaid = bodyHtml.includes('<div class="mermaid">');
  const mermaidScript = hasMermaid
    ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.1/mermaid.min.js"><\/script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });<\/script>`
    : "";

  const pageBreakPattern = /<div\s+class=["']page-break["']\s*>\s*<\/div>/g;
  const hasPageBreaks = pageBreakPattern.test(bodyHtml);
  pageBreakPattern.lastIndex = 0;
  let mainContent = bodyHtml;
  if (hasPageBreaks) {
    const segments = bodyHtml.split(/<div\s+class=["']page-break["']\s*>\s*<\/div>/);
    const totalSegments = segments.length;
    const pageBreakDiv = '<div class="page-break"></div>';
    if (forExport) {
      mainContent = segments
        .map((seg, i) => {
          const pageInfo = { segmentIndex: i + 1, totalSegments };
          const segHeader = state.settings.headerEnabled ? buildHeader(frontmatter, pageInfo) : "";
          const segFooter = state.settings.footerEnabled ? buildFooter(frontmatter, pageInfo) : "";
          return `<div class="segment-page">${segHeader}<div class="segment-body">${seg}</div>${segFooter}</div>`;
        })
        .join("");
    } else {
      mainContent = segments
        .map((seg, i) => {
          const pageInfo = { segmentIndex: i + 1, totalSegments };
          const segHeader = state.settings.headerEnabled ? buildHeader(frontmatter, pageInfo) : "";
          const segFooter = state.settings.footerEnabled ? buildFooter(frontmatter, pageInfo) : "";
          return `<div class="preview-page">${segHeader}<div class="preview-page-body">${seg}</div>${segFooter}</div>`;
        })
        .join(pageBreakDiv);
    }
  }

  const showGlobalHeaderFooter = !hasPageBreaks;

  return `<!DOCTYPE html>
<html class="HWP">
<head>
  <meta charset="UTF-8">
  <meta name="Generator" content="Hwp 2022">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${escapeHtml(frontmatter.title || "문서")}</title>
  ${fontsCss}
  ${highlightCss}
  ${katexCss}
  <style>${buildBaseStyles({ forExport })}</style>
  ${(state.settings.customCss || "").trim() ? `<style>/* 커스텀 CSS */\n${state.settings.customCss.trim()}</style>` : ""}
</head>
<body class="HWP-DOCUMENT HWP-BODY ${hideHeaderFooterClass}">
  ${showGlobalHeaderFooter && state.settings.headerEnabled ? header : ""}
  ${cover}
  ${toc}
  ${divider}
  <main class="HWP-PARAGRAPH hwp-content ${headingClass}">${mainContent}</main>
  ${showGlobalHeaderFooter && state.settings.footerEnabled ? footer : ""}
  ${mermaidScript}
</body>
</html>`;
}
