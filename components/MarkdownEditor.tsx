"use client";

import { useState } from "react";

const SAMPLE = `# Hello World

This is a **markdown** to PDF converter using *jsPDF*.

## Features

- No canvas or screenshots
- Pure text rendering
- Supports headings, lists, code blocks

## Code Example

\`\`\`
function greet(name) {
  return "Hello, " + name;
}
\`\`\`

> This is a blockquote with some important info.

---

### Paragraph

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [filename, setFilename] = useState("document");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { exportToPdf } = await import("./PdfExporter");
      await exportToPdf(markdown, `${filename || "document"}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">MD → PDF</h1>
        <p className="text-gray-500 mb-6 text-sm">Paste your markdown, export to PDF via jsPDF — no canvas, no screenshots.</p>

        <div className="grid grid-cols-1 gap-4">
          <textarea
            className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Paste your markdown here..."
            aria-label="Markdown input"
          />

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="filename"
              aria-label="Output filename"
            />
            <span className="text-gray-400 text-sm">.pdf</span>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? "Exporting..." : "Export PDF"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
