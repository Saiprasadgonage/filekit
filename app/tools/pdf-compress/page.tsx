"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import ToolShell from "@/components/ToolShell";

export default function PdfCompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [before, setBefore] = useState(0);
  const [after, setAfter] = useState(0);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setBefore(f.size);
    setResultUrl(null);
  }

  async function handleCompress() {
    if (!file) return;
    setBusy(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { updateMetadata: false });
      // Re-saving with object streams + no metadata bloat typically shaves
      // 10-30% off PDFs that weren't already optimized. It does NOT
      // recompress embedded photos — that needs a server-side image
      // re-encode pass (see README for a Ghostscript-based upgrade path).
      const out = await doc.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([out], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setAfter(out.byteLength);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell slug="pdf-compress">
      <p className="text-sm text-dim -mt-2 mb-4">
        Strips redundant structure and rebuilds the file efficiently. Best results
        on PDFs exported from Word/Google Docs; scanned PDFs with large photos
        compress further with the server-side upgrade noted in the README.
      </p>

      {!resultUrl && (
        <label className="block border-2 border-dashed border-line rounded-lg p-8 text-center cursor-pointer hover:border-amber transition-colors">
          <input type="file" accept="application/pdf" onChange={onFile} className="hidden" />
          <p className="text-paper">{file ? file.name : "Click to choose a PDF"}</p>
        </label>
      )}

      {file && !resultUrl && (
        <button
          onClick={handleCompress}
          disabled={busy}
          className="mt-6 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
        >
          {busy ? "Compressing…" : "Compress"}
        </button>
      )}

      {resultUrl && (
        <div className="text-center">
          <p className="text-dim text-sm">
            {(before / 1024).toFixed(0)} KB → {(after / 1024).toFixed(0)} KB
            {before > after && (
              <span className="text-teal"> (-{Math.round((1 - after / before) * 100)}%)</span>
            )}
          </p>
          <a
            href={resultUrl}
            download="compressed.pdf"
            className="inline-block mt-4 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
          >
            Download compressed.pdf
          </a>
        </div>
      )}
    </ToolShell>
  );
}
