"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/components/ToolShell";

export default function PdfMergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...chosen]);
    setResultUrl(null);
  }

  function move(index: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleMerge() {
    if (files.length < 2) return;
    setBusy(true);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const mergedBytes = await merged.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell slug="pdf-merge">
      <label className="block border-2 border-dashed border-line rounded-lg p-8 text-center cursor-pointer hover:border-amber transition-colors">
        <input type="file" accept="application/pdf" multiple onChange={onFiles} className="hidden" />
        <p className="text-paper">Click to add PDF files</p>
        <p className="text-dim text-sm mt-1">Add two or more — order is reorderable below</p>
      </label>

      {files.length > 0 && (
        <ul className="mt-5 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between bg-panel2 border border-line rounded-sm px-3 py-2"
            >
              <span className="text-sm text-paper truncate">{f.name}</span>
              <div className="flex items-center gap-2 text-dim">
                <button onClick={() => move(i, -1)} className="hover:text-paper">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} className="hover:text-paper">
                  ↓
                </button>
                <button onClick={() => remove(i)} className="hover:text-rust">
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {files.length >= 2 && !resultUrl && (
        <button
          onClick={handleMerge}
          disabled={busy}
          className="mt-6 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
        >
          {busy ? "Merging…" : `Merge ${files.length} files`}
        </button>
      )}

      {resultUrl && (
        <div className="mt-6 text-center">
          <a
            href={resultUrl}
            download="merged.pdf"
            className="bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
          >
            Download merged.pdf
          </a>
        </div>
      )}
    </ToolShell>
  );
}
