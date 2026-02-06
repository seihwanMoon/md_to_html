/**
 * DOCX 내보내기 (HWP 스타일 반영)
 * - 1단계: 기본 스타일(폰트, 크기, 줄간격, 여백)
 * - 2단계: 표지/목차/간지
 * - 3단계: 헤더/푸터
 * - 4단계: 박스형 제목
 * - 5단계: 이미지(Base64) (선택)
 * - 6단계: 각주 (선택)
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertMillimetersToTwip,
  AlignmentType,
  ShadingType,
  ImageRun,
} from "docx";
import { parseFrontmatter } from "./render.js";
import { state } from "./state.js";
import { getMargin } from "./utils.js";
import { formatDate } from "./utils.js";

const HEADING_LEVELS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];

/** 설정 폰트 → docx 폰트 이름 */
const FONT_MAP = {
  "nanum-gothic": "Nanum Gothic",
  "nanum-myeongjo": "Nanum Myeongjo",
  "noto-serif-kr": "Noto Serif KR",
  pretendard: "Pretendard Variable",
};

function getDocxFont(settings) {
  return FONT_MAP[settings.fontFamily] || "Nanum Gothic";
}

/** pt → half-points (docx) */
function ptToHalfPt(pt) {
  return Math.round((Number(pt) || 10) * 2);
}

/** mm 문자열 → twips (숫자만 있으면 mm로 간주) */
function mmToTwip(val) {
  if (typeof val === "number") return Math.round(val * 56.69);
  const str = String(val || "0").trim();
  const num = parseFloat(str) || 0;
  if (str.endsWith("mm")) return convertMillimetersToTwip(num);
  if (str.endsWith("cm")) return convertMillimetersToTwip(num * 10);
  return convertMillimetersToTwip(num);
}

/** 헤더/푸터 셀 값 해석 (render.js resolveHeaderFooterValue와 동일) */
function resolveHeaderFooterValue(type, frontmatter, slot) {
  if (type === "none") return "";
  const s = state.settings;
  if (type === "custom" && slot) {
    const key = slot + "Custom";
    const val = s[key];
    return typeof val === "string" ? val : "";
  }
  if (type === "title") return frontmatter.title || "";
  if (type === "date") return frontmatter.date || formatDate(new Date());
  if (type === "page" || type === "pageNumber") return null; // PageNumber.CURRENT 사용
  return "";
}

/** 인라인 ** 굵게, * 기울임, `코드` 를 TextRun 배열로 (폰트/크기 적용) */
function parseInline(text, options = {}) {
  const font = options.font || "Nanum Gothic";
  const size = options.size != null ? options.size : 20;
  if (!text || !text.length) return [new TextRun({ text: " ", font, size })];

  const runs = [];
  let remaining = text;
  const regex = /(\*\*([^*]+)\*\*|(?<!\*)\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let m;
  while ((m = regex.exec(remaining)) !== null) {
    if (m.index > lastIndex) {
      runs.push(new TextRun({ text: remaining.slice(lastIndex, m.index), font, size }));
    }
    if (m[2] !== undefined) runs.push(new TextRun({ text: m[2], bold: true, font, size }));
    else if (m[3] !== undefined) runs.push(new TextRun({ text: m[3], italics: true, font, size }));
    else if (m[4] !== undefined) runs.push(new TextRun({ text: m[4], font: "Consolas", size }));
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < remaining.length) {
    runs.push(new TextRun({ text: remaining.slice(lastIndex), font, size }));
  }
  return runs.length ? runs : [new TextRun({ text: remaining || " ", font, size })];
}

/** 마크다운 본문 블록 분리 (프론트매터 제외), 이미지/각주 수집 */
function getBlocks(content) {
  const { body } = parseFrontmatter(content);
  const raw = body.replace(/\r\n/g, "\n");
  const blocks = [];
  let i = 0;
  while (i < raw.length) {
    const lineEnd = raw.indexOf("\n", i);
    const line = lineEnd === -1 ? raw.slice(i) : raw.slice(i, lineEnd);
    const next = lineEnd === -1 ? raw.length : lineEnd + 1;

    const imgMatch = line.match(/!\[([^\]]*)\]\((data:image\/[^)]+)\)/);
    if (imgMatch) {
      blocks.push({ type: "image", alt: imgMatch[1], src: imgMatch[2] });
      i = next;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const end = raw.indexOf("\n```", next);
      const code = end === -1 ? raw.slice(next) : raw.slice(next, end);
      blocks.push({ type: "code", text: code.trim(), lang });
      i = end === -1 ? raw.length : end + 4;
      continue;
    }

    if (line.startsWith("|") && line.includes("|")) {
      const tableLines = [line];
      let j = next;
      while (j < raw.length) {
        const je = raw.indexOf("\n", j);
        const l = je === -1 ? raw.slice(j) : raw.slice(j, je);
        if (!l.startsWith("|")) break;
        tableLines.push(l);
        j = je === -1 ? raw.length : je + 1;
      }
      blocks.push({ type: "table", lines: tableLines });
      i = j;
      continue;
    }

    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      blocks.push({ type: "heading", level: hMatch[1].length, text: hMatch[2].trim() });
      i = next;
      continue;
    }

    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      blocks.push({ type: "hr" });
      i = next;
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push({ type: "quote", text: line.slice(2).trim() });
      i = next;
      continue;
    }

    if (line.match(/^[-*+]\s+/)) {
      const items = [line.replace(/^[-*+]\s+/, "")];
      let j = next;
      while (j < raw.length) {
        const je = raw.indexOf("\n", j);
        const l = je === -1 ? raw.slice(j) : raw.slice(j, je);
        const trimmed = l.trimStart();
        if (trimmed.match(/^[-*+]\s+/)) items.push(trimmed.replace(/^[-*+]\s+/, ""));
        else if (trimmed.match(/^\d+\.\s+/)) break;
        else if (!trimmed) break;
        else items[items.length - 1] += " " + trimmed;
        j = je === -1 ? raw.length : je + 1;
      }
      blocks.push({ type: "ul", items });
      i = j;
      continue;
    }

    if (line.match(/^\d+\.\s+/)) {
      const items = [line.replace(/^\d+\.\s+/, "")];
      let j = next;
      while (j < raw.length) {
        const je = raw.indexOf("\n", j);
        const l = je === -1 ? raw.slice(j) : raw.slice(j, je);
        const trimmed = l.trimStart();
        if (trimmed.match(/^\d+\.\s+/)) items.push(trimmed.replace(/^\d+\.\s+/, ""));
        else if (trimmed.match(/^[-*+]\s+/)) break;
        else if (!trimmed) break;
        else items[items.length - 1] += " " + trimmed;
        j = je === -1 ? raw.length : je + 1;
      }
      blocks.push({ type: "ol", items });
      i = j;
      continue;
    }

    if (line.trim() === "") {
      i = next;
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
    i = next;
  }
  return blocks;
}

/** 블록 배열 → docx Section children (설정·박스형 제목·이미지 반영) */
function blocksToChildren(blocks, opts) {
  const { settings, font, size, lineSpacing, headingBoxDepth } = opts;
  const boxed = settings.headingStyle === "boxed";
  const children = [];

  for (const b of blocks) {
    if (b.type === "heading") {
      const level = Math.min(b.level, 6);
      const isBoxed = boxed && level <= (headingBoxDepth ?? 3);
      const para = new Paragraph({
        text: b.text,
        heading: HEADING_LEVELS[level - 1],
        ...(isBoxed && {
          shading: { fill: "F8F8F8", type: ShadingType.CLEAR },
          border: {
            left: { style: BorderStyle.SINGLE, size: level <= 1 ? 6 : level <= 2 ? 4 : 3, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          },
        }),
        spacing: { before: 240, after: 120, line: lineSpacing },
      });
      if (settings.pageBreakBeforeH1 && level === 1) para.pageBreakBefore = true;
      if (settings.pageBreakBeforeH2 && level === 2) para.pageBreakBefore = true;
      if (settings.pageBreakBeforeH3 && level === 3) para.pageBreakBefore = true;
      children.push(para);
    } else if (b.type === "paragraph") {
      children.push(
        new Paragraph({
          children: parseInline(b.text, { font, size }),
          spacing: { line: lineSpacing },
        })
      );
    } else if (b.type === "code") {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: b.text, font: "Consolas", size: 18 })],
          shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
          spacing: { line: lineSpacing },
        })
      );
    } else if (b.type === "quote") {
      children.push(
        new Paragraph({
          children: parseInline(b.text, { font, size }),
          indent: { left: 720 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: "333333" } },
          spacing: { line: lineSpacing },
        })
      );
    } else if (b.type === "ul") {
      for (const item of b.items) {
        children.push(
          new Paragraph({
            children: parseInline(item, { font, size }),
            bullet: { level: 0 },
            spacing: { line: lineSpacing },
          })
        );
      }
    } else if (b.type === "ol") {
      b.items.forEach((item, idx) => {
        children.push(
          new Paragraph({
            children: parseInline(`${idx + 1}. ${item}`, { font, size }),
            spacing: { line: lineSpacing },
          })
        );
      });
    } else if (b.type === "table") {
      const rows = [];
      const lines = b.lines.filter((l) => !/^[\s|:-]+$/.test(l));
      for (let r = 0; r < lines.length; r++) {
        const cells = lines[r]
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean);
        rows.push(
          new TableRow({
            children: cells.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph({ children: parseInline(cell, { font, size }) })],
                })
            ),
            tableHeader: r === 0,
          })
        );
      }
      if (rows.length) {
        children.push(
          new Table({
            rows,
            width: { size: 100, type: "PERCENTAGE" },
          })
        );
      }
    } else if (b.type === "hr") {
      children.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
          spacing: { line: lineSpacing },
        })
      );
    } else if (b.type === "image" && b.src && b.src.startsWith("data:image")) {
      try {
        const base64 = b.src.replace(/^data:image\/\w+;base64,/, "");
        const data = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data,
                transformation: { width: 200, height: 150 },
              }),
            ],
            spacing: { line: lineSpacing },
          })
        );
      } catch (_) {
        children.push(new Paragraph({ children: parseInline(`[이미지: ${b.alt || "image"}]`, { font, size }) }));
      }
    }
  }
  return children;
}

/** 표지 페이지 Paragraph[] */
function buildCoverSection(frontmatter, font, size) {
  const org = frontmatter.organization || "";
  const title = frontmatter.title || "제목";
  const subtitle = frontmatter.subtitle || "";
  const date = frontmatter.date || formatDate(new Date());
  const author = frontmatter.author || "";
  return [
    new Paragraph({ text: org, alignment: AlignmentType.CENTER, spacing: { after: 400 }, font, size: size - 2 }),
    new Paragraph({ text: title, alignment: AlignmentType.CENTER, heading: HeadingLevel.TITLE, spacing: { after: 200 }, font, size: size + 8 }),
    new Paragraph({ text: subtitle, alignment: AlignmentType.CENTER, spacing: { after: 600 }, font, size }),
    new Paragraph({ text: date, alignment: AlignmentType.CENTER, spacing: { after: 120 }, font, size }),
    new Paragraph({ text: author, alignment: AlignmentType.CENTER, font, size }),
  ];
}

/** 목차 페이지 Paragraph[] (헤딩 목록) */
function buildTocSection(headings, tocDepth, font, size) {
  const filtered = headings.filter((h) => h.level <= tocDepth);
  const items = [new Paragraph({ text: "목차", heading: HeadingLevel.HEADING_1, spacing: { after: 300 }, font, size: size + 2 })];
  filtered.forEach((h) => {
    const indent = (h.level - 1) * 360;
    items.push(
      new Paragraph({
        text: h.text,
        indent: { left: indent },
        spacing: { after: 80, line: 240 },
        font,
        size: Math.max(16, size - (h.level - 1) * 2),
      })
    );
  });
  return items;
}

/** 간지 페이지 Paragraph[] */
function buildDividerSection(headings, font, size) {
  const first = headings.find((h) => h.level === 1) || headings[0];
  const text = first ? first.text : "구분";
  return [new Paragraph({ text, alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_1, spacing: { after: 400 }, font, size: size + 4 })];
}

/** 헤더/푸터 3열 Paragraph (좌/중/우). null = 페이지 번호(PageNumber.CURRENT) */
function buildHeaderFooterParagraph(left, center, right, fontSize, font) {
  const size = ptToHalfPt(fontSize);
  const run = (val) =>
    val === null
      ? [new TextRun({ children: [PageNumber.CURRENT], font, size })]
      : val
        ? [new TextRun({ text: val, font, size })]
        : [];
  const leftRun = run(left);
  const centerRun = run(center);
  const rightRun = run(right);
  return new Paragraph({
    children: [
      ...leftRun,
      new TextRun({ text: "\t", font, size }),
      ...centerRun,
      new TextRun({ text: "\t", font, size }),
      ...rightRun,
    ],
    tabStops: [
      { position: 4680, type: "center" },
      { position: 9360, type: "right" },
    ],
  });
}

/** 공통 section properties (A4, 여백) */
function getSectionProperties(settings, extra = {}) {
  const margin = getMargin(settings);
  return {
    page: {
      margin: {
        top: mmToTwip(margin.top),
        right: mmToTwip(margin.right),
        bottom: mmToTwip(margin.bottom),
        left: mmToTwip(margin.left),
        header: 720,
        footer: 720,
      },
      size: {
        width: convertMillimetersToTwip(210),
        height: convertMillimetersToTwip(297),
      },
      pageNumbers: { formatType: NumberFormat.DECIMAL },
      ...extra,
    },
  };
}

/**
 * 마크다운 문자열 → DOCX Blob
 */
export async function markdownToDocxBlob(content) {
  const settings = state.settings || {};
  const { frontmatter, body } = parseFrontmatter(content);
  const margin = getMargin(settings);
  const font = getDocxFont(settings);
  const size = ptToHalfPt(settings.fontSize ?? 10);
  const lineHeight = settings.lineHeight ?? 1.6;
  const lineSpacing = Math.round(240 * lineHeight); // 240 twips = 1 line base
  const headingBoxDepth = Math.min(6, Math.max(1, settings.headingBoxDepth ?? 3));
  const tocDepth = Math.min(6, Math.max(1, settings.tocDepth ?? 3));

  const blocks = getBlocks(content);
  const headings = blocks.filter((b) => b.type === "heading").map((b) => ({ level: b.level, text: b.text }));

  const opts = { settings, font, size, lineSpacing, headingBoxDepth };
  const bodyChildren = await blocksToChildren(blocks, opts);

  const sections = [];

  // 표지
  if (settings.coverPage) {
    sections.push({
      properties: getSectionProperties(settings, { titlePage: true }),
      children: buildCoverSection(frontmatter, font, size),
    });
  }

  // 목차
  if (settings.tocPage && headings.length) {
    sections.push({
      properties: getSectionProperties(settings),
      children: buildTocSection(headings, tocDepth, font, size),
    });
  }

  // 간지
  if (settings.dividerPage && headings.length) {
    sections.push({
      properties: getSectionProperties(settings),
      children: buildDividerSection(headings, font, size),
    });
  }

  // 헤더/푸터 (3열)
  let headerParagraph = null;
  let footerParagraph = null;
  if (settings.headerEnabled) {
    const left = resolveHeaderFooterValue(settings.headerLeft, frontmatter, "headerLeft");
    const center = resolveHeaderFooterValue(settings.headerCenter, frontmatter, "headerCenter");
    const right = resolveHeaderFooterValue(settings.headerRight, frontmatter, "headerRight");
    headerParagraph = buildHeaderFooterParagraph(left, center, right, settings.headerFontSize ?? 9, font);
  }
  if (settings.footerEnabled) {
    const left = resolveHeaderFooterValue(settings.footerLeft, frontmatter, "footerLeft");
    const center = resolveHeaderFooterValue(settings.footerCenter, frontmatter, "footerCenter");
    const right = resolveHeaderFooterValue(settings.footerRight, frontmatter, "footerRight");
    footerParagraph = buildHeaderFooterParagraph(left, center, right, settings.footerFontSize ?? 9, font);
  }

  const mainChildren = bodyChildren.length ? bodyChildren : [new Paragraph({ children: [new TextRun({ text: " ", font, size })] })];

  sections.push({
    properties: getSectionProperties(settings),
    headers: headerParagraph ? { default: new Header({ children: [headerParagraph] }) } : undefined,
    footers: footerParagraph ? { default: new Footer({ children: [footerParagraph] }) } : undefined,
    children: mainChildren,
  });

  const doc = new Document({
    sections,
  });
  return await Packer.toBlob(doc);
}

/**
 * 에디터 내용을 DOCX로 내보내기 (다운로드)
 */
export async function exportDocx() {
  const editorEl = document.getElementById("editor");
  if (!editorEl) return;
  try {
    const blob = await markdownToDocxBlob(editorEl.value);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.docx";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("DOCX export:", err);
    alert("DOCX 내보내기에 실패했습니다: " + (err.message || err));
  }
}
