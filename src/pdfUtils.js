// src/pdfUtils.js
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { PDFDocument } from "pdf-lib";

// Worker file (must exist in public folder)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

// Extract page text — properly sorted (top → bottom, left → right)
export async function extractPageTexts(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Sort using Y (vertical) then X (horizontal)
    const sorted = textContent.items.sort((a, b) => {
      const dy = b.transform[5] - a.transform[5];
      if (Math.abs(dy) > 3) return dy;
      return a.transform[4] - b.transform[4];
    });

    // Combine lines visually
    let lines = [];
    let cur = [];
    let lastY = null;

    sorted.forEach((item) => {
      const y = item.transform[5];
      if (lastY === null || Math.abs(lastY - y) < 4) {
        cur.push(item.str);
      } else {
        lines.push(cur.join(" ").trim());
        cur = [item.str];
      }
      lastY = y;
    });

    if (cur.length) lines.push(cur.join(" ").trim());

    pages.push({
      pageIndex: i - 1,
      lines: lines.filter((x) => x.length > 0),
    });
  }

  return pages;
}

// Event detection (2nd non-empty line)
export function detectEventsFromPages(pages) {
  const events = new Map();

  pages.forEach(({ pageIndex, lines }) => {
    if (lines.length < 2) return;
    const event = lines[1].trim();

    if (!events.has(event)) events.set(event, []);
    events.get(event).push(pageIndex);
  });

  return events;
}

// Extract selected pages into new PDF
export async function splitPdfByPages(arrayBuffer, pageIndices) {
  // FIX: clone buffer to avoid "detached ArrayBuffer" crash
  const safeCopy = arrayBuffer.slice(0);

  const src = await PDFDocument.load(safeCopy);
  const out = await PDFDocument.create();

  const copiedPages = await out.copyPages(src, pageIndices);
  copiedPages.forEach((p) => out.addPage(p));

  const pdfBytes = await out.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}
