"use client";

import { useState, useRef } from "react";
import mammoth from "mammoth";
import ToolShell from "@/components/ToolShell";

export default function WordToPdfTool() {
  const [html, setHtml] = useState<string | null>(null);
  const [fileName, setFileName] = useState("document");
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.docx$/i, ""));
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    setHtml(result.value);
  }

  async function handleDownload() {
    if (!previewRef.current) return;
    setBusy(true);
    try {
      // html2pdf is loaded client-side only (it touches `window`).
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 15,
          filename: `${fileName}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "pt", format: "a4" }
        })
        .from(previewRef.current)
        .save();
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell slug="word-to-pdf">
      {!html && (
        <label className="block border-2 border-dashed border-line rounded-lg p-10 text-center cursor-pointer hover:border-amber transition-colors">
          <input type="file" accept=".docx" onChange={onFile} className="hidden" />
          <p className="text-paper">Click to choose a .docx file</p>
        </label>
      )}

      {html && (
        <div>
          <div
            ref={previewRef}
            className="bg-white text-black rounded-md p-8 max-h-96 overflow-y-auto prose prose-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleDownload}
              disabled={busy}
              className="bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
            >
              {busy ? "Building PDF…" : "Download as PDF"}
            </button>
            <button
              onClick={() => setHtml(null)}
              className="border border-line text-paper px-5 py-2.5 rounded-sm hover:border-amber transition-colors"
            >
              Choose another file
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
