import { state } from "./state.js";
import { saveMarkdown } from "./state.js";
import { EMOJI_MAP } from "./constants.js";
import { downloadFile } from "./utils.js";
import { buildDocumentHtml } from "./render.js";
import * as preview from "./preview.js";

function getEditor() {
  return document.getElementById("editor");
}
function getStatusbar() {
  return document.getElementById("statusbar");
}

export function updateLineNumbers() {
  const editor = getEditor();
  const lineNumbers = document.getElementById("lineNumbers");
  if (!editor || !lineNumbers) return;
  const lines = editor.value.split("\n").length || 1;
  lineNumbers.innerHTML = Array.from({ length: lines })
    .map((_, i) => `<div>${i + 1}</div>`)
    .join("");
}

export function syncLineScroll() {
  const editor = getEditor();
  const lineNumbers = document.getElementById("lineNumbers");
  if (lineNumbers) lineNumbers.scrollTop = editor?.scrollTop ?? 0;
  preview.syncPreviewScroll();
}

export function syncHeadingDropdown() {
  const editor = getEditor();
  const headingSelect = document.getElementById("headingLevel");
  if (!headingSelect || !editor) return;
  const text = editor.value;
  const cursor = editor.selectionStart;
  const lineStart = text.lastIndexOf("\n", cursor - 1) + 1;
  const lineEnd = text.indexOf("\n", cursor);
  const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
  const match = line.match(/^(#{1,6})\s/);
  headingSelect.value = match ? match[1].length : 0;
}

export function updateStatus() {
  const editor = getEditor();
  const statusbar = getStatusbar();
  if (!editor || !statusbar) return;
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

export function showSaveIndicator() {
  clearTimeout(state.saveIndicatorTimer);
  const statusbar = getStatusbar();
  if (!statusbar) return;
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  statusbar.dataset.saved = `저장됨 ${timeStr}`;
  updateStatus();
  state.saveIndicatorTimer = setTimeout(() => {
    statusbar.dataset.saved = "";
    updateStatus();
  }, 3000);
}

export function createSnapshot() {
  const editor = getEditor();
  if (!editor) return null;
  return {
    value: editor.value,
    start: editor.selectionStart,
    end: editor.selectionEnd,
  };
}

export function pushHistorySnapshot() {
  if (!state.historySnapshot) {
    state.historySnapshot = createSnapshot();
    return;
  }
  const editor = getEditor();
  if (!editor || state.historySnapshot.value === editor.value) return;
  state.undoStack.push(state.historySnapshot);
  if (state.undoStack.length > 200) state.undoStack.shift();
}

function applySnapshot(snapshot) {
  const editor = getEditor();
  if (!editor || !snapshot) return;
  state.isApplyingHistory = true;
  editor.value = snapshot.value;
  editor.selectionStart = snapshot.start;
  editor.selectionEnd = snapshot.end;
  saveMarkdown(editor.value);
  updateLineNumbers();
  updateStatus();
  preview.updatePreview();
  state.historySnapshot = createSnapshot();
  state.isApplyingHistory = false;
}

export function undo() {
  if (!state.undoStack.length) return;
  const current = createSnapshot();
  const prev = state.undoStack.pop();
  state.redoStack.push(current);
  applySnapshot(prev);
}

export function redo() {
  if (!state.redoStack.length) return;
  const current = createSnapshot();
  const next = state.redoStack.pop();
  state.undoStack.push(current);
  applySnapshot(next);
}

export function insertAtCursor(openText, closeText) {
  const editor = getEditor();
  if (!editor) return;
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
  showSaveIndicator();
  updateLineNumbers();
  updateStatus();
  preview.updatePreview();
  state.historySnapshot = createSnapshot();
  state.redoStack.length = 0;
}

export function handleInsert(type) {
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
    pagebreak: { open: "\n\n\\newpage\n\n", close: "" },
    link: { open: "[링크 텍스트](", close: ")" },
    image: { open: "![이미지 설명](", close: ")" },
    "code-block": { open: "\n```javascript\n", close: "\n```\n" },
    table: { open: "\n| 항목 | 설명 |\n|------|------|\n| 내용 | 내용 |\n", close: "" },
  };
  const config = insertionMap[type];
  if (!config) return;
  insertAtCursor(config.open, config.close);
}

export function setHeadingLevel(level) {
  const editor = getEditor();
  if (!editor) return;
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
  showSaveIndicator();
  updateLineNumbers();
  updateStatus();
  preview.updatePreview();
  state.historySnapshot = createSnapshot();
  state.redoStack.length = 0;
}

function handleEditorKeydown(event) {
  const editor = getEditor();
  if (!editor) return;
  const ctrl = event.ctrlKey || event.metaKey;

  if (ctrl && !event.shiftKey) {
    switch (event.key.toLowerCase()) {
      case "b": event.preventDefault(); handleInsert("bold"); return;
      case "i": event.preventDefault(); handleInsert("italic"); return;
      case "s": event.preventDefault(); downloadFile("document.md", editor.value); return;
      case "z": event.preventDefault(); undo(); return;
      case "y": event.preventDefault(); redo(); return;
    }
  }
  if (ctrl && event.shiftKey) {
    switch (event.key.toLowerCase()) {
      case "k": event.preventDefault(); handleInsert("code-block"); return;
      case "x": event.preventDefault(); handleInsert("strike"); return;
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
      const result = event.shiftKey ? selectedBlock.replace(/^  /gm, "") : selectedBlock.replace(/^/gm, "  ");
      editor.value = text.slice(0, lineStart) + result + text.slice(end);
      editor.selectionStart = lineStart;
      editor.selectionEnd = lineStart + result.length;
    }
    saveMarkdown(editor.value);
    showSaveIndicator();
    updateLineNumbers();
    updateStatus();
    preview.updatePreview();
  }
}

function handleEditorPaste(event) {
  const items = event.clipboardData?.items;
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

export function insertImageAsBase64(file) {
  const editor = getEditor();
  if (!editor) return;
  const reader = new FileReader();
  reader.onload = () => {
    const mdImage = `![${file.name}](${reader.result})`;
    const start = editor.selectionStart;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(editor.selectionEnd);
    editor.value = `${before}${mdImage}${after}`;
    editor.selectionStart = start + mdImage.length;
    editor.selectionEnd = start + mdImage.length;
    editor.focus();
    saveMarkdown(editor.value);
    showSaveIndicator();
    updateLineNumbers();
    updateStatus();
    preview.updatePreview();
  };
  reader.readAsDataURL(file);
}

function handleEditorDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (!files?.length) return;
  const editor = getEditor();
  if (!editor) return;
  const file = files[0];
  if (file.type.startsWith("image/")) {
    insertImageAsBase64(file);
  } else if (file.name.endsWith(".md") || file.name.endsWith(".txt")) {
    file.text().then((text) => {
      editor.value = text;
      saveMarkdown(editor.value);
      showSaveIndicator();
      updateLineNumbers();
      updateStatus();
      preview.updatePreview();
    });
  }
}

export function initEmojiAutocomplete() {
  const editor = getEditor();
  if (!editor) return;
  let popup = null;
  let emojiStartPos = -1;

  function removeEmojiPopup() {
    if (popup?.parentNode) popup.parentNode.removeChild(popup);
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
    showSaveIndicator();
    preview.updatePreview();
  }

  editor.addEventListener("input", () => {
    const cursor = editor.selectionStart;
    const textBefore = editor.value.slice(0, cursor);
    const colonMatch = textBefore.match(/:([a-z0-9_]{1,20})$/);
    if (!colonMatch) { removeEmojiPopup(); return; }
    emojiStartPos = cursor - colonMatch[1].length - 1;
    const matches = Object.keys(EMOJI_MAP).filter((k) => k.startsWith(colonMatch[1])).slice(0, 8);
    if (!matches.length) { removeEmojiPopup(); return; }
    removeEmojiPopup();
    popup = document.createElement("div");
    popup.className = "emoji-popup";
    popup.innerHTML = matches.map((name, i) => `<div class="emoji-item${i === 0 ? " active" : ""}" data-emoji="${name}">${EMOJI_MAP[name]} :${name}:</div>`).join("");
    const rect = editor.getBoundingClientRect();
    const lineHeight = 22.4;
    const lines = textBefore.split("\n").length;
    popup.style.cssText = `position:fixed;left:${rect.left + 70}px;top:${rect.top + lines * lineHeight - editor.scrollTop + 4}px;z-index:200;`;
    document.body.appendChild(popup);
    popup.querySelectorAll(".emoji-item").forEach((item) => {
      item.addEventListener("mousedown", (e) => { e.preventDefault(); insertEmoji(item.dataset.emoji); });
    });
  });

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
    } else if (event.key === "Escape") removeEmojiPopup();
  });

  editor.addEventListener("blur", () => setTimeout(removeEmojiPopup, 150));
}

// --- Search / Replace ---
export function openSearchBar(showReplace) {
  const bar = document.getElementById("searchBar");
  const replaceRow = document.getElementById("replaceRow");
  const input = document.getElementById("searchInput");
  if (!bar || !input) return;
  bar.hidden = false;
  if (replaceRow) replaceRow.hidden = !showReplace;
  input.focus();
  input.select();
  input.addEventListener("input", performSearch);
}

export function closeSearchBar() {
  const bar = document.getElementById("searchBar");
  const searchInput = document.getElementById("searchInput");
  const replaceInput = document.getElementById("replaceInput");
  const countEl = document.getElementById("searchCount");
  if (bar) bar.hidden = true;
  state.searchMatches = [];
  state.searchIndex = -1;
  if (countEl) countEl.textContent = "";
  if (searchInput) searchInput.value = "";
  if (replaceInput) replaceInput.value = "";
  getEditor()?.focus();
}

function performSearch() {
  const query = document.getElementById("searchInput")?.value ?? "";
  const countEl = document.getElementById("searchCount");
  state.searchMatches = [];
  state.searchIndex = -1;
  if (!query) { if (countEl) countEl.textContent = ""; return; }
  const text = getEditor()?.value ?? "";
  let idx = text.indexOf(query);
  while (idx !== -1) {
    state.searchMatches.push(idx);
    idx = text.indexOf(query, idx + 1);
  }
  if (state.searchMatches.length > 0) {
    state.searchIndex = 0;
    highlightSearchMatch(query);
  }
  if (countEl) countEl.textContent = state.searchMatches.length > 0 ? `${state.searchIndex + 1}/${state.searchMatches.length}` : "0건";
}

export function searchNavigate(direction) {
  if (!state.searchMatches.length) return;
  state.searchIndex = (state.searchIndex + direction + state.searchMatches.length) % state.searchMatches.length;
  const query = document.getElementById("searchInput")?.value ?? "";
  highlightSearchMatch(query);
  const countEl = document.getElementById("searchCount");
  if (countEl) countEl.textContent = `${state.searchIndex + 1}/${state.searchMatches.length}`;
}

function highlightSearchMatch(query) {
  const pos = state.searchMatches[state.searchIndex];
  const editor = getEditor();
  if (pos === undefined || !editor) return;
  editor.focus();
  editor.selectionStart = pos;
  editor.selectionEnd = pos + query.length;
  const linesBefore = editor.value.slice(0, pos).split("\n").length;
  const lineHeight = editor.scrollHeight / (editor.value.split("\n").length || 1);
  editor.scrollTop = Math.max(0, (linesBefore - 5) * lineHeight);
}

export function replaceOne() {
  const query = document.getElementById("searchInput")?.value ?? "";
  const replacement = document.getElementById("replaceInput")?.value ?? "";
  const editor = getEditor();
  if (!query || !state.searchMatches.length || !editor) return;
  pushHistorySnapshot();
  const pos = state.searchMatches[state.searchIndex];
  editor.value = editor.value.slice(0, pos) + replacement + editor.value.slice(pos + query.length);
  saveMarkdown(editor.value);
  showSaveIndicator();
  updateLineNumbers();
  updateStatus();
  preview.updatePreview();
  state.historySnapshot = createSnapshot();
  state.redoStack.length = 0;
  performSearch();
}

export function replaceAll() {
  const query = document.getElementById("searchInput")?.value ?? "";
  const replacement = document.getElementById("replaceInput")?.value ?? "";
  const editor = getEditor();
  if (!query || !editor) return;
  pushHistorySnapshot();
  editor.value = editor.value.split(query).join(replacement);
  saveMarkdown(editor.value);
  showSaveIndicator();
  updateLineNumbers();
  updateStatus();
  preview.updatePreview();
  state.historySnapshot = createSnapshot();
  state.redoStack.length = 0;
  performSearch();
}

export function bindToolbar() {
  const editor = getEditor();
  if (!editor) return;

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".workspace")?.setAttribute("data-view", button.dataset.view);
      document.querySelectorAll("[data-view]").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
    });
  });

  document.querySelectorAll("[data-insert]").forEach((button) => {
    button.addEventListener("click", () => handleInsert(button.dataset.insert));
  });

  const headingSelect = document.getElementById("headingLevel");
  if (headingSelect) {
    headingSelect.addEventListener("change", () => setHeadingLevel(Number(headingSelect.value)));
  }

  editor.addEventListener("input", () => {
    if (!state.isApplyingHistory) pushHistorySnapshot();
    saveMarkdown(editor.value);
    showSaveIndicator();
    updateLineNumbers();
    updateStatus();
    preview.debouncedPreview();
    if (!state.isApplyingHistory) {
      state.historySnapshot = createSnapshot();
      state.redoStack.length = 0;
    }
  });

  editor.addEventListener("click", updateStatus);
  editor.addEventListener("keyup", updateStatus);
  editor.addEventListener("scroll", syncLineScroll);
  editor.addEventListener("keydown", handleEditorKeydown);
  editor.addEventListener("paste", handleEditorPaste);
  editor.addEventListener("dragover", (e) => e.preventDefault());
  editor.addEventListener("drop", handleEditorDrop);
}
