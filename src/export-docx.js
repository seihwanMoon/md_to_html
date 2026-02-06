/**
 * Phase 5-5: DOCX 내보내기 (Word 문서 생성)
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
} from "docx";
import { parseFrontmatter } from "./render.js";

const HEADING_LEVELS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];

/** 인라인 ** 굵게, * 기울임을 TextRun 배열로 변환 */
function parseInline(text) {
  if (!text || !text.length) return [new TextRun({ text: " " })];
  const runs = [];
  let remaining = text;
  const regex = /(\*\*([^*]+)\*\*|(?<!\*)\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let m;
  while ((m = regex.exec(remaining)) !== null) {
    if (m.index > lastIndex) {
      runs.push(new TextRun({ text: remaining.slice(lastIndex, m.index) }));
    }
    if (m[2] !== undefined) runs.push(new TextRun({ text: m[2], bold: true }));
    else if (m[3] !== undefined) runs.push(new TextRun({ text: m[3], italics: true }));
    else if (m[4] !== undefined) runs.push(new TextRun({ text: m[4], font: "Consolas" }));
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < remaining.length) {
    runs.push(new TextRun({ text: remaining.slice(lastIndex) }));
  }
  return runs.length ? runs : [new TextRun({ text: remaining || " " })];
}

/** 마크다운 본문을 블록 단위로 분리 (프론트매터 제외) */
function getBlocks(content) {
  const { body } = parseFrontmatter(content);
  const raw = body.replace(/\r\n/g, "\n");
  const blocks = [];
  let i = 0;
  while (i < raw.length) {
    const lineEnd = raw.indexOf("\n", i);
    const line = lineEnd === -1 ? raw.slice(i) : raw.slice(i, lineEnd);
    const next = lineEnd === -1 ? raw.length : lineEnd + 1;

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

/** 블록 배열을 docx Section children으로 변환 */
function blocksToChildren(blocks) {
  const children = [];
  for (const b of blocks) {
    if (b.type === "heading") {
      children.push(
        new Paragraph({
          text: b.text,
          heading: HEADING_LEVELS[Math.min(b.level - 1, 5)],
        })
      );
    } else if (b.type === "paragraph") {
      children.push(new Paragraph({ children: parseInline(b.text) }));
    } else if (b.type === "code") {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: b.text, font: "Consolas", size: 20 })],
          shading: { fill: "F5F5F5" },
        })
      );
    } else if (b.type === "quote") {
      children.push(
        new Paragraph({
          children: parseInline(b.text),
          indent: { left: 720 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: "333333" } },
        })
      );
    } else if (b.type === "ul") {
      for (const item of b.items) {
        children.push(
          new Paragraph({
            children: parseInline(item),
            bullet: { level: 0 },
          })
        );
      }
    } else if (b.type === "ol") {
      b.items.forEach((item, idx) => {
        children.push(new Paragraph({ children: parseInline(`${idx + 1}. ${item}`) }));
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
                  children: [new Paragraph({ children: parseInline(cell) })],
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
      children.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } } }));
    }
  }
  return children;
}

/**
 * 마크다운 문자열을 DOCX Blob으로 변환
 */
export async function markdownToDocxBlob(content) {
  const blocks = getBlocks(content);
  const children = blocksToChildren(blocks);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children.length ? children : [new Paragraph({ children: [new TextRun({ text: " " })] })],
      },
    ],
  });
  return await Packer.toBlob(doc);
}

/**
 * 에디터 내용을 DOCX로 내보내기 (다운로드)
 */
export async function exportDocx() {
  const editor = document.getElementById("editor");
  if (!editor) return;
  try {
    const blob = await markdownToDocxBlob(editor.value);
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
