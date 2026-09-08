"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function BackgroundRemoverTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResultUrl(null);
    setImageSrc(URL.createObjectURL(file));
  }

  async function handleRemove() {
    if (!imageSrc) return;
    setBusy(true);
    setProgress("Loading model (first run downloads ~40MB, then it's cached)…");
    try {
      // @imgly/background-removal runs entirely client-side (WASM/WebGPU) —
      // no server, no per-image API cost.
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(imageSrc, {
        progress: (key: string, current: number, total: number) =>
          setProgress(`${key}: ${Math.round((current / total) * 100)}%`)
      });
      setResultUrl(URL.createObjectURL(blob));
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <ToolShell slug="background-remover">
      {!imageSrc && (
        <label className="block border-2 border-dashed border-line rounded-lg p-10 text-center cursor-pointer hover:border-amber transition-colors">
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          <p className="text-paper">Click to choose a photo</p>
        </label>
      )}

      {imageSrc && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="tag text-dim mb-2">ORIGINAL</p>
            <img src={imageSrc} className="rounded-md w-full" />
          </div>
          <div>
            <p className="tag text-dim mb-2">RESULT</p>
            <div className="rounded-md w-full min-h-[10rem] bg-[repeating-conic-gradient(#2b2f38_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] flex items-center justify-center">
              {resultUrl ? (
                <img src={resultUrl} className="rounded-md w-full" />
              ) : (
                <span className="text-dim text-sm p-4 text-center">{progress || "Not processed yet"}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {imageSrc && !resultUrl && (
        <button
          onClick={handleRemove}
          disabled={busy}
          className="mt-6 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
        >
          {busy ? "Removing background…" : "Remove background"}
        </button>
      )}

      {resultUrl && (
        <div className="mt-6 flex gap-3">
          <a
            href={resultUrl}
            download="no-background.png"
            className="bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
          >
            Download PNG
          </a>
          <button
            onClick={() => {
              setImageSrc(null);
              setResultUrl(null);
            }}
            className="border border-line text-paper px-5 py-2.5 rounded-sm hover:border-amber transition-colors"
          >
            Start over
          </button>
        </div>
      )}
    </ToolShell>
  );
}
