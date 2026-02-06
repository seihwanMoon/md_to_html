/**
 * Phase 5-1: 프레젠테이션 모드 (Marp 스타일, --- 로 슬라이드 구분)
 */
import { parseFrontmatter } from "./render.js";
import { renderMarkdown } from "./render.js";

let overlay = null;
let currentIndex = 0;
let slides = [];
let slideElements = [];

/** 본문을 \n---\n 기준으로 슬라이드 배열로 분리 */
export function getSlides(content) {
  const { body } = parseFrontmatter(content);
  const raw = body.split(/\n---\n/).map((s) => s.trim());
  const list = raw.filter(Boolean);
  return list.length ? list : [""];
}

export function openPresentation() {
  const editor = document.getElementById("editor");
  if (!editor) return;
  slides = getSlides(editor.value);
  if (!slides.length) return;

  currentIndex = 0;
  slideElements = slides.map((md) => {
    const { bodyHtml } = renderMarkdown(md);
    const div = document.createElement("div");
    div.className = "presentation-slide";
    div.innerHTML = bodyHtml;
    return div;
  });

  overlay = document.createElement("div");
  overlay.className = "presentation-overlay";
  overlay.setAttribute("role", "presentation");
  overlay.setAttribute("tabindex", "-1");
  overlay.innerHTML = `
    <button type="button" class="presentation-close" title="닫기 (Esc)" aria-label="닫기">×</button>
    <div class="presentation-slide-container"></div>
    <div class="presentation-nav">
      <button type="button" class="presentation-prev" aria-label="이전">‹</button>
      <span class="presentation-counter">1 / ${slides.length}</span>
      <button type="button" class="presentation-next" aria-label="다음">›</button>
    </div>
  `;

  const container = overlay.querySelector(".presentation-slide-container");
  slideElements.forEach((el) => container.appendChild(el));

  overlay.querySelector(".presentation-close").addEventListener("click", closePresentation);
  overlay.querySelector(".presentation-prev").addEventListener("click", () => goSlide(-1));
  overlay.querySelector(".presentation-next").addEventListener("click", () => goSlide(1));

  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePresentation();
    else if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      goSlide(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goSlide(-1);
    }
  });

  document.body.appendChild(overlay);
  document.body.classList.add("presentation-active");
  updateSlideVisibility();
  overlay.focus();

  // Mermaid 재실행 (슬라이드 내 mermaid 블록)
  requestAnimationFrame(() => {
    const mermaidDivs = overlay.querySelectorAll(".mermaid");
    if (typeof mermaid !== "undefined" && mermaidDivs.length) {
      try {
        mermaid.run({ nodes: mermaidDivs });
      } catch (err) {}
    }
  });
}

function goSlide(delta) {
  currentIndex = Math.max(0, Math.min(slides.length - 1, currentIndex + delta));
  updateSlideVisibility();
  const counter = overlay?.querySelector(".presentation-counter");
  if (counter) counter.textContent = `${currentIndex + 1} / ${slides.length}`;
}

function updateSlideVisibility() {
  slideElements.forEach((el, i) => {
    el.classList.toggle("presentation-slide-active", i === currentIndex);
  });
}

export function closePresentation() {
  if (!overlay?.parentNode) return;
  overlay.parentNode.removeChild(overlay);
  document.body.classList.remove("presentation-active");
  overlay = null;
  slideElements = [];
  slides = [];
}
