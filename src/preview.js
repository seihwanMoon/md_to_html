import { state } from "./state.js";
import { buildDocumentHtml, parseFrontmatter } from "./render.js";

function getEditor() {
  return document.getElementById("editor");
}
function getPreviewFrame() {
  return document.getElementById("previewFrame");
}

export function updatePreview() {
  const editor = getEditor();
  const previewFrame = getPreviewFrame();
  if (!editor || !previewFrame) return;
  const html = buildDocumentHtml(editor.value, { forExport: false });
  previewFrame.srcdoc = html;
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
