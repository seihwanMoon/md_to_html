import { state } from "./state.js";
import { loadMarkdown, saveMarkdown } from "./state.js";
import { getTemplates } from "./constants.js";
import { formatDate } from "./utils.js";
import { HELP_STEPS } from "./constants.js";
import * as editor from "./editor.js";
import * as preview from "./preview.js";
import { bindSettings } from "./settings.js";
import * as presets from "./presets.js";
import { downloadFile, openPrintWindow, copyHtmlToClipboard, buildExportHtml } from "./export.js";
import { exportDocx } from "./export-docx.js";
import * as presentation from "./presentation.js";
import { copyHwpHtmlToClipboard } from "./export-hwp-html.js";

const settingsModal = document.getElementById("settingsModal");
const infoModal = document.getElementById("infoModal");
const presetModal = document.getElementById("presetModal");
const helpModal = document.getElementById("helpModal");
const templateModal = document.getElementById("templateModal");
const helpTitle = document.getElementById("helpTitle");
const helpDesc = document.getElementById("helpDesc");
const helpStep = document.getElementById("helpStep");
const splitter = document.getElementById("splitter");

function openModal(name) {
  const map = {
    settings: settingsModal,
    info: infoModal,
    preset: presetModal,
    help: helpModal,
    template: templateModal,
  };
  const el = map[name];
  if (!el) return;
  el.hidden = false;
  if (name === "settings") {
    document.body.classList.add("settings-open");
    if (typeof window.refreshSettingsForm === "function") window.refreshSettingsForm();
  }
  if (name === "preset") presets.renderPresets();
  if (name === "template") renderTemplates();
}

function closeModal(name) {
  const map = {
    settings: settingsModal,
    info: infoModal,
    preset: presetModal,
    help: helpModal,
    template: templateModal,
  };
  const el = map[name];
  if (!el) return;
  el.hidden = true;
  if (name === "settings") document.body.classList.remove("settings-open");
}

function setView(view) {
  document.querySelector(".workspace")?.setAttribute("data-view", view);
}

function loadFromUrlParam() {
  const params = new URLSearchParams(location.search);
  const doc = params.get("doc");
  if (!doc) return false;
  const editorEl = document.getElementById("editor");
  if (!editorEl) return false;
  try {
    const decoded = decodeURIComponent(escape(atob(doc)));
    editorEl.value = decoded;
    saveMarkdown(decoded);
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
  if (button) button.textContent = document.body.dataset.theme === "light" ? "라이트" : "다크";
}

function renderTemplates() {
  const container = document.getElementById("templateList");
  const editorEl = document.getElementById("editor");
  if (!container || !editorEl) return;
  const TEMPLATES = getTemplates(formatDate);
  container.innerHTML = TEMPLATES.map(
    (t, i) =>
      `<div class="template-item" data-template="${i}">
        <span class="template-icon">${t.icon}</span>
        <span class="template-name">${t.name}</span>
      </div>`
  ).join("");
  container.querySelectorAll(".template-item").forEach((item) => {
    item.addEventListener("click", () => {
      const tmpl = TEMPLATES[Number(item.dataset.template)];
      editorEl.value = tmpl.content;
      saveMarkdown(editorEl.value);
      editor.showSaveIndicator();
      editor.updateLineNumbers();
      editor.updateStatus();
      preview.updatePreview();
      closeModal("template");
    });
  });
}

function openHelp(index) {
  state.helpIndex = index;
  const step = HELP_STEPS[index];
  if (helpTitle) helpTitle.textContent = step.title;
  if (helpDesc) helpDesc.textContent = step.desc;
  if (helpStep) helpStep.textContent = `${index + 1}/${HELP_STEPS.length}`;
  openModal("help");
  const nextBtn = document.querySelector('[data-action="help-next"]');
  if (nextBtn) {
    if (index === HELP_STEPS.length - 1) {
      nextBtn.textContent = "완료";
      nextBtn.dataset.action = "help-skip";
    } else {
      nextBtn.textContent = "다음";
      nextBtn.dataset.action = "help-next";
    }
  }
}

function shareDocument() {
  const editorEl = document.getElementById("editor");
  if (!editorEl) return;
  try {
    const encoded = btoa(unescape(encodeURIComponent(editorEl.value)));
    const url = `${location.origin}${location.pathname}?doc=${encoded}`;
    if (url.length > 32000) {
      alert("문서가 너무 커서 URL로 공유할 수 없습니다. (최대 약 24KB)");
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector('[data-action="share"]');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "복사됨!";
        setTimeout(() => { btn.textContent = original; }, 1500);
      }
    });
  } catch (error) {
    alert("공유 URL을 생성할 수 없습니다.");
  }
}

function handleAction(action) {
  switch (action) {
    case "new": openModal("template"); break;
    case "folder": handleFolderAction(); break;
    case "load": document.getElementById("fileInput")?.click(); break;
    case "save": downloadFile("document.md", document.getElementById("editor")?.value ?? ""); break;
    case "export-html": downloadFile("document.html", buildExportHtml()); break;
    case "export-pdf": openPrintWindow(); break;
    case "export-docx": exportDocx(); break;
    case "copy-html": copyHtmlToClipboard(); break;
    case "copy-hwp-html": copyHwpHtmlToClipboard(); break;
    case "undo": editor.undo(); break;
    case "redo": editor.redo(); break;
    case "share": shareDocument(); break;
    case "toggle-theme": toggleTheme(); break;
    case "help": openHelp(0); break;
    case "preset": openModal("preset"); break;
    case "settings": openModal("settings"); break;
    case "info": openModal("info"); break;
    case "zoom-in": preview.setZoom(state.zoom + 0.1); break;
    case "zoom-out": preview.setZoom(state.zoom - 0.1); break;
    case "help-next": openHelp(Math.min(HELP_STEPS.length - 1, state.helpIndex + 1)); break;
    case "help-prev": openHelp(Math.max(0, state.helpIndex - 1)); break;
    case "help-skip": closeModal("help"); break;
    case "preset-save": presets.savePresetPrompt(); break;
    case "preset-export": presets.exportPresets(); break;
    case "preset-import": presets.importPresets(); break;
    case "search-next": editor.searchNavigate(1); break;
    case "search-prev": editor.searchNavigate(-1); break;
    case "search-close": editor.closeSearchBar(); break;
    case "replace-one": editor.replaceOne(); break;
    case "replace-all": editor.replaceAll(); break;
    case "presentation": presentation.openPresentation(); break;
    default: break;
  }
}

function handleFolderAction() {
  if (typeof window.showDirectoryPicker === "function") {
    import("./folder.js").then((m) => m.requestFolderAccess());
  } else {
    alert("브라우저 환경에서는 폴더 연결을 지원하지 않습니다. (Chrome/Edge 최신 버전에서 사용 가능)");
  }
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
      editor.openSearchBar(false);
      return;
    }
    if (ctrl && event.key.toLowerCase() === "h") {
      event.preventDefault();
      editor.openSearchBar(true);
      return;
    }
    if (event.key === "Escape") {
      if (document.querySelector(".presentation-overlay")) {
        presentation.closePresentation();
        return;
      }
      const searchBar = document.getElementById("searchBar");
      if (searchBar && !searchBar.hidden) {
        editor.closeSearchBar();
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

function bindAccordion() {
  document.querySelectorAll(".settings-accordion").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (!details.open) return;
      document.querySelectorAll(".settings-accordion").forEach((other) => {
        if (other !== details) other.open = false;
      });
    });
  });
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
    const clamped = Math.min(maxW, Math.max(minW, parsed));
    workspace.style.setProperty("--editor-width", `${clamped}px`);
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
    const current = workspace.style.getPropertyValue("--editor-width");
    if (current) localStorage.setItem("splitterWidth", current);
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    const bounds = workspace.getBoundingClientRect();
    const nextWidth = Math.min(bounds.width - 260, Math.max(260, event.clientX - bounds.left));
    workspace.style.setProperty("--editor-width", `${nextWidth}px`);
  });
}

function initialize() {
  if (!loadFromUrlParam()) {
    const editorEl = document.getElementById("editor");
    if (editorEl) editorEl.value = loadMarkdown();
  }
  editor.bindToolbar();
  bindSettings();
  presets.renderPresets();
  bindModals();
  bindSplitter();
  bindAccordion();
  editor.initEmojiAutocomplete();
  editor.updateLineNumbers();
  editor.updateStatus();
  preview.updatePreview();
  updateThemeLabel();
  preview.updateZoomLabel();
  state.historySnapshot = editor.createSnapshot();

  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;
      const editorEl = document.getElementById("editor");
      if (!editorEl) return;
      const text = await file.text();
      editorEl.value = text;
      saveMarkdown(text);
      editor.showSaveIndicator();
      editor.updateLineNumbers();
      editor.updateStatus();
      preview.updatePreview();
      fileInput.value = "";
    });
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleAction(button.dataset.action);
    });
  });
}

initialize();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
