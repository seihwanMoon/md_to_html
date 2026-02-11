import { state } from "./state.js";
import { buildDocumentHtml, parseFrontmatter } from "./render.js";
import * as editor from "./editor.js";

function getEditor() {
  return document.getElementById("editor");
}
function getPreviewFrame() {
  return document.getElementById("previewFrame");
}

/**
 * 미리보기에서 # 링크 클릭 시 에디터로 스크롤 이동 (1.3)
 * - 헤딩/목차 링크: 해당 헤딩 라인으로 이동
 * - 각주 링크: 해당 각주 정의로 이동
 */
function bindPreviewClickToEditor() {
  const previewFrame = getPreviewFrame();
  const editorEl = getEditor();
  if (!previewFrame || !editorEl) return;
  const doc = previewFrame.contentDocument;
  if (!doc) return;
  doc.addEventListener("click", (e) => {
    const anchor = e.target.closest("a[href^='#']");
    if (!anchor) return;
    const href = anchor.getAttribute("href") || "";
    const id = href.slice(1);
    if (!id) return;
    e.preventDefault();
    const targetEl = doc.getElementById(id);
    let searchText = "";
    if (targetEl) {
      searchText = (targetEl.textContent || "").trim();
    }
    if (!searchText && id.startsWith("fn-")) {
      const fnId = id.replace(/^fn-/, "");
      searchText = `[^${fnId}]:`;
    }
    const text = editorEl.value;
    let foundPos = -1;
    if (searchText) {
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line.match(/^#{1,6}\s/) && line.includes(searchText)) {
          foundPos = text.split("\n").slice(0, i).join("\n").length;
          break;
        }
        if (searchText.startsWith("[^") && line.startsWith(searchText)) {
          foundPos = text.split("\n").slice(0, i).join("\n").length;
          break;
        }
      }
      if (foundPos === -1) {
        const idx = text.indexOf(searchText);
        if (idx !== -1) foundPos = idx;
      }
    }
    if (foundPos >= 0) {
      editorEl.focus();
      editorEl.selectionStart = foundPos;
      editorEl.selectionEnd = foundPos;
      const linesBefore = text.slice(0, foundPos).split("\n").length;
      const lineHeight = 22;
      editorEl.scrollTop = Math.max(0, (linesBefore - 3) * lineHeight);
      editor.updateStatus();
    }
  });
}

export function updatePreview() {
  const editor = getEditor();
  const previewFrame = getPreviewFrame();
  if (!editor || !previewFrame) return;
  const html = buildDocumentHtml(editor.value, { forExport: false });
  previewFrame.srcdoc = html;
  previewFrame.onload = () => bindPreviewClickToEditor();
  updateDocumentTitle();
}

export function updateDocumentTitle() {
  const editor = getEditor();
  if (!editor) return;
  const { frontmatter } = parseFrontmatter(editor.value);
  const title = frontmatter.title || "";
  document.title = title ? `${title} - 마크다운ㅎ글` : "마크다운ㅎ글 - 마크다운을 아래한글 형식으로";
}

export function syncPreviewScroll() {
  const editor = getEditor();
  const previewFrame = getPreviewFrame();
  if (!editor || !previewFrame) return;
  try {
    const doc = previewFrame.contentDocument;
    if (!doc || !doc.documentElement) return;
    const editorMax = editor.scrollHeight - editor.clientHeight;
    if (editorMax <= 0) return;
    const ratio = editor.scrollTop / editorMax;
    const previewMax = doc.documentElement.scrollHeight - doc.documentElement.clientHeight;
    doc.documentElement.scrollTop = ratio * previewMax;
  } catch (err) {}
}

export function setZoom(nextZoom) {
  state.zoom = Math.min(2, Math.max(0.6, Number(nextZoom.toFixed(2))));
  updateZoomLabel();
  updatePreview();
}

export function updateZoomLabel() {
  const zoomLabel = document.getElementById("zoomLabel");
  if (zoomLabel) zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
}

let previewTimer = null;
export function debouncedPreview() {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 150);
}
