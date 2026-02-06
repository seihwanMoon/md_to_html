import { state } from "./state.js";
import { saveSettings } from "./state.js";
import { getMargin, getTextIndent } from "./utils.js";
import * as preview from "./preview.js";

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
  headerLeftCustom: "headerLeftCustom",
  headerCenterCustom: "headerCenterCustom",
  headerRightCustom: "headerRightCustom",
  footerLeftCustom: "footerLeftCustom",
  footerCenterCustom: "footerCenterCustom",
  footerRightCustom: "footerRightCustom",
  tocDepth: "tocDepth",
  headingBoxDepth: "headingBoxDepth",
  customCss: "customCss",
  breaks: "breaks",
  emoji: "emoji",
  highlight: "highlight",
  printBackground: "printBackground",
  hideHeaderFooterOnSpecialPages: "hideHeaderFooterOnSpecialPages",
};

const customPairs = [
  ["headerLeft", "headerLeftCustom"],
  ["headerCenter", "headerCenterCustom"],
  ["headerRight", "headerRightCustom"],
  ["footerLeft", "footerLeftCustom"],
  ["footerCenter", "footerCenterCustom"],
  ["footerRight", "footerRightCustom"],
];

function syncSettingsToForm() {
  const s = state.settings;
  const m = getMargin(s);
  marginIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.value = m[marginKeys[i]];
  });
  Object.keys(bindings).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const key = bindings[id];
    const val = s[key];
    if (el.type === "checkbox") el.checked = !!val;
    else if (key === "scale") el.value = Number(val);
    else if (key === "tocDepth" || key === "headingBoxDepth") el.value = String(Math.min(6, Math.max(1, Number(val) || 3)));
    else el.value = val != null ? val : "";
  });
  customPairs.forEach(([selId, customId]) => {
    const sel = document.getElementById(selId);
    const customEl = document.getElementById(customId);
    if (sel && customEl) customEl.style.display = sel.value === "custom" ? "" : "none";
  });
  const boxDepthEl = document.querySelector(".heading-box-depth-field");
  if (boxDepthEl) boxDepthEl.style.display = s.headingStyle === "boxed" ? "" : "none";
}

export function refreshSettingsForm() {
  syncSettingsToForm();
}

export function handleSettingsChange() {
  saveSettings(state.settings);
  preview.updatePreview();
}

export function bindSettings() {
  window.refreshSettingsForm = syncSettingsToForm;

  marginIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const m = getMargin(state.settings);
    el.value = m[marginKeys[i]];
    if (!el.dataset.bound) {
      el.addEventListener("change", () => {
        if (!state.settings.margin) state.settings.margin = { top: "15mm", right: "20mm", bottom: "15mm", left: "20mm" };
        state.settings.margin[marginKeys[i]] = el.value;
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
      el.checked = state.settings[key];
      if (!el.dataset.bound) {
        el.addEventListener("change", () => {
          state.settings[key] = el.checked;
          syncSettingsToForm();
          handleSettingsChange();
        });
        el.dataset.bound = "true";
      }
      return;
    }
    el.value = key === "scale" ? Number(state.settings[key]) : (key === "tocDepth" || key === "headingBoxDepth" ? String(state.settings[key] ?? 3) : (state.settings[key] ?? ""));
    if (!el.dataset.bound) {
      el.addEventListener("change", () => {
        if (key === "tocDepth" || key === "headingBoxDepth") state.settings[key] = Math.min(6, Math.max(1, parseInt(el.value, 10) || 3));
        else if (el.type === "number") state.settings[key] = Number(el.value);
        else state.settings[key] = el.value;
        syncSettingsToForm();
        handleSettingsChange();
      });
      el.dataset.bound = "true";
    }
  });

  customPairs.forEach(([selId, customId]) => {
    const sel = document.getElementById(selId);
    const customEl = document.getElementById(customId);
    if (!sel || !customEl) return;
    function toggleCustom() {
      customEl.style.display = sel.value === "custom" ? "" : "none";
    }
    sel.addEventListener("change", () => { toggleCustom(); handleSettingsChange(); });
    toggleCustom();
  });

  syncSettingsToForm();
}
