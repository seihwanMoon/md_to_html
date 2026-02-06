import { DEFAULT_SETTINGS, DEFAULT_MARKDOWN } from "./constants.js";

/** 단일 상태 객체 (Phase 4-2 통합) */
export const state = {
  settings: null, // loadSettings()로 초기화
  zoom: 1,
  helpIndex: 0,
  isApplyingHistory: false,
  historySnapshot: null,
  previewTimer: null,
  saveIndicatorTimer: null,
  searchMatches: [],
  searchIndex: -1,
  undoStack: [],
  redoStack: [],
};

export function loadSettings() {
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

export function saveSettings(value) {
  localStorage.setItem("settings", JSON.stringify(value));
}

export function loadMarkdown() {
  return localStorage.getItem("markdown") || DEFAULT_MARKDOWN;
}

export function saveMarkdown(value) {
  localStorage.setItem("markdown", value);
}

export function loadPresets() {
  const raw = localStorage.getItem("presets");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

// 초기화: settings는 main에서 한 번 할당
state.settings = loadSettings();
