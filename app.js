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

/** 원본(md.takjakim.kr)과 동일한 키/구조로 호환 */
const DEFAULT_SETTINGS = {
  breaks: true,
  emoji: true,
  highlight: true,
  fontFamily: "nanum-gothic",
  fontSize: 10,
  lineHeight: 1.6,
  wordBreak: "keep-all",
  textIndent: "0",
  scale: 1,
  margin: { top: "15mm", right: "20mm", bottom: "15mm", left: "20mm" },
  tableStyle: "hwp",
  headingStyle: "default",
  pageBreakBeforeH1: false,
  pageBreakBeforeH2: false,
  pageBreakBeforeH3: false,
  coverPage: false,
  tocPage: false,
  dividerPage: false,
  headerEnabled: true,
  headerFontSize: 9,
  headerLeft: "title",
  headerCenter: "none",
  headerRight: "date",
  footerEnabled: true,
  footerFontSize: 9,
  footerLeft: "none",
  footerCenter: "pageNumber",
  footerRight: "none",
  printBackground: true,
  hideHeaderFooterOnSpecialPages: true,
};

/** margin 값 읽기: 설정이 객체면 그대로, 예전 개별 키면 객체로 반환 */
function getMargin(s) {
  if (s.margin && typeof s.margin === "object") return s.margin;
  return {
    top: s.marginTop || "15mm",
    right: s.marginRight || "20mm",
    bottom: s.marginBottom || "15mm",
    left: s.marginLeft || "20mm",
  };
}

/** 숫자 들여쓰기 (textIndent 문자열 허용) */
function getTextIndent(s) {
  const v = s.textIndent;
  if (typeof v === "number") return v;
  return Number(v) || 0;
}

/**
 * 가져온 프리셋 설정을 원본 형식으로 정규화.
 * 예전 우리 형식(convertBreaks, marginTop 등) → 원본 형식(breaks, margin) 마이그레이션.
 */
function normalizeImportedPresetSettings(imported) {
  if (!imported || typeof imported !== "object") return { ...DEFAULT_SETTINGS };
  const m = getMargin(imported);
  const out = {
    ...DEFAULT_SETTINGS,
    breaks: imported.breaks ?? imported.convertBreaks ?? DEFAULT_SETTINGS.breaks,
    emoji: imported.emoji ?? imported.enableEmoji ?? DEFAULT_SETTINGS.emoji,
    highlight: imported.highlight ?? imported.enableHighlight ?? DEFAULT_SETTINGS.highlight,
    scale: Number(imported.scale ?? imported.pdfScale ?? DEFAULT_SETTINGS.scale) || 1,
    textIndent: imported.textIndent !== undefined ? String(imported.textIndent) : (imported.indent !== undefined ? String(imported.indent) : DEFAULT_SETTINGS.textIndent),
    margin: m,
    headerFontSize: Number(imported.headerFontSize ?? imported.headerSize ?? DEFAULT_SETTINGS.headerFontSize) || 9,
    footerFontSize: Number(imported.footerFontSize ?? imported.footerSize ?? DEFAULT_SETTINGS.footerFontSize) || 9,
    footerCenter: imported.footerCenter === "page" ? "pageNumber" : (imported.footerCenter ?? DEFAULT_SETTINGS.footerCenter),
    headingStyle: imported.headingStyle === "basic" ? "default" : (imported.headingStyle ?? DEFAULT_SETTINGS.headingStyle),
    pageBreakBeforeH1: imported.pageBreakBeforeH1 ?? imported.breakH1 ?? DEFAULT_SETTINGS.pageBreakBeforeH1,
    pageBreakBeforeH2: imported.pageBreakBeforeH2 ?? imported.breakH2 ?? DEFAULT_SETTINGS.pageBreakBeforeH2,
    pageBreakBeforeH3: imported.pageBreakBeforeH3 ?? imported.breakH3 ?? DEFAULT_SETTINGS.pageBreakBeforeH3,
    hideHeaderFooterOnSpecialPages: imported.hideHeaderFooterOnSpecialPages ?? imported.hideOnSpecial ?? DEFAULT_SETTINGS.hideHeaderFooterOnSpecialPages,
  };
  ["fontFamily", "fontSize", "lineHeight", "wordBreak", "tableStyle", "headingStyle",
    "coverPage", "tocPage", "dividerPage", "headerEnabled", "footerEnabled",
    "headerLeft", "headerCenter", "headerRight", "footerLeft", "footerRight",
    "printBackground"].forEach((k) => {
    if (imported[k] !== undefined) out[k] = imported[k];
  });
  const font = imported.fontFamily;
  if (font) {
    const v = String(font).toLowerCase().replace(/\s+/g, "-");
    out.fontFamily = ["nanum-gothic", "nanum-myeongjo", "noto-serif-kr", "pretendard"].includes(v) ? v : font;
  }
  return out;
}

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
const templateModal = document.getElementById("templateModal");

const helpTitle = document.getElementById("helpTitle");
const helpDesc = document.getElementById("helpDesc");
const helpStep = document.getElementById("helpStep");
const splitter = document.getElementById("splitter");

let settings = loadSettings();
let zoom = 1;
let helpIndex = 0;
let isApplyingHistory = false;
let historySnapshot = null;
let previewTimer = null;
let saveIndicatorTimer = null;
let searchMatches = [];
let searchIndex = -1;
const undoStack = [];
const redoStack = [];

const md = window.markdownit({
  html: true,
  linkify: true,
  typographer: true,
  breaks: settings.breaks,
  highlight(code, lang) {
    if (lang === "mermaid") {
      return `<div class="mermaid">${escapeHtml(code)}</div>`;
    }
    if (!settings.highlight) {
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
      .map((fn, i) =>
        `<li id="fn-${fn.id}"><p>${fn.text} <a href="#fnref-${fn.id}" class="footnote-backref">↩</a></p></li>`
      )
      .join("\n");
    html += `\n<hr class="footnotes-sep">\n<section class="footnotes">\n<ol>\n${footnotesHtml}\n</ol>\n</section>`;
  }
  return html;
}

function renderKatex(html) {
  if (typeof katex === "undefined") return html;
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

initialize();

function initialize() {
  if (!loadFromUrlParam()) {
    editor.value = loadMarkdown();
  }
  bindToolbar();
  bindSettings();
  bindPreset();
  bindModals();
  bindSplitter();
  bindAccordion();
  initEmojiAutocomplete();
  updateLineNumbers();
  updateStatus();
  updatePreview();
  updateThemeLabel();
  updateZoomLabel();
  historySnapshot = createSnapshot();
}

function bindAccordion() {
  const accordions = document.querySelectorAll(".settings-accordion");
  accordions.forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      accordions.forEach((other) => {
        if (other !== details) {
          other.open = false;
        }
      });
    });
  });
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
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleAction(button.dataset.action);
    });
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
    debouncedPreview();
    if (!isApplyingHistory) {
      historySnapshot = createSnapshot();
      redoStack.length = 0;
    }
  });

  editor.addEventListener("click", updateStatus);
  editor.addEventListener("keyup", updateStatus);
  editor.addEventListener("scroll", syncLineScroll);

  editor.addEventListener("keydown", handleEditorKeydown);
  editor.addEventListener("paste", handleEditorPaste);
  editor.addEventListener("dragover", (event) => { event.preventDefault(); });
  editor.addEventListener("drop", handleEditorDrop);
}

function handleEditorPaste(event) {
  const items = event.clipboardData && event.clipboardData.items;
  if (!items) return;
  for (let i = 0; i < items.length; i += 1) {
    if (items[i].type.startsWith("image/")) {
      event.preventDefault();
      const file = items[i].getAsFile();
      if (file) insertImageAsBase64(file);
      return;
    }
  }
}

function handleEditorDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer && event.dataTransfer.files;
  if (!files || !files.length) return;
  const file = files[0];
  if (file.type.startsWith("image/")) {
    insertImageAsBase64(file);
  } else if (file.name.endsWith(".md") || file.name.endsWith(".txt")) {
    file.text().then((text) => {
      editor.value = text;
      saveMarkdown(editor.value);
      updateLineNumbers();
      updateStatus();
      updatePreview();
    });
  }
}

function insertImageAsBase64(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const mdImage = `![${file.name}](${dataUrl})`;
    const start = editor.selectionStart;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(editor.selectionEnd);
    editor.value = `${before}${mdImage}${after}`;
    editor.selectionStart = start + mdImage.length;
    editor.selectionEnd = start + mdImage.length;
    editor.focus();
    saveMarkdown(editor.value);
    updateLineNumbers();
    updateStatus();
    updatePreview();
  };
  reader.readAsDataURL(file);
}

function handleEditorKeydown(event) {
  const ctrl = event.ctrlKey || event.metaKey;

  if (ctrl && !event.shiftKey) {
    switch (event.key.toLowerCase()) {
      case "b":
        event.preventDefault();
        handleInsert("bold");
        return;
      case "i":
        event.preventDefault();
        handleInsert("italic");
        return;
      case "s":
        event.preventDefault();
        downloadFile("document.md", editor.value);
        return;
      case "z":
        event.preventDefault();
        undo();
        return;
      case "y":
        event.preventDefault();
        redo();
        return;
    }
  }

  if (ctrl && event.shiftKey) {
    switch (event.key.toLowerCase()) {
      case "k":
        event.preventDefault();
        handleInsert("code-block");
        return;
      case "x":
        event.preventDefault();
        handleInsert("strike");
        return;
    }
  }

  if (event.key === "Tab") {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;

    if (start === end) {
      if (event.shiftKey) {
        const lineStart = text.lastIndexOf("\n", start - 1) + 1;
        if (text.startsWith("  ", lineStart)) {
          editor.value = text.slice(0, lineStart) + text.slice(lineStart + 2);
          editor.selectionStart = Math.max(lineStart, start - 2);
          editor.selectionEnd = editor.selectionStart;
        }
      } else {
        editor.value = text.slice(0, start) + "  " + text.slice(end);
        editor.selectionStart = start + 2;
        editor.selectionEnd = start + 2;
      }
    } else {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const selectedBlock = text.slice(lineStart, end);
      let result;
      if (event.shiftKey) {
        result = selectedBlock.replace(/^  /gm, "");
      } else {
        result = selectedBlock.replace(/^/gm, "  ");
      }
      editor.value = text.slice(0, lineStart) + result + text.slice(end);
      editor.selectionStart = lineStart;
      editor.selectionEnd = lineStart + result.length;
    }

    saveMarkdown(editor.value);
    updateLineNumbers();
    updateStatus();
    updatePreview();
  }
}

function bindSettings() {
  const marginIds = ["marginTop", "marginBottom", "marginLeft", "marginRight"];
  const marginKeys = ["top", "bottom", "left", "right"];
  const bindings = {
    fontFamily: "fontFamily",
    fontSize: "fontSize",
    lineHeight: "lineHeight",
    wordBreak: "wordBreak",
    textIndent: "textIndent",
    scale: "scale",
    tableStyle: "tableStyle",
    headingStyle: "headingStyle",
    pageBreakBeforeH1: "pageBreakBeforeH1",
    pageBreakBeforeH2: "pageBreakBeforeH2",
    pageBreakBeforeH3: "pageBreakBeforeH3",
    coverPage: "coverPage",
    tocPage: "tocPage",
    dividerPage: "dividerPage",
    headerEnabled: "headerEnabled",
    headerFontSize: "headerFontSize",
    headerLeft: "headerLeft",
    headerCenter: "headerCenter",
    headerRight: "headerRight",
    footerEnabled: "footerEnabled",
    footerFontSize: "footerFontSize",
    footerLeft: "footerLeft",
    footerCenter: "footerCenter",
    footerRight: "footerRight",
    breaks: "breaks",
    emoji: "emoji",
    highlight: "highlight",
    printBackground: "printBackground",
    hideHeaderFooterOnSpecialPages: "hideHeaderFooterOnSpecialPages",
  };

  function syncSettingsToForm() {
    const m = getMargin(settings);
    marginIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.value = m[marginKeys[i]];
    });
    Object.keys(bindings).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const key = bindings[id];
      if (el.type === "checkbox") el.checked = settings[key];
      else el.value = key === "scale" ? Number(settings[key]) : settings[key];
    });
  }
  window.refreshSettingsForm = syncSettingsToForm;

  marginIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const m = getMargin(settings);
    el.value = m[marginKeys[i]];
    if (!el.dataset.bound) {
      el.addEventListener("change", () => {
        if (!settings.margin) settings.margin = { ...DEFAULT_SETTINGS.margin };
        settings.margin[marginKeys[i]] = el.value;
        handleSettingsChange();
      });
      el.dataset.bound = "true";
    }
  });

  Object.keys(bindings).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const key = bindings[id];
    if (el.type === "checkbox") {
      el.checked = settings[key];
      if (!el.dataset.bound) {
        el.addEventListener("change", () => {
          settings[key] = el.checked;
          handleSettingsChange();
        });
        el.dataset.bound = "true";
      }
      return;
    }
    el.value = key === "scale" ? Number(settings[key]) : settings[key];
    if (!el.dataset.bound) {
      el.addEventListener("change", () => {
        if (el.type === "number") {
          settings[key] = Number(el.value);
        } else {
          settings[key] = el.value;
        }
        handleSettingsChange();
      });
      el.dataset.bound = "true";
    }
  });
  syncSettingsToForm();
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
      if (id === "templateModal") closeModal("template");
    });
  });
  document.addEventListener("keydown", (event) => {
    const ctrl = event.ctrlKey || event.metaKey;
    if (ctrl && event.key.toLowerCase() === "f") {
      event.preventDefault();
      openSearchBar(false);
      return;
    }
    if (ctrl && event.key.toLowerCase() === "h") {
      event.preventDefault();
      openSearchBar(true);
      return;
    }
    if (event.key === "Escape") {
      const searchBar = document.getElementById("searchBar");
      if (searchBar && !searchBar.hidden) {
        closeSearchBar();
        return;
      }
      closeModal("settings");
      closeModal("info");
      closeModal("preset");
      closeModal("help");
      closeModal("template");
    }
  });
}

function handleAction(action) {
  switch (action) {
    case "new":
      openModal("template");
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
    case "copy-html":
      copyHtmlToClipboard();
      break;
    case "undo":
      undo();
      break;
    case "redo":
      redo();
      break;
    case "share":
      shareDocument();
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
    case "search-next":
      searchNavigate(1);
      break;
    case "search-prev":
      searchNavigate(-1);
      break;
    case "search-close":
      closeSearchBar();
      break;
    case "replace-one":
      replaceOne();
      break;
    case "replace-all":
      replaceAll();
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
  const workspace = splitter.closest(".workspace");
  if (!workspace) return;
  const minW = 260;

  const savedWidth = localStorage.getItem("splitterWidth");
  const applySavedWidth = () => {
    const total = workspace.getBoundingClientRect().width;
    if (!savedWidth || total < minW * 2) {
      workspace.style.removeProperty("--editor-width");
      return;
    }
    const parsed = parseInt(savedWidth, 10);
    if (Number.isNaN(parsed)) {
      workspace.style.removeProperty("--editor-width");
      return;
    }
    const maxW = total - minW - 6;
    if (parsed > maxW || parsed < minW) {
      const clamped = `${Math.min(maxW, Math.max(minW, parsed))}px`;
      workspace.style.setProperty("--editor-width", clamped);
    } else {
      workspace.style.setProperty("--editor-width", `${parsed}px`);
    }
  };
  applySavedWidth();
  requestAnimationFrame(applySavedWidth);
  setTimeout(applySavedWidth, 100);

  splitter.addEventListener("mousedown", (event) => {
    isDragging = true;
    document.body.style.cursor = "col-resize";
    event.preventDefault();
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.cursor = "";
    const current = document.querySelector(".workspace").style.getPropertyValue("--editor-width");
    if (current) {
      localStorage.setItem("splitterWidth", current);
    }
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
  syncPreviewScroll();
}

function syncPreviewScroll() {
  try {
    const doc = previewFrame.contentDocument;
    if (!doc || !doc.documentElement) return;
    const editorMax = editor.scrollHeight - editor.clientHeight;
    if (editorMax <= 0) return;
    const ratio = editor.scrollTop / editorMax;
    const previewMax = doc.documentElement.scrollHeight - doc.documentElement.clientHeight;
    doc.documentElement.scrollTop = ratio * previewMax;
  } catch (error) {
    /* 크로스오리진 접근 방지 */
  }
}

function updateStatus() {
  const text = editor.value;
  const lines = text.split("\n").length || 1;
  const chars = text.length;
  const cursor = editor.selectionStart;
  const before = text.slice(0, cursor);
  const row = before.split("\n").length;
  const col = before.length - before.lastIndexOf("\n");
  const savedInfo = statusbar.dataset.saved || "";
  statusbar.textContent = `줄 ${row}, 열 ${col} · ${lines}줄 · ${chars}자 · Markdown${savedInfo ? ` · ${savedInfo}` : ""}`;
  syncHeadingDropdown();
}

function syncHeadingDropdown() {
  const headingSelect = document.getElementById("headingLevel");
  if (!headingSelect) return;
  const text = editor.value;
  const cursor = editor.selectionStart;
  const lineStart = text.lastIndexOf("\n", cursor - 1) + 1;
  const lineEnd = text.indexOf("\n", cursor);
  const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
  const match = line.match(/^(#{1,6})\s/);
  headingSelect.value = match ? match[1].length : 0;
}

function debouncedPreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 150);
}

function updatePreview() {
  md.set({ breaks: settings.breaks });
  const html = buildPreviewHtml();
  previewFrame.srcdoc = html;
  updateDocumentTitle();
}

function updateDocumentTitle() {
  const { frontmatter } = parseFrontmatter(editor.value);
  const title = frontmatter.title || "";
  document.title = title ? `${title} - 마크다운ㅎ글` : "마크다운ㅎ글 - 마크다운을 아래한글 형식으로";
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
    settings.hideHeaderFooterOnSpecialPages && (settings.coverPage || settings.tocPage || settings.dividerPage)
      ? "special-hide"
      : "";
  const headingClass = settings.headingStyle === "boxed" ? "boxed" : "basic";
  const margin = getMargin(settings);
  const isDark = !forExport && document.body.dataset.theme === "dark";
  const highlightTheme = isDark ? "tomorrow-night" : "tomorrow";
  const highlightCss = settings.highlight
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

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(frontmatter.title || "문서")}</title>
  ${fontsCss}
  ${highlightCss}
  ${katexCss}
  <style>${buildBaseStyles({ forExport })}</style>
</head>
<body class="${hideHeaderFooterClass}">
  ${settings.headerEnabled ? header : ""}
  ${cover}
  ${toc}
  ${divider}
  <main class="hwp-content ${headingClass}">${bodyHtml}</main>
  ${settings.footerEnabled ? footer : ""}
  ${mermaidScript}
</body>
</html>`;
}

function renderMarkdown(content) {
  const { frontmatter, body } = parseFrontmatter(content);
  const source = settings.emoji ? replaceEmojis(body) : body;
  const env = {};
  const tokens = md.parse(source, env);
  const headings = extractHeadings(tokens);
  let html = md.renderer.render(tokens, md.options, env);
  html = renderFootnotes(html);
  html = renderKatex(html);
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
  if (type === "page" || type === "pageNumber") return "1 / 1";
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
  const margin = getMargin(settings);
  const headingClass = settings.headingStyle === "boxed" ? "boxed" : "basic";
  const scale = forExport ? settings.scale : zoom;
  const breakStyles = [
    settings.pageBreakBeforeH1 ? "h1 { page-break-before: always; }" : "",
    settings.pageBreakBeforeH2 ? "h2 { page-break-before: always; }" : "",
    settings.pageBreakBeforeH3 ? "h3 { page-break-before: always; }" : "",
  ].join("\n");

  const fontMap = {
    "nanum-gothic": "'Nanum Gothic', sans-serif",
    "nanum-myeongjo": "'Nanum Myeongjo', serif",
    "noto-serif-kr": "'Noto Serif KR', serif",
    pretendard: "'Pretendard Variable', sans-serif",
  };
  const fontStack = fontMap[settings.fontFamily] || fontMap["nanum-gothic"];

  return `
    /* ===== @page 인쇄 규칙 ===== */
    @page {
      size: A4;
      margin: ${margin.top} ${margin.right} ${margin.bottom} ${margin.left};
    }

    @media print {
      body { margin: 0; }
      .hwp-header {
        position: running(hwpHeader);
      }
      .hwp-footer {
        position: running(hwpFooter);
      }
      .hwp-cover-page,
      .hwp-toc-page,
      .hwp-divider-page {
        page-break-after: always;
      }
      table { page-break-inside: avoid; }
      pre { page-break-inside: avoid; }
      blockquote { page-break-inside: avoid; }
      img { page-break-inside: avoid; }
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      a { color: #000 !important; text-decoration: none !important; }
      a[href]::after { content: none !important; }
    }

    /* ===== 기본 타이포그래피 ===== */
    :root {
      --hwp-font-family: ${fontStack};
      --hwp-font-size: ${settings.fontSize}pt;
      --hwp-line-height: ${settings.lineHeight};
      --hwp-word-break: ${settings.wordBreak};
      --hwp-indent: ${getTextIndent(settings)}px;
    }

    * { box-sizing: border-box; }

    body {
      font-family: var(--hwp-font-family);
      font-size: var(--hwp-font-size);
      line-height: var(--hwp-line-height);
      word-break: var(--hwp-word-break);
      margin: ${margin.top} ${margin.right} ${margin.bottom} ${margin.left};
      color: #000;
      background: #fff;
      text-align: justify;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    p {
      margin: 0.4em 0;
      text-indent: var(--hwp-indent);
      orphans: 3;
      widows: 3;
    }

    /* ===== 제목 ===== */
    h1, h2, h3, h4, h5, h6 {
      font-weight: bold;
      margin: 1.2em 0 0.5em;
      page-break-after: avoid;
      text-indent: 0;
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
    h5, h6 { font-size: 10pt; color: #333; }

    /* ===== HWP 관공서 스타일 표 ===== */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 9pt;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      page-break-inside: avoid;
    }

    table thead th {
      background: #f0f0f0;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      border-left: 1px solid #999;
      border-right: 1px solid #999;
      padding: 8px 10px;
      text-align: center;
      font-weight: bold;
      font-size: 9pt;
    }

    table thead th:first-child { border-left: none; }
    table thead th:last-child { border-right: none; }

    table tbody td {
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
      padding: 6px 10px;
      vertical-align: top;
    }

    table tbody td:first-child { border-left: none; }
    table tbody td:last-child { border-right: none; }

    table tbody tr:nth-child(even) {
      background: #fafafa;
    }

    table tbody tr:last-child td {
      border-bottom: none;
    }

    table caption {
      caption-side: top;
      text-align: left;
      font-size: 9pt;
      font-weight: bold;
      padding: 4px 0;
      color: #333;
    }

    /* ===== 인용문 ===== */
    blockquote {
      border-left: 3px solid #333;
      background: #f9f9f9;
      padding: 0.5em 1em;
      margin: 1em 0;
      color: #222;
      page-break-inside: avoid;
    }

    blockquote p { text-indent: 0; }

    /* ===== 코드 블록 ===== */
    pre {
      background: #f5f5f5;
      border: 1px solid #ddd;
      padding: 12px 16px;
      border-radius: 2px;
      overflow-x: auto;
      font-size: 9pt;
      white-space: pre-wrap;
      word-wrap: break-word;
      page-break-inside: avoid;
    }

    code {
      font-family: 'D2Coding', 'Nanum Gothic Coding', 'Consolas', 'Courier New', monospace;
    }

    :not(pre):not(.hljs) > code {
      background: #f0f0f0;
      padding: 0.15em 0.3em;
      border-radius: 2px;
      font-size: 0.9em;
      border: 1px solid #e0e0e0;
    }

    /* ===== 구분선 ===== */
    hr {
      border: none;
      border-top: 1px solid #000;
      margin: 1.5em 0;
    }

    /* ===== 링크 ===== */
    a {
      color: #0563c1;
      text-decoration: underline;
    }

    /* ===== 이미지 ===== */
    img {
      max-width: 100%;
      height: auto;
      page-break-inside: avoid;
    }

    /* ===== 목록 ===== */
    ul, ol {
      margin: 0.5em 0;
      padding-left: 2em;
    }

    li {
      margin: 0.2em 0;
    }

    li p { text-indent: 0; margin: 0.2em 0; }

    /* 체크리스트 */
    li.task-list-item {
      list-style: none;
      margin-left: -1.5em;
    }

    li.task-list-item input[type="checkbox"] {
      margin-right: 0.4em;
    }

    /* ===== 헤더/푸터 ===== */
    .hwp-header {
      font-size: ${settings.headerFontSize}px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #888;
      border-bottom: 1px solid #ccc;
      padding: 0.3em 0 0.5em;
      margin-bottom: 1em;
    }

    .hwp-footer {
      font-size: ${settings.footerFontSize}px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #888;
      border-top: 1px solid #ccc;
      padding: 0.5em 0 0.3em;
      margin-top: 1em;
    }

    /* ===== 표지 ===== */
    .hwp-cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      page-break-after: always;
      padding: 0 2em;
    }

    .hwp-cover-org {
      font-size: 14pt;
      color: #333;
      margin-bottom: 3em;
      letter-spacing: 0.15em;
    }
    .hwp-cover-title {
      font-size: 28pt;
      font-weight: bold;
      margin-bottom: 0.5em;
      border-bottom: 3px double #000;
      padding-bottom: 0.4em;
    }
    .hwp-cover-subtitle {
      font-size: 16pt;
      color: #555;
      margin-bottom: 3em;
    }
    .hwp-cover-meta {
      margin-top: auto;
      padding-bottom: 3em;
      text-align: center;
    }
    .hwp-cover-date {
      font-size: 12pt;
      margin-bottom: 0.5em;
    }
    .hwp-cover-author {
      font-size: 12pt;
      font-weight: bold;
    }

    /* ===== 목차 ===== */
    .hwp-toc-page {
      padding-top: 2em;
      page-break-after: always;
    }
    .hwp-toc-heading {
      font-size: 20pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 2em;
      letter-spacing: 0.3em;
    }
    .hwp-toc-item {
      display: flex;
      align-items: baseline;
      padding: 0.25em 0;
    }
    .hwp-toc-item a {
      color: #000;
      text-decoration: none;
    }
    .hwp-toc-item::after {
      content: "";
      flex: 1;
      border-bottom: 1px dotted #999;
      margin: 0 0.4em;
      position: relative;
      bottom: 0.25em;
    }
    .hwp-toc-level-1 { font-size: 11pt; font-weight: bold; }
    .hwp-toc-level-2 { font-size: 10pt; padding-left: 1.5em; }
    .hwp-toc-level-3 { font-size: 9pt; padding-left: 3em; color: #333; }

    /* ===== 간지 ===== */
    .hwp-divider-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      page-break-after: always;
    }
    .hwp-divider-title {
      font-size: 24pt;
      font-weight: bold;
      border-bottom: 2px solid #000;
      padding-bottom: 0.3em;
    }

    /* ===== 박스형 제목 스타일 ===== */
    .hwp-content.boxed h1,
    .hwp-content.boxed h2,
    .hwp-content.boxed h3 {
      border: none;
      padding: 8px 12px;
      background: #f4f4f4;
      border-left: 4px solid #333;
      border-radius: 0;
    }

    .hwp-content.boxed h1 { border-left-width: 6px; border-left-color: #000; }
    .hwp-content.boxed h2 { border-left-width: 4px; border-left-color: #333; }
    .hwp-content.boxed h3 { border-left-width: 3px; border-left-color: #666; background: #f8f8f8; }

    /* ===== 줌/스케일 ===== */
    .hwp-content {
      transform: scale(${scale});
      transform-origin: top left;
    }

    ${breakStyles}

    .special-hide .hwp-header,
    .special-hide .hwp-footer {
      display: none;
    }

    /* ===== 각주 ===== */
    .footnote-ref a {
      color: #0563c1;
      text-decoration: none;
      font-size: 0.8em;
    }
    .footnotes-sep {
      margin-top: 2em;
    }
    .footnotes {
      font-size: 9pt;
      color: #555;
    }
    .footnotes ol {
      padding-left: 1.5em;
    }
    .footnotes li {
      margin: 0.3em 0;
    }
    .footnote-backref {
      text-decoration: none;
      color: #0563c1;
    }
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

const EMOJI_MAP = {
  smile: "😄", grin: "😁", laugh: "😆", joy: "😂", rofl: "🤣",
  wink: "😉", blush: "😊", innocent: "😇", heart_eyes: "😍", kiss: "😘",
  thinking: "🤔", shush: "🤫", zipper: "🤐", raised_eyebrow: "🤨",
  neutral: "😐", expressionless: "😑", unamused: "😒", roll_eyes: "🙄",
  grimace: "😬", lying: "🤥", relieved: "😌", sleepy: "😪", sleeping: "😴",
  mask: "😷", nerd: "🤓", sunglasses: "😎", disguised: "🥸",
  confused: "😕", worried: "😟", frown: "🙁", sad: "😢", cry: "😭",
  angry: "😠", rage: "🤬", skull: "💀", poop: "💩",
  clown: "🤡", ghost: "👻", alien: "👽", robot: "🤖",
  heart: "❤️", orange_heart: "🧡", yellow_heart: "💛", green_heart: "💚",
  blue_heart: "💙", purple_heart: "💜", black_heart: "🖤", white_heart: "🤍",
  broken_heart: "💔", fire: "🔥", sparkles: "✨", star: "⭐", star2: "🌟",
  zap: "⚡", boom: "💥", wave: "👋", ok_hand: "👌",
  thumbsup: "👍", thumbsdown: "👎", fist: "✊", clap: "👏", pray: "🙏",
  muscle: "💪", eyes: "👀", brain: "🧠", tongue: "👅",
  check: "✅", x: "❌", warning: "⚠️", question: "❓", exclamation: "❗",
  bulb: "💡", memo: "📝", pencil: "✏️", pin: "📌", clip: "📎",
  book: "📖", folder: "📁", calendar: "📅", chart: "📊",
  rocket: "🚀", airplane: "✈️", car: "🚗", bike: "🚲",
  sun: "☀️", moon: "🌙", cloud: "☁️", rain: "🌧️", snow: "❄️", rainbow: "🌈",
  dog: "🐕", cat: "🐈", bug: "🐛", butterfly: "🦋",
  tree: "🌳", flower: "🌸", cherry_blossom: "🌸", rose: "🌹",
  apple: "🍎", coffee: "☕", pizza: "🍕", cake: "🎂", beer: "🍺",
  trophy: "🏆", medal: "🥇", crown: "👑", gem: "💎",
  music: "🎵", bell: "🔔", megaphone: "📢", lock: "🔒", key: "🔑",
  tada: "🎉", balloon: "🎈", gift: "🎁", party: "🥳",
  hundred: "💯", plus: "➕", minus: "➖", point_right: "👉", point_left: "👈",
  up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️",
  recycle: "♻️", globe: "🌍", peace: "☮️", yin_yang: "☯️",
};

function replaceEmojis(text) {
  return text.replace(/:([a-z0-9_]+):/g, (match, name) => EMOJI_MAP[name] || match);
}

function initEmojiAutocomplete() {
  let popup = null;
  let emojiStartPos = -1;

  editor.addEventListener("input", () => {
    const cursor = editor.selectionStart;
    const textBefore = editor.value.slice(0, cursor);
    const colonMatch = textBefore.match(/:([a-z0-9_]{1,20})$/);
    if (!colonMatch) {
      removeEmojiPopup();
      return;
    }
    const query = colonMatch[1];
    emojiStartPos = cursor - query.length - 1;
    const matches = Object.keys(EMOJI_MAP)
      .filter((k) => k.startsWith(query))
      .slice(0, 8);
    if (!matches.length) {
      removeEmojiPopup();
      return;
    }
    showEmojiPopup(matches, query);
  });

  function showEmojiPopup(matches, query) {
    removeEmojiPopup();
    popup = document.createElement("div");
    popup.className = "emoji-popup";
    popup.innerHTML = matches
      .map((name, i) =>
        `<div class="emoji-item${i === 0 ? " active" : ""}" data-emoji="${name}">${EMOJI_MAP[name]} :${name}:</div>`
      )
      .join("");
    const rect = editor.getBoundingClientRect();
    const lineHeight = 22.4;
    const textBefore = editor.value.slice(0, editor.selectionStart);
    const lines = textBefore.split("\n");
    const row = lines.length;
    popup.style.position = "fixed";
    popup.style.left = `${rect.left + 70}px`;
    popup.style.top = `${rect.top + (row * lineHeight) - editor.scrollTop + 4}px`;
    popup.style.zIndex = "200";
    document.body.appendChild(popup);
    popup.querySelectorAll(".emoji-item").forEach((item) => {
      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
        insertEmoji(item.dataset.emoji);
      });
    });
  }

  function removeEmojiPopup() {
    if (popup && popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
    popup = null;
  }

  function insertEmoji(name) {
    const emoji = EMOJI_MAP[name];
    if (!emoji) return;
    const cursor = editor.selectionStart;
    const before = editor.value.slice(0, emojiStartPos);
    const after = editor.value.slice(cursor);
    editor.value = `${before}${emoji}${after}`;
    editor.selectionStart = emojiStartPos + emoji.length;
    editor.selectionEnd = emojiStartPos + emoji.length;
    editor.focus();
    removeEmojiPopup();
    saveMarkdown(editor.value);
    updatePreview();
  }

  editor.addEventListener("keydown", (event) => {
    if (!popup) return;
    const items = popup.querySelectorAll(".emoji-item");
    const activeIndex = [...items].findIndex((el) => el.classList.contains("active"));
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[activeIndex]?.classList.remove("active");
      items[(activeIndex + 1) % items.length]?.classList.add("active");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[activeIndex]?.classList.remove("active");
      items[(activeIndex - 1 + items.length) % items.length]?.classList.add("active");
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const active = popup.querySelector(".emoji-item.active");
      if (active) insertEmoji(active.dataset.emoji);
    } else if (event.key === "Escape") {
      removeEmojiPopup();
    }
  });

  editor.addEventListener("blur", () => {
    setTimeout(removeEmojiPopup, 150);
  });
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
    template: templateModal,
  };
  if (!map[name]) return;
  map[name].hidden = false;
  if (name === "settings") {
    document.body.classList.add("settings-open");
    if (typeof window.refreshSettingsForm === "function") window.refreshSettingsForm();
  }
  if (name === "preset") {
    renderPresets();
  }
  if (name === "template") {
    renderTemplates();
  }
}

function closeModal(name) {
  const map = {
    settings: settingsModal,
    info: infoModal,
    preset: presetModal,
    help: helpModal,
    template: templateModal,
  };
  if (!map[name]) return;
  map[name].hidden = true;
  if (name === "settings") {
    document.body.classList.remove("settings-open");
  }
}

function openSearchBar(showReplace) {
  const bar = document.getElementById("searchBar");
  const replaceRow = document.getElementById("replaceRow");
  const input = document.getElementById("searchInput");
  bar.hidden = false;
  replaceRow.hidden = !showReplace;
  input.focus();
  input.select();
  input.addEventListener("input", performSearch);
}

function closeSearchBar() {
  const bar = document.getElementById("searchBar");
  bar.hidden = true;
  searchMatches = [];
  searchIndex = -1;
  document.getElementById("searchCount").textContent = "";
  document.getElementById("searchInput").value = "";
  document.getElementById("replaceInput").value = "";
  editor.focus();
}

function performSearch() {
  const query = document.getElementById("searchInput").value;
  const countEl = document.getElementById("searchCount");
  searchMatches = [];
  searchIndex = -1;
  if (!query) {
    countEl.textContent = "";
    return;
  }
  const text = editor.value;
  let idx = text.indexOf(query);
  while (idx !== -1) {
    searchMatches.push(idx);
    idx = text.indexOf(query, idx + 1);
  }
  if (searchMatches.length > 0) {
    searchIndex = 0;
    highlightSearchMatch(query);
  }
  countEl.textContent = searchMatches.length > 0
    ? `${searchIndex + 1}/${searchMatches.length}`
    : "0건";
}

function searchNavigate(direction) {
  if (!searchMatches.length) return;
  searchIndex = (searchIndex + direction + searchMatches.length) % searchMatches.length;
  const query = document.getElementById("searchInput").value;
  highlightSearchMatch(query);
  document.getElementById("searchCount").textContent = `${searchIndex + 1}/${searchMatches.length}`;
}

function highlightSearchMatch(query) {
  const pos = searchMatches[searchIndex];
  if (pos === undefined) return;
  editor.focus();
  editor.selectionStart = pos;
  editor.selectionEnd = pos + query.length;
  const linesBefore = editor.value.slice(0, pos).split("\n").length;
  const lineHeight = editor.scrollHeight / (editor.value.split("\n").length || 1);
  editor.scrollTop = Math.max(0, (linesBefore - 5) * lineHeight);
}

function replaceOne() {
  const query = document.getElementById("searchInput").value;
  const replacement = document.getElementById("replaceInput").value;
  if (!query || searchMatches.length === 0) return;
  pushHistorySnapshot();
  const pos = searchMatches[searchIndex];
  editor.value = editor.value.slice(0, pos) + replacement + editor.value.slice(pos + query.length);
  saveMarkdown(editor.value);
  updateLineNumbers();
  updateStatus();
  updatePreview();
  historySnapshot = createSnapshot();
  redoStack.length = 0;
  performSearch();
}

function replaceAll() {
  const query = document.getElementById("searchInput").value;
  const replacement = document.getElementById("replaceInput").value;
  if (!query) return;
  pushHistorySnapshot();
  editor.value = editor.value.split(query).join(replacement);
  saveMarkdown(editor.value);
  updateLineNumbers();
  updateStatus();
  updatePreview();
  historySnapshot = createSnapshot();
  redoStack.length = 0;
  performSearch();
}

const TEMPLATES = [
  {
    name: "빈 문서",
    icon: "📄",
    content: "",
  },
  {
    name: "기본 문서",
    icon: "📝",
    content: DEFAULT_MARKDOWN,
  },
  {
    name: "관공서 보고서",
    icon: "🏛️",
    content: `---
title: 업무 보고서
subtitle: 2026년 상반기 업무 추진 현황
author: 홍길동
date: ${formatDate(new Date())}
organization: OO부 OO과
---

# 1. 개요

## 1.1 목적
본 보고서는 2026년 상반기 업무 추진 현황을 보고하기 위해 작성되었습니다.

## 1.2 범위
- 기간: 2026.01 ~ 2026.06
- 대상: OO부 전체

# 2. 추진 현황

| 구분 | 계획 | 실적 | 달성률 |
|------|------|------|--------|
| 과제 A | 100 | 95 | 95% |
| 과제 B | 50 | 52 | 104% |
| 과제 C | 30 | 28 | 93% |

# 3. 향후 계획

1. 미달성 과제 보완 조치
2. 하반기 신규 과제 발굴
3. 협업 체계 강화

# 4. 건의 사항

> 원활한 업무 추진을 위해 인력 보강이 필요합니다.
`,
  },
  {
    name: "회의록",
    icon: "🗓️",
    content: `---
title: 회의록
date: ${formatDate(new Date())}
author: 작성자
organization: OO팀
---

# 회의록

## 회의 개요
- **일시**: ${formatDate(new Date())} 00:00
- **장소**: 회의실
- **참석자**: 홍길동, 김철수, 이영희
- **안건**: 프로젝트 진행 현황 점검

## 논의 내용

### 1. 전차 회의 결과 확인
- [ ] 과제 A 완료 여부 확인
- [x] 과제 B 진행 중

### 2. 금차 논의 사항
1. 일정 조정 필요
2. 예산 재검토

### 3. 의결 사항
| 번호 | 안건 | 결과 |
|------|------|------|
| 1 | 일정 연장 | 승인 |
| 2 | 예산 추가 | 보류 |

## 향후 일정
- 다음 회의: YYYY.MM.DD
- 담당자별 조치사항 완료 기한: YYYY.MM.DD
`,
  },
  {
    name: "제안서",
    icon: "💡",
    content: `---
title: 프로젝트 제안서
subtitle: OO 시스템 구축 제안
author: 제안사
date: ${formatDate(new Date())}
organization: OO 주식회사
---

# 1. 제안 배경

현재 OO 업무의 비효율성을 개선하기 위해 시스템 구축을 제안합니다.

## 1.1 현황 분석
- 수작업 처리로 인한 오류 발생
- 데이터 통합 관리 부재

# 2. 제안 내용

## 2.1 시스템 구성
\`\`\`mermaid
graph TD
  A[사용자] --> B[웹 인터페이스]
  B --> C[API 서버]
  C --> D[데이터베이스]
\`\`\`

## 2.2 주요 기능
1. **데이터 통합 관리**: 모든 데이터를 중앙에서 관리
2. **자동화 처리**: 반복 업무 자동화
3. **대시보드**: 실시간 현황 모니터링

# 3. 기대 효과

| 구분 | 현재 | 개선 후 | 효과 |
|------|------|---------|------|
| 처리 시간 | 2시간 | 10분 | 92% 단축 |
| 오류율 | 5% | 0.1% | 98% 감소 |

# 4. 추진 일정

- **1단계** (1~2개월): 요구사항 분석 및 설계
- **2단계** (3~4개월): 개발 및 테스트
- **3단계** (5개월): 시범 운영 및 안정화
`,
  },
];

function renderTemplates() {
  const container = document.getElementById("templateList");
  container.innerHTML = TEMPLATES
    .map((t, i) =>
      `<div class="template-item" data-template="${i}">
        <span class="template-icon">${t.icon}</span>
        <span class="template-name">${t.name}</span>
      </div>`
    )
    .join("");
  container.querySelectorAll(".template-item").forEach((item) => {
    item.addEventListener("click", () => {
      const tmpl = TEMPLATES[Number(item.dataset.template)];
      editor.value = tmpl.content;
      saveMarkdown(editor.value);
      updateLineNumbers();
      updateStatus();
      updatePreview();
      closeModal("template");
    });
  });
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

function shareDocument() {
  try {
    const encoded = btoa(unescape(encodeURIComponent(editor.value)));
    const url = `${location.origin}${location.pathname}?doc=${encoded}`;
    if (url.length > 32000) {
      alert("문서가 너무 커서 URL로 공유할 수 없습니다. (최대 약 24KB)");
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector('[data-action="share"]');
      const original = btn.textContent;
      btn.textContent = "복사됨!";
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  } catch (error) {
    alert("공유 URL을 생성할 수 없습니다.");
  }
}

function loadFromUrlParam() {
  const params = new URLSearchParams(location.search);
  const doc = params.get("doc");
  if (!doc) return false;
  try {
    const decoded = decodeURIComponent(escape(atob(doc)));
    editor.value = decoded;
    saveMarkdown(editor.value);
    history.replaceState(null, "", location.pathname);
    return true;
  } catch (error) {
    return false;
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
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "PDF 인쇄");
  iframe.style.cssText =
    "position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  iframe.onload = function () {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.warn("PDF 인쇄:", err);
      alert("인쇄 대화상자를 열 수 없습니다: " + (err.message || err));
    }
    setTimeout(function () {
      URL.revokeObjectURL(url);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 2000);
  };

  iframe.src = url;
}

async function copyHtmlToClipboard() {
  try {
    const html = buildExportHtml();
    const blob = new Blob([html], { type: "text/html" });
    const plainBlob = new Blob([editor.value], { type: "text/plain" });
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": blob,
        "text/plain": plainBlob,
      }),
    ]);
    const btn = document.querySelector('[data-action="copy-html"]');
    const original = btn.textContent;
    btn.textContent = "복사됨!";
    setTimeout(() => { btn.textContent = original; }, 1500);
  } catch (error) {
    const fallback = buildExportHtml();
    const textarea = document.createElement("textarea");
    textarea.value = fallback;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("HTML이 클립보드에 복사되었습니다. (텍스트 형식)");
  }
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
  showSaveIndicator();
}

function showSaveIndicator() {
  clearTimeout(saveIndicatorTimer);
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  statusbar.dataset.saved = `저장됨 ${timeStr}`;
  updateStatus();
  saveIndicatorTimer = setTimeout(() => {
    statusbar.dataset.saved = "";
    updateStatus();
  }, 3000);
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
    const parsed = JSON.parse(raw);
    const out = { ...DEFAULT_SETTINGS, ...parsed };
    if (!out.margin || typeof out.margin !== "object") {
      out.margin = {
        top: parsed.marginTop ?? out.marginTop ?? "15mm",
        right: parsed.marginRight ?? out.marginRight ?? "20mm",
        bottom: parsed.marginBottom ?? out.marginBottom ?? "15mm",
        left: parsed.marginLeft ?? out.marginLeft ?? "20mm",
      };
    }
    if (parsed.convertBreaks !== undefined) out.breaks = parsed.convertBreaks;
    if (parsed.enableEmoji !== undefined) out.emoji = parsed.enableEmoji;
    if (parsed.enableHighlight !== undefined) out.highlight = parsed.enableHighlight;
    if (parsed.pdfScale !== undefined) out.scale = parsed.pdfScale;
    if (parsed.indent !== undefined) out.textIndent = String(parsed.indent);
    if (parsed.headerSize !== undefined) out.headerFontSize = parsed.headerSize;
    if (parsed.footerSize !== undefined) out.footerFontSize = parsed.footerSize;
    if (parsed.breakH1 !== undefined) out.pageBreakBeforeH1 = parsed.breakH1;
    if (parsed.breakH2 !== undefined) out.pageBreakBeforeH2 = parsed.breakH2;
    if (parsed.breakH3 !== undefined) out.pageBreakBeforeH3 = parsed.breakH3;
    if (parsed.hideOnSpecial !== undefined) out.hideHeaderFooterOnSpecialPages = parsed.hideOnSpecial;
    if (parsed.footerCenter === "page") out.footerCenter = "pageNumber";
    if (parsed.headingStyle === "basic") out.headingStyle = "default";
    return out;
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
  const normalized = normalizeImportedPresetSettings(preset.settings);
  settings = { ...settings, ...normalized };
  saveSettings(settings);
  if (typeof window.refreshSettingsForm === "function") window.refreshSettingsForm();
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
      const data = JSON.parse(text);
      const rawList = Array.isArray(data) ? data : [data];
      const list = rawList.map((item) => {
        const name = item && item.name != null ? String(item.name) : "가져온 프리셋";
        const settings = normalizeImportedPresetSettings(item && item.settings);
        return { name, settings };
      });
      if (list.length === 0) {
        alert("유효한 프리셋이 없습니다.");
        return;
      }
      localStorage.setItem("presets", JSON.stringify(list));
      renderPresets();
      alert(`${list.length}개 프리셋을 가져왔습니다.`);
    } catch (error) {
      alert("프리셋 파일을 읽을 수 없습니다.\n" + (error.message || ""));
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
