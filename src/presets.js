import { state } from "./state.js";
import { saveSettings } from "./state.js";
import { loadPresets } from "./state.js";
import { normalizeImportedPresetSettings, downloadFile } from "./utils.js";
import { bindSettings, refreshSettingsForm } from "./settings.js";
import * as preview from "./preview.js";

export function renderPresets() {
  const list = loadPresets();
  const container = document.getElementById("presetList");
  const empty = document.getElementById("presetEmpty");
  if (!container) return;
  container.innerHTML = "";
  if (!list.length) {
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
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

export function savePresetPrompt() {
  const name = prompt("프리셋 이름을 입력하세요");
  if (!name) return;
  const list = loadPresets();
  list.push({ name, settings: { ...state.settings } });
  localStorage.setItem("presets", JSON.stringify(list));
  renderPresets();
}

export function applyPreset(index) {
  const list = loadPresets();
  const preset = list[index];
  if (!preset) return;
  const normalized = normalizeImportedPresetSettings(preset.settings);
  state.settings = { ...state.settings, ...normalized };
  saveSettings(state.settings);
  if (typeof window.refreshSettingsForm === "function") window.refreshSettingsForm();
  bindSettings();
  preview.updatePreview();
}

export function deletePreset(index) {
  const list = loadPresets();
  list.splice(index, 1);
  localStorage.setItem("presets", JSON.stringify(list));
  renderPresets();
}

export function exportPresets() {
  const list = loadPresets();
  downloadFile("presets.json", JSON.stringify(list, null, 2));
}

export function importPresets() {
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
        const name = item?.name != null ? String(item.name) : "가져온 프리셋";
        const settings = normalizeImportedPresetSettings(item?.settings);
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
