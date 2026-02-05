const DEFAULT_MARKDOWN = `---
title: HWP MD PDF 웹 서비스
subtitle: 마크다운을 한글 스타일 PDF로 변환
author: 작성자
date: 2026-02-05
organization: 소속 기관
---

# 제목 1
본문 내용입니다. **굵은 글씨**와 *이탤릭*을 지원합니다.

## 제목 2
### 제목 3

| 항목 | 설명 |
|------|------|
| A | 첫 번째 |
| B | 두 번째 |

> 인용문 블록입니다.

\`\`\`javascript
function hello() {
  console.log("Hello, HWP MD PDF!");
}
\`\`\`

- 목록 항목 1
- 목록 항목 2
  - 하위 항목
`;

const DEFAULT_SETTINGS = {
  fontFamily: "NanumGothic",
  fontSize: 10,
  lineHeight: 1.6,
  wordBreak: "keep-all",
  indent: 0,
  pdfScale: 1,
  marginTop: "15mm",
  marginBottom: "15mm",
  marginLeft: "20mm",
  marginRight: "20mm",
  tableStyle: "hwp",
  headingStyle: "basic",
  breakH1: false,
  breakH2: false,
  breakH3: false,
  coverPage: false,
  tocPage: false,
  dividerPage: false,
  headerEnabled: true,
  headerSize: 9,
  headerLeft: "title",
  headerCenter: "none",
  headerRight: "date",
  footerEnabled: true,
  footerSize: 9,
  footerLeft: "none",
  footerCenter: "page",
  footerRight: "none",
  convertBreaks: true,
  enableEmoji: true,
  enableHighlight: true,
  printBackground: true,
  hideOnSpecial: true,
};

const HELP_STEPS = [
  {
    title: "📁 문서 관리",
    desc:
      "• 새 문서: 현재 작업 중인 내용을 지우고 새 문서를 시작합니다 • 폴더 연결: 로컬 폴더를 연결하면 마크다운에서 상대 경로로 이미지를 불러올 수 있습니다 • 불러오기: .md 또는 .txt 파일을 불러옵니다 • 저장하기: 현재 문서를 .md 파일로 저장합니다",
  },
  {
    title: "📤 내보내기",
    desc: "• HTML: 스타일이 적용된 HTML 파일로 내보냅니다 • PDF: 인쇄 대화상자를 열어 PDF로 저장합니다",
  },
  {
    title: "✏️ 편집 도구",
    desc:
      "• 되돌리기/다시실행: 작업을 취소하거나 다시 실행합니다 • 표: 마크다운 표를 삽입합니다 • 수평선: 구분선(---)을 삽입합니다 • 코드 블록: 코드 블록을 삽입합니다 • 인용: 인용문(>)을 삽입합니다 • 링크/이미지: 링크와 이미지를 삽입합니다",
  },
  {
    title: "👁️ 보기 모드",
    desc: "• 편집: 마크다운 편집기만 표시합니다 • 분할: 편집기와 미리보기를 나란히 표시합니다 • 미리보기: 렌더링된 결과만 표시합니다",
  },
  {
    title: "⚙️ 설정",
    desc: "설정 패널을 열어 문서 스타일을 세부적으로 조정할 수 있습니다. 다음 단계에서 각 설정 항목을 안내합니다.",
  },
  {
    title: "📐 확대/축소",
    desc: "문서 미리보기와 PDF 출력 크기를 조정합니다.",
  },
  {
    title: "🔤 글꼴",
    desc: "본문과 제목에 사용할 글꼴을 선택합니다.",
  },
  {
    title: "📏 크기",
    desc: "글자 크기와 줄 간격을 조정합니다.",
  },
  {
    title: "📄 여백",
    desc: "페이지 상하좌우 여백을 설정합니다.",
  },
  {
    title: "📑 특수 페이지",
    desc: "표지, 목차, 간지 페이지를 추가할 수 있습니다.",
  },
  {
    title: "📋 헤더",
    desc: "페이지 상단에 표시될 머리글을 설정합니다.",
  },
  {
    title: "📄 푸터",
    desc: "페이지 하단에 표시될 바닥글과 페이지 번호를 설정합니다.",
  },
];

const editor = document.getElementById("editor");
const lineNumbers = document.getElementById("lineNumbers");
const statusbar = document.getElementById("statusbar");
const previewFrame = document.getElementById("previewFrame");
const zoomLabel = document.getElementById("zoomLabel");
const fileInput = document.getElementById("fileInput");

const settingsModal = document.getElementById("settingsModal");
const infoModal = document.getElementById("infoModal");
const presetModal = document.getElementById("presetModal");
const helpModal = document.getElementById("helpModal");

const helpTitle = document.getElementById("helpTitle");
const helpDesc = document.getElementById("helpDesc");
const helpStep = document.getElementById("helpStep");
const splitter = document.getElementById("splitter");

let settings = loadSettings();
let zoom = 1;
let helpIndex = 0;
let isApplyingHistory = false;
let historySnapshot = null;
const undoStack = [];
const redoStack = [];

const md = window.markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: settings.convertBreaks,
  highlight(code, lang) {
    if (!settings.enableHighlight) {
      return "";
    }
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
  if (text) {
    const slug = slugify(text);
    token.attrSet("id", slug);
  }
  return originalHeadingOpen(tokens, idx, options, env, self);
};

initialize();

function initialize() {
  editor.value = loadMarkdown();
  bindToolbar();
  bindSettings();
  bindPreset();
  bindModals();
  bindSplitter();
  updateLineNumbers();
  updateStatus();
  updatePreview();
  updateThemeLabel();
  updateZoomLabel();
  historySnapshot = createSnapshot();
}

function bindToolbar() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
      document.querySelectorAll("[data-view]").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
    });
  });

  document.querySelectorAll("[data-insert]").forEach((button) => {
    button.addEventListener("click", () => handleInsert(button.dataset.insert));
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action));
  });

  const headingSelect = document.getElementById("headingLevel");
  if (headingSelect) {
    headingSelect.addEventListener("change", () => {
      setHeadingLevel(Number(headingSelect.value));
    });
  }

  editor.addEventListener("input", () => {
    if (!isApplyingHistory) {
      pushHistorySnapshot();
    }
    saveMarkdown(editor.value);
    updateLineNumbers();
    updateStatus();
    updatePreview();
    if (!isApplyingHistory) {
      historySnapshot = createSnapshot();
      redoStack.length = 0;
    }
  });

  editor.addEventListener("click", updateStatus);
  editor.addEventListener("keyup", updateStatus);
  editor.addEventListener("scroll", syncLineScroll);
}

function bindSettings() {
  const bindings = {
    fontFamily: "fontFamily",
    fontSize: "fontSize",
    lineHeight: "lineHeight",
    wordBreak: "wordBreak",
    indent: "indent",
    pdfScale: "pdfScale",
    marginTop: "marginTop",
    marginBottom: "marginBottom",
    marginLeft: "marginLeft",
    marginRight: "marginRight",
    tableStyle: "tableStyle",
    headingStyle: "headingStyle",
    breakH1: "breakH1",
    breakH2: "breakH2",
    breakH3: "breakH3",
    coverPage: "coverPage",
    tocPage: "tocPage",
    dividerPage: "dividerPage",
    headerEnabled: "headerEnabled",
    headerSize: "headerSize",
    headerLeft: "headerLeft",
    headerCenter: "headerCenter",
    headerRight: "headerRight",
    footerEnabled: "footerEnabled",
    footerSize: "footerSize",
    footerLeft: "footerLeft",
    footerCenter: "footerCenter",
    footerRight: "footerRight",
    convertBreaks: "convertBreaks",
    enableEmoji: "enableEmoji",
    enableHighlight: "enableHighlight",
    printBackground: "printBackground",
    hideOnSpecial: "hideOnSpecial",
  };

  Object.keys(bindings).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") {
      el.checked = settings[bindings[id]];
      if (!el.dataset.bound) {
        el.addEventListener("change", () => {
          settings[bindings[id]] = el.checked;
          handleSettingsChange();
        });
        el.dataset.bound = "true";
      }
      return;
    }
    el.value = settings[bindings[id]];
    if (!el.dataset.bound) {
      el.addEventListener("change", () => {
        if (el.type === "number") {
          settings[bindings[id]] = Number(el.value);
        } else {
          settings[bindings[id]] = el.value;
        }
        handleSettingsChange();
      });
      el.dataset.bound = "true";
    }
  });
}

function bindPreset() {
  renderPresets();
}

function bindModals() {
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (event) => {
      if (event.target !== overlay) return;
      const id = overlay.getAttribute("id") || "";
      if (id === "settingsModal") closeModal("settings");
      if (id === "infoModal") closeModal("info");
      if (id === "presetModal") closeModal("preset");
      if (id === "helpModal") closeModal("help");
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeModal("settings");
    closeModal("info");
    closeModal("preset");
    closeModal("help");
  });
}

function handleAction(action) {
  switch (action) {
    case "new":
      if (confirm("새 문서를 시작할까요?")) {
        editor.value = DEFAULT_MARKDOWN;
        saveMarkdown(editor.value);
        updateLineNumbers();
        updateStatus();
        updatePreview();
      }
      break;
    case "folder":
      alert("브라우저 환경에서는 폴더 연결을 지원하지 않습니다.");
      break;
    case "load":
      fileInput.click();
      break;
    case "save":
      downloadFile("document.md", editor.value);
      break;
    case "export-html":
      downloadFile("document.html", buildExportHtml());
      break;
    case "export-pdf":
      openPrintWindow();
      break;
    case "undo":
      undo();
      break;
    case "redo":
      redo();
      break;
    case "toggle-theme":
      toggleTheme();
      break;
    case "help":
      openHelp(0);
      break;
    case "preset":
      openModal("preset");
      break;
    case "settings":
      openModal("settings");
      break;
    case "info":
      openModal("info");
      break;
    case "zoom-in":
      setZoom(zoom + 0.1);
      break;
    case "zoom-out":
      setZoom(zoom - 0.1);
      break;
    case "help-next":
      openHelp(Math.min(HELP_STEPS.length - 1, helpIndex + 1));
      break;
    case "help-prev":
      openHelp(Math.max(0, helpIndex - 1));
      break;
    case "help-skip":
      closeModal("help");
      break;
    case "preset-save":
      savePresetPrompt();
      break;
    case "preset-export":
      exportPresets();
      break;
    case "preset-import":
      importPresets();
      break;
    default:
      break;
  }
}

function handleInsert(type) {
  const insertionMap = {
    bold: { open: "**", close: "**" },
    italic: { open: "*", close: "*" },
    strike: { open: "~~", close: "~~" },
    "inline-code": { open: "`", close: "`" },
    paragraph: { open: "\n\n", close: "" },
    ul: { open: "\n- ", close: "" },
    ol: { open: "\n1. ", close: "" },
    checklist: { open: "\n- [ ] ", close: "" },
    quote: { open: "\n> ", close: "" },
    hr: { open: "\n\n---\n\n", close: "" },
    link: { open: "[링크 텍스트](", close: ")" },
    image: { open: "![이미지 설명](", close: ")" },
    "code-block": { open: "\n```javascript\n", close: "\n```\n" },
    table: {
      open:
        "\n| 항목 | 설명 |\n|------|------|\n| 내용 | 내용 |\n",
      close: "",
    },
  };

  const config = insertionMap[type];
  if (!config) return;
  insertAtCursor(config.open, config.close);
}

function insertAtCursor(openText, closeText) {
  pushHistorySnapshot();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const before = editor.value.slice(0, start);
  const selected = editor.value.slice(start, end);
  const after = editor.value.slice(end);
  editor.value = `${before}${openText}${selected}${closeText}${after}`;
  editor.selectionStart = start + openText.length;
  editor.selectionEnd = start + openText.length + selected.length;
  editor.focus();
  saveMarkdown(editor.value);
  updateLineNumbers();
  updateStatus();
  updatePreview();
  historySnapshot = createSnapshot();
  redoStack.length = 0;
}

function setHeadingLevel(level) {
  pushHistorySnapshot();
  const text = editor.value;
  const cursor = editor.selectionStart;
  const lineStart = text.lastIndexOf("\n", cursor - 1) + 1;
  const lineEnd = text.indexOf("\n", cursor);
  const end = lineEnd === -1 ? text.length : lineEnd;
  const line = text.slice(lineStart, end);
  const stripped = line.replace(/^#{1,6}\s+/, "");
  const prefix = level === 0 ? "" : `${"#".repeat(level)} `;
  const updatedLine = `${prefix}${stripped}`;
  editor.value = `${text.slice(0, lineStart)}${updatedLine}${text.slice(end)}`;
  const newCursor = lineStart + prefix.length + (cursor - lineStart);
  editor.selectionStart = newCursor;
  editor.selectionEnd = newCursor;
  editor.focus();
  saveMarkdown(editor.value);
  updateLineNumbers();
  updateStatus();
  updatePreview();
  historySnapshot = createSnapshot();
  redoStack.length = 0;
}

function createSnapshot() {
  return {
    value: editor.value,
    start: editor.selectionStart,
    end: editor.selectionEnd,
  };
}

function pushHistorySnapshot() {
  if (!historySnapshot) {
    historySnapshot = createSnapshot();
    return;
  }
  if (historySnapshot.value === editor.value) return;
  undoStack.push(historySnapshot);
  if (undoStack.length > 200) {
    undoStack.shift();
  }
}

function applySnapshot(snapshot) {
  isApplyingHistory = true;
  editor.value = snapshot.value;
  editor.selectionStart = snapshot.start;
  editor.selectionEnd = snapshot.end;
  saveMarkdown(editor.value);
  updateLineNumbers();
  updateStatus();
  updatePreview();
  historySnapshot = createSnapshot();
  isApplyingHistory = false;
}

function undo() {
  if (!undoStack.length) return;
  const current = createSnapshot();
  const prev = undoStack.pop();
  redoStack.push(current);
  applySnapshot(prev);
}

function redo() {
  if (!redoStack.length) return;
  const current = createSnapshot();
  const next = redoStack.pop();
  undoStack.push(current);
  applySnapshot(next);
}

function bindSplitter() {
  if (!splitter) return;
  let isDragging = false;
  splitter.addEventListener("mousedown", (event) => {
    isDragging = true;
    document.body.style.cursor = "col-resize";
    event.preventDefault();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = "";
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    const bounds = document.querySelector(".workspace").getBoundingClientRect();
    const minWidth = 260;
    const maxWidth = bounds.width - 260;
    const nextWidth = Math.min(maxWidth, Math.max(minWidth, event.clientX - bounds.left));
    document.querySelector(".workspace").style.setProperty("--editor-width", `${nextWidth}px`);
  });
}

function setView(view) {
  document.querySelector(".workspace").dataset.view = view;
}

function setZoom(nextZoom) {
  zoom = Math.min(2, Math.max(0.6, Number(nextZoom.toFixed(2))));
  updateZoomLabel();
  updatePreview();
}

function updateZoomLabel() {
  zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
}

function updateLineNumbers() {
  const lines = editor.value.split("\n").length || 1;
  lineNumbers.innerHTML = Array.from({ length: lines })
    .map((_, i) => `<div>${i + 1}</div>`)
    .join("");
}

function syncLineScroll() {
  lineNumbers.scrollTop = editor.scrollTop;
}

function updateStatus() {
  const text = editor.value;
  const lines = text.split("\n").length || 1;
  const chars = text.length;
  const cursor = editor.selectionStart;
  const before = text.slice(0, cursor);
  const row = before.split("\n").length;
  const col = before.length - before.lastIndexOf("\n");
  statusbar.textContent = `줄 ${row}, 열 ${col} · ${lines}줄 · ${chars}자 · Markdown`;
}

function updatePreview() {
  md.set({ breaks: settings.convertBreaks });
  const html = buildPreviewHtml();
  previewFrame.srcdoc = html;
}

function buildPreviewHtml() {
  return buildDocumentHtml({ forExport: false });
}

function buildExportHtml() {
  return buildDocumentHtml({ forExport: true });
}

function buildDocumentHtml({ forExport }) {
  const { bodyHtml, tocHtml, frontmatter, headings } = renderMarkdown(editor.value);
  const header = buildHeader(frontmatter);
  const footer = buildFooter(frontmatter, headings);
  const cover = settings.coverPage ? buildCover(frontmatter) : "";
  const toc = settings.tocPage ? buildToc(tocHtml) : "";
  const divider = settings.dividerPage ? buildDivider(headings) : "";
  const hideHeaderFooterClass =
    settings.hideOnSpecial && (settings.coverPage || settings.tocPage || settings.dividerPage)
      ? "special-hide"
      : "";
  const headingClass = settings.headingStyle === "boxed" ? "boxed" : "basic";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(frontmatter.title || "문서")}</title>
  ${settings.enableHighlight ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tomorrow.min.css">' : ""}
  <style>${buildBaseStyles({ forExport })}</style>
</head>
<body class="${hideHeaderFooterClass}">
  ${settings.headerEnabled ? header : ""}
  ${cover}
  ${toc}
  ${divider}
  <main class="hwp-content ${headingClass}">${bodyHtml}</main>
  ${settings.footerEnabled ? footer : ""}
</body>
</html>`;
}

function renderMarkdown(content) {
  const { frontmatter, body } = parseFrontmatter(content);
  const source = settings.enableEmoji ? replaceEmojis(body) : body;
  const env = {};
  const tokens = md.parse(source, env);
  const headings = extractHeadings(tokens);
  const html = md.renderer.render(tokens, md.options, env);
  const tocHtml = headings
    .map((h) => {
      const cls = `hwp-toc-level-${h.level}`;
      return `<div class="hwp-toc-item ${cls}"><a href="#${h.id}">${escapeHtml(
        h.text
      )}</a><span class="hwp-toc-page-num"> </span></div>`;
    })
    .join("");
  return { bodyHtml: html, tocHtml, frontmatter, headings };
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

function buildHeader(frontmatter) {
  const left = resolveHeaderFooterValue(settings.headerLeft, frontmatter);
  const center = resolveHeaderFooterValue(settings.headerCenter, frontmatter);
  const right = resolveHeaderFooterValue(settings.headerRight, frontmatter);
  return `<header class="hwp-header">
    <div>${left}</div>
    <div>${center}</div>
    <div>${right}</div>
  </header>`;
}

function buildFooter(frontmatter) {
  const left = resolveHeaderFooterValue(settings.footerLeft, frontmatter);
  const center = resolveHeaderFooterValue(settings.footerCenter, frontmatter);
  const right = resolveHeaderFooterValue(settings.footerRight, frontmatter);
  return `<footer class="hwp-footer">
    <div>${left}</div>
    <div>${center}</div>
    <div>${right}</div>
  </footer>`;
}

function resolveHeaderFooterValue(type, frontmatter) {
  if (type === "none") return "";
  if (type === "title") return escapeHtml(frontmatter.title || "");
  if (type === "date") return escapeHtml(frontmatter.date || formatDate(new Date()));
  if (type === "page") return "1 / 1";
  return "";
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
  const headingClass = settings.headingStyle === "boxed" ? "boxed" : "basic";
  const scale = forExport ? settings.pdfScale : zoom;
  const breakStyles = [
    settings.breakH1 ? "h1 { page-break-before: always; }" : "",
    settings.breakH2 ? "h2 { page-break-before: always; }" : "",
    settings.breakH3 ? "h3 { page-break-before: always; }" : "",
  ].join("\n");

  return `
    :root {
      --hwp-font-family: '${settings.fontFamily}', 'Nanum Gothic', sans-serif;
      --hwp-font-size: ${settings.fontSize}pt;
      --hwp-line-height: ${settings.lineHeight};
      --hwp-word-break: ${settings.wordBreak};
      --hwp-indent: ${settings.indent}px;
    }

    body {
      font-family: var(--hwp-font-family);
      font-size: var(--hwp-font-size);
      line-height: var(--hwp-line-height);
      word-break: var(--hwp-word-break);
      margin: ${settings.marginTop} ${settings.marginRight} ${settings.marginBottom} ${settings.marginLeft};
      color: #000;
      background: #fff;
      text-align: justify;
    }

    p {
      margin: 0.5em 0;
      text-indent: var(--hwp-indent);
    }

    h1, h2, h3, h4, h5, h6 {
      font-weight: bold;
      margin: 1.2em 0 0.6em;
      page-break-after: avoid;
    }

    h1 {
      font-size: 16pt;
      border-bottom: 2px solid #000;
      padding-bottom: 0.3em;
    }

    h2 {
      font-size: 14pt;
      border-bottom: 1px solid #333;
      padding-bottom: 0.2em;
    }

    h3 { font-size: 12pt; }
    h4 { font-size: 11pt; }
    h5, h6 { font-size: 10pt; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 9pt;
    }

    table th, table td {
      border: 1px solid #000;
      padding: 6px 10px;
    }

    table thead th {
      background: #f0f0f0;
      text-align: center;
    }

    blockquote {
      border-left: 3px solid #333;
      background: #f9f9f9;
      padding: 0.5em 1em;
      margin: 1em 0;
    }

    pre {
      background: #f5f5f5;
      border: 1px solid #ddd;
      padding: 12px;
      border-radius: 2px;
      overflow-x: auto;
      font-size: 9pt;
      white-space: pre-wrap;
    }

    code {
      font-family: 'Nanum Gothic Coding', 'D2Coding', monospace;
    }

    hr {
      border: none;
      border-top: 1px solid #000;
      margin: 1.5em 0;
    }

    a {
      color: #0563c1;
      text-decoration: underline;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    .hwp-header {
      font-size: ${settings.headerSize}px;
      display: flex;
      justify-content: space-between;
      color: #888;
      border-bottom: 1px solid #ddd;
      padding: 0.5em 0;
    }

    .hwp-footer {
      font-size: ${settings.footerSize}px;
      border-top: 1px solid #ddd;
      border-bottom: none;
      margin-top: 0.5em;
    }

    .hwp-cover-page,
    .hwp-toc-page,
    .hwp-divider-page {
      page-break-after: always;
    }

    .hwp-cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
    }

    .hwp-cover-org { font-size: 14pt; color: #333; margin-bottom: 3em; }
    .hwp-cover-title { font-size: 28pt; font-weight: bold; margin-bottom: 0.5em; }
    .hwp-cover-subtitle { font-size: 16pt; color: #555; margin-bottom: 3em; }
    .hwp-cover-meta { margin-top: auto; padding-bottom: 3em; }
    .hwp-cover-date, .hwp-cover-author { font-size: 12pt; }

    .hwp-toc-page { padding-top: 2em; }
    .hwp-toc-heading {
      font-size: 20pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 2em;
      letter-spacing: 0.3em;
    }
    .hwp-toc-item { display: flex; align-items: baseline; }
    .hwp-toc-item::after {
      content: "";
      flex: 1;
      border-bottom: 1px dotted #999;
      margin: 0 0.4em;
      position: relative;
      bottom: 0.25em;
    }
    .hwp-toc-level-1 { font-size: 11pt; }
    .hwp-toc-level-2 { font-size: 10pt; }
    .hwp-toc-level-3 { font-size: 9pt; color: #333; }

    .hwp-divider-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .hwp-divider-title { font-size: 24pt; font-weight: bold; }

    .hwp-content.boxed h1,
    .hwp-content.boxed h2,
    .hwp-content.boxed h3 {
      border: none;
      padding: 0;
    }

    .hwp-content.boxed h1::before,
    .hwp-content.boxed h2::before,
    .hwp-content.boxed h3::before {
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      background: #333;
      margin-right: 8px;
    }

    .hwp-content {
      transform: scale(${scale});
      transform-origin: top left;
    }

    ${breakStyles}

    .special-hide .hwp-header,
    .special-hide .hwp-footer {
      display: none;
    }

    .hwp-content.${headingClass} {}
  `;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: text };
  }
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

function slugify(text) {
  return encodeURIComponent(
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w가-힣-]/g, "")
  );
}

function replaceEmojis(text) {
  const map = {
    ":smile:": "😄",
    ":grin:": "😁",
    ":heart:": "❤️",
    ":thumbsup:": "👍",
    ":fire:": "🔥",
    ":sparkles:": "✨",
  };
  return Object.keys(map).reduce((acc, key) => acc.replaceAll(key, map[key]), text);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${d}.`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function openModal(name) {
  const map = {
    settings: settingsModal,
    info: infoModal,
    preset: presetModal,
    help: helpModal,
  };
  map[name].hidden = false;
  if (name === "settings") {
    document.body.classList.add("settings-open");
  }
  if (name === "preset") {
    renderPresets();
  }
}

function closeModal(name) {
  const map = {
    settings: settingsModal,
    info: infoModal,
    preset: presetModal,
    help: helpModal,
  };
  map[name].hidden = true;
  if (name === "settings") {
    document.body.classList.remove("settings-open");
  }
}

function openHelp(index) {
  helpIndex = index;
  const step = HELP_STEPS[index];
  helpTitle.textContent = step.title;
  helpDesc.textContent = step.desc;
  helpStep.textContent = `${index + 1}/${HELP_STEPS.length}`;
  openModal("help");
  const nextBtn = document.querySelector('[data-action="help-next"]');
  if (index === HELP_STEPS.length - 1) {
    nextBtn.textContent = "완료";
    nextBtn.dataset.action = "help-skip";
  } else {
    nextBtn.textContent = "다음";
    nextBtn.dataset.action = "help-next";
  }
}

function toggleTheme() {
  const body = document.body;
  body.dataset.theme = body.dataset.theme === "light" ? "dark" : "light";
  updateThemeLabel();
}

function updateThemeLabel() {
  const button = document.querySelector('[data-action="toggle-theme"]');
  button.textContent = document.body.dataset.theme === "light" ? "라이트" : "다크";
}

function handleSettingsChange() {
  saveSettings(settings);
  updatePreview();
}

function openPrintWindow() {
  const html = buildExportHtml();
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("팝업이 차단되어 PDF 내보내기를 열 수 없습니다.");
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function downloadFile(filename, content) {
  const type = filename.endsWith(".html") ? "text/html" : "text/plain";
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function saveMarkdown(value) {
  localStorage.setItem("markdown", value);
}

function loadMarkdown() {
  return localStorage.getItem("markdown") || DEFAULT_MARKDOWN;
}

function saveSettings(value) {
  localStorage.setItem("settings", JSON.stringify(value));
}

function loadSettings() {
  const raw = localStorage.getItem("settings");
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    return { ...DEFAULT_SETTINGS };
  }
}

function renderPresets() {
  const list = loadPresets();
  const container = document.getElementById("presetList");
  const empty = document.getElementById("presetEmpty");
  container.innerHTML = "";
  if (!list.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  list.forEach((preset, index) => {
    const item = document.createElement("div");
    item.className = "preset-item";
    item.innerHTML = `<span>${preset.name}</span>
      <div>
        <button class="btn small" data-apply="${index}">적용</button>
        <button class="btn small" data-delete="${index}">삭제</button>
      </div>`;
    container.appendChild(item);
  });
  container.querySelectorAll("[data-apply]").forEach((btn) => {
    btn.addEventListener("click", () => applyPreset(Number(btn.dataset.apply)));
  });
  container.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => deletePreset(Number(btn.dataset.delete)));
  });
}

function savePresetPrompt() {
  const name = prompt("프리셋 이름을 입력하세요");
  if (!name) return;
  const list = loadPresets();
  list.push({ name, settings });
  localStorage.setItem("presets", JSON.stringify(list));
  renderPresets();
}

function applyPreset(index) {
  const list = loadPresets();
  const preset = list[index];
  if (!preset) return;
  settings = { ...settings, ...preset.settings };
  saveSettings(settings);
  bindSettings();
  updatePreview();
}

function deletePreset(index) {
  const list = loadPresets();
  list.splice(index, 1);
  localStorage.setItem("presets", JSON.stringify(list));
  renderPresets();
}

function exportPresets() {
  const list = loadPresets();
  downloadFile("presets.json", JSON.stringify(list, null, 2));
}

function importPresets() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const list = JSON.parse(text);
      if (Array.isArray(list)) {
        localStorage.setItem("presets", JSON.stringify(list));
        renderPresets();
      }
    } catch (error) {
      alert("프리셋 파일을 읽을 수 없습니다.");
    }
  });
  input.click();
}

function loadPresets() {
  const raw = localStorage.getItem("presets");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const text = await file.text();
  editor.value = text;
  saveMarkdown(editor.value);
  updateLineNumbers();
  updateStatus();
  updatePreview();
  fileInput.value = "";
});
