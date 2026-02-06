import { buildDocumentHtml } from "./render.js";
import { downloadFile } from "./utils.js";

function getEditor() {
  return document.getElementById("editor");
}

export function buildExportHtml() {
  const editor = getEditor();
  return editor ? buildDocumentHtml(editor.value, { forExport: true }) : "";
}

export function openPrintWindow() {
  const html = buildExportHtml();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "PDF 인쇄");
  iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:0;visibility:hidden;";
  document.body.appendChild(iframe);
  iframe.onload = function () {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.warn("PDF 인쇄:", err);
      alert("인쇄 대화상자를 열 수 없습니다: " + (err.message || err));
    }
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 2000);
  };
  iframe.src = url;
}

export async function copyHtmlToClipboard() {
  const editor = getEditor();
  if (!editor) return;
  try {
    const html = buildExportHtml();
    const blob = new Blob([html], { type: "text/html" });
    const plainBlob = new Blob([editor.value], { type: "text/plain" });
    await navigator.clipboard.write([
      new ClipboardItem({ "text/html": blob, "text/plain": plainBlob }),
    ]);
    const btn = document.querySelector('[data-action="copy-html"]');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = "복사됨!";
      setTimeout(() => { btn.textContent = original; }, 1500);
    }
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = buildExportHtml();
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("HTML이 클립보드에 복사되었습니다. (텍스트 형식)");
  }
}

export { downloadFile };
