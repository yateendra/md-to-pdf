"use client";

type Token =
  | { type: "heading"; depth: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list_item"; text: string }
  | { type: "hr" }
  | { type: "code"; text: string }
  | { type: "blockquote"; text: string };

function parseMarkdown(md: string): Token[] {
  const tokens: Token[] = [];
  const lines = md.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      tokens.push({ type: "heading", depth: headingMatch[1].length, text: headingMatch[2].trim() });
      i++;
      continue;
    }

    // HR
    if (/^[-*_]{3,}$/.test(line.trim())) {
      tokens.push({ type: "hr" });
      i++;
      continue;
    }

    // Code block
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      tokens.push({ type: "code", text: codeLines.join("\n") });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      tokens.push({ type: "blockquote", text: line.slice(2).trim() });
      i++;
      continue;
    }

    // List item
    if (/^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const text = line.replace(/^[-*+]\s+/, "• ").replace(/^\d+\.\s+/, (m) => m);
      tokens.push({ type: "list_item", text: stripInline(text) });
      i++;
      continue;
    }

    // Paragraph (skip blank lines)
    if (line.trim() !== "") {
      tokens.push({ type: "paragraph", text: stripInline(line.trim()) });
    }
    i++;
  }

  return tokens;
}

// Strip inline markdown (bold, italic, code, links)
function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");
}

function wrapText(doc: any, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

export async function exportToPdf(markdown: string, filename = "document.pdf") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const lineHeight = 16;

  function checkPage(needed: number) {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  const tokens = parseMarkdown(markdown);

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const sizes: Record<number, number> = { 1: 22, 2: 18, 3: 15, 4: 13, 5: 12, 6: 11 };
        const size = sizes[token.depth] ?? 12;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        const lines = wrapText(doc, token.text, contentWidth);
        checkPage(lines.length * (size + 6) + 10);
        y += 8;
        for (const line of lines) {
          doc.text(line, margin, y);
          y += size + 4;
        }
        y += 4;
        break;
      }

      case "paragraph": {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines = wrapText(doc, token.text, contentWidth);
        checkPage(lines.length * lineHeight + 6);
        for (const line of lines) {
          doc.text(line, margin, y);
          y += lineHeight;
        }
        y += 4;
        break;
      }

      case "list_item": {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const lines = wrapText(doc, token.text, contentWidth - 12);
        checkPage(lines.length * lineHeight + 4);
        for (let idx = 0; idx < lines.length; idx++) {
          doc.text(lines[idx], margin + (idx === 0 ? 0 : 12), y);
          y += lineHeight;
        }
        break;
      }

      case "blockquote": {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setDrawColor(180);
        const lines = wrapText(doc, token.text, contentWidth - 20);
        checkPage(lines.length * lineHeight + 8);
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y - 12, contentWidth, lines.length * lineHeight + 6, "F");
        doc.setDrawColor(150);
        doc.line(margin, y - 12, margin, y - 12 + lines.length * lineHeight + 6);
        for (const line of lines) {
          doc.text(line, margin + 10, y);
          y += lineHeight;
        }
        y += 6;
        break;
      }

      case "code": {
        doc.setFont("courier", "normal");
        doc.setFontSize(10);
        const lines = token.text.split("\n");
        const blockHeight = lines.length * 14 + 12;
        checkPage(blockHeight);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 10, contentWidth, blockHeight, "F");
        for (const line of lines) {
          doc.text(line, margin + 6, y);
          y += 14;
        }
        y += 8;
        break;
      }

      case "hr": {
        checkPage(16);
        doc.setDrawColor(180);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
        break;
      }
    }
  }

  doc.save(filename);
}
