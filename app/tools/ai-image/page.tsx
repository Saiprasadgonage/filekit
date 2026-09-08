"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import UpgradeGate from "@/components/UpgradeGate";

export default function AiImageTool() {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setBusy(true);
    setError("");
    setImage(null);
    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setImage(data.image);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell slug="ai-image">
      <UpgradeGate isPro={true}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A lighthouse at dusk, watercolor style"
          rows={3}
          className="w-full bg-panel2 border border-line rounded-sm px-3 py-2 text-paper"
        />
        <button
          onClick={handleGenerate}
          disabled={busy || !prompt}
          className="mt-4 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
        >
          {busy ? "Generating…" : "Generate image"}
        </button>

        {error && (
          <p className="mt-4 text-rust text-sm">
            {error}
            {error.includes("configured") && (
              <span className="block text-dim mt-1">
                The site owner needs to add an API key — see the README.
              </span>
            )}
          </p>
        )}

        {image && (
          <div className="mt-6 text-center">
            <img src={image} alt={prompt} className="rounded-md mx-auto max-h-96" />
            <a
              href={image}
              download="generated.png"
              className="inline-block mt-4 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
            >
              Download
            </a>
          </div>
        )}
      </UpgradeGate>
    </ToolShell>
  );
}
