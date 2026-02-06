/**
 * File System Access API - 폴더 연결 (Chrome/Edge)
 * Phase 4-4
 */
import { state } from "./state.js";

let rootHandle = null;

export async function requestFolderAccess() {
  if (typeof window.showDirectoryPicker !== "function") {
    alert("이 브라우저에서는 폴더 연결을 지원하지 않습니다. Chrome 또는 Edge 최신 버전을 사용해 주세요.");
    return;
  }
  try {
    rootHandle = await window.showDirectoryPicker();
    alert(`폴더가 연결되었습니다: ${rootHandle.name}\n마크다운에서 상대 경로로 이미지를 참조할 수 있습니다.`);
  } catch (err) {
    if (err.name !== "AbortError") {
      console.warn("폴더 연결 실패:", err);
      alert("폴더 연결에 실패했습니다: " + (err.message || err));
    }
  }
}

export function getRootHandle() {
  return rootHandle;
}

export async function resolveRelativeImagePath(relativePath) {
  if (!rootHandle) return null;
  try {
    const file = await rootHandle.getFileHandle(relativePath);
    return await file.getFile();
  } catch (err) {
    return null;
  }
}
