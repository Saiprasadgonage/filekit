"use client";

import { useState } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { useSession } from "next-auth/react";
import ToolShell from "@/components/ToolShell";
import UpgradeGate from "@/components/UpgradeGate";

type PageMeta = { originalIndex: number; rotation: number; deleted: boolean };

export default function PdfEditorTool() {
  const { data: session } = useSession();
  const isPro = (session?.user as any)?.plan === "pro";

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [textToAdd, setTextToAdd] = useState("");
  const [textPage, setTextPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    setPages(doc.getPageIndices().map((i) => ({ originalIndex: i, rotation: 0, deleted: false })));
    setResultUrl(null);
  }

  function rotate(i: number) {
    setPages((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  }
  function toggleDelete(i: number) {
    setPages((prev) => prev.map((p, idx) => (idx === i ? { ...p, deleted: !p.deleted } : p)));
  }
  function move(i: number, dir: -1 | 1) {
    setPages((prev) => {
      const next = [...prev];
      const target = i + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  }

  async function handleExport() {
    if (!file) return;
    setBusy(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const out = await PDFDocument.create();
      const font = await out.embedFont(StandardFonts.Helvetica);

      const kept = pages.filter((p) => !p.deleted);
      const copied = await out.copyPages(src, kept.map((p) => p.originalIndex));

      copied.forEach((page, i) => {
        page.setRotation(degrees(kept[i].rotation));
        out.addPage(page);
      });

      if (textToAdd && out.getPageCount() > textPage) {
        const page = out.getPage(textPage);
        const { height } = page.getSize();
        page.drawText(textToAdd, {
          x: 50,
          y: height - 70,
          size: 18,
          font,
          color: rgb(0.9, 0.64, 0.24)
        });
      }

      const outBytes = await out.save();
      const blob = new Blob([outBytes], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell slug="pdf-editor">
      <UpgradeGate isPro={true}>
        {!file && (
          <label className="block border-2 border-dashed border-line rounded-lg p-8 text-center cursor-pointer hover:border-amber transition-colors">
            <input type="file" accept="application/pdf" onChange={onFile} className="hidden" />
            <p className="text-paper">Click to choose a PDF</p>
          </label>
        )}

        {file && !resultUrl && (
          <div>
            <p className="tag text-dim mb-2">PAGES ({pages.filter((p) => !p.deleted).length})</p>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {pages.map((p, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-between border rounded-sm px-3 py-2 ${
                    p.deleted ? "border-line opacity-40" : "border-line bg-panel2"
                  }`}
                >
                  <span className="text-sm text-paper">
                    Page {p.originalIndex + 1} {p.rotation ? `(${p.rotation}°)` : ""}
                  </span>
                  <div className="flex items-center gap-3 text-dim text-sm">
                    <button onClick={() => move(i, -1)} className="hover:text-paper">↑</button>
                    <button onClick={() => move(i, 1)} className="hover:text-paper">↓</button>
                    <button onClick={() => rotate(i)} className="hover:text-paper">⟳ rotate</button>
                    <button onClick={() => toggleDelete(i)} className="hover:text-rust">
                      {p.deleted ? "restore" : "delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-[1fr_100px] gap-3">
              <div>
                <label className="text-sm text-dim">Add text (optional)</label>
                <input
                  value={textToAdd}
                  onChange={(e) => setTextToAdd(e.target.value)}
                  placeholder="e.g. DRAFT"
                  className="mt-1 w-full bg-panel2 border border-line rounded-sm px-3 py-1.5 text-paper"
                />
              </div>
              <div>
                <label className="text-sm text-dim">On page #</label>
                <input
                  type="number"
                  min={0}
                  value={textPage}
                  onChange={(e) => setTextPage(Number(e.target.value))}
                  className="mt-1 w-full bg-panel2 border border-line rounded-sm px-3 py-1.5 text-paper"
                />
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={busy}
              className="mt-6 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
            >
              {busy ? "Building…" : "Export PDF"}
            </button>
          </div>
        )}

        {resultUrl && (
          <div className="text-center">
            <a
              href={resultUrl}
              download="edited.pdf"
              className="bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
            >
              Download edited.pdf
            </a>
          </div>
        )}
      </UpgradeGate>
    </ToolShell>
  );
}
