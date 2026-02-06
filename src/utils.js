import { DEFAULT_SETTINGS } from "./constants.js";

/** margin 값 읽기: 설정이 객체면 그대로, 예전 개별 키면 객체로 반환 */
export function getMargin(s) {
  if (s.margin && typeof s.margin === "object") return s.margin;
  return {
    top: s.marginTop || "15mm",
    right: s.marginRight || "20mm",
    bottom: s.marginBottom || "15mm",
    left: s.marginLeft || "20mm",
  };
}

/** 숫자 들여쓰기 (textIndent 문자열 허용) */
export function getTextIndent(s) {
  const v = s.textIndent;
  if (typeof v === "number") return v;
  return Number(v) || 0;
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${d}.`;
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function slugify(text) {
  return encodeURIComponent(
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w가-힣-]/g, "")
  );
}

export function downloadFile(filename, content) {
  const type = filename.endsWith(".html") ? "text/html" : "text/plain";
  // 한글(HWP)에서 HTML 파일을 직접 열 때 UTF-8을 안정적으로 인식시키기 위해
  // HTML 다운로드에는 UTF-8 BOM을 붙인다. (클립보드 복사에는 BOM을 넣지 않음)
  const bom = "\uFEFF";
  const body = filename.endsWith(".html") ? `${bom}${content}` : content;
  const blob = new Blob([body], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 가져온 프리셋 설정을 원본 형식으로 정규화.
 * 예전 우리 형식(convertBreaks, marginTop 등) → 원본 형식(breaks, margin) 마이그레이션.
 */
export function normalizeImportedPresetSettings(imported) {
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
    "headerLeftCustom", "headerCenterCustom", "headerRightCustom",
    "footerLeftCustom", "footerCenterCustom", "footerRightCustom",
    "pageNumberStart", "pageNumberFormat", "pageNumberCustom",
    "tocDepth", "headingBoxDepth", "customCss",
    "printBackground"].forEach((k) => {
    if (imported[k] !== undefined) out[k] = imported[k];
  });
  if (out.tocDepth !== undefined) out.tocDepth = Math.min(6, Math.max(1, Number(out.tocDepth) || 3));
  if (out.headingBoxDepth !== undefined) out.headingBoxDepth = Math.min(6, Math.max(1, Number(out.headingBoxDepth) || 3));
  const font = imported.fontFamily;
  if (font) {
    const v = String(font).toLowerCase().replace(/\s+/g, "-");
    out.fontFamily = ["nanum-gothic", "nanum-myeongjo", "noto-serif-kr", "pretendard"].includes(v) ? v : font;
  }
  return out;
}
