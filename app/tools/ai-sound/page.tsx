"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";
import UpgradeGate from "@/components/UpgradeGate";

export default function AiSoundTool() {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setBusy(true);
    setError("");
    setAudioUrl(null);
    try {
      const res = await fetch("/api/generate/sound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // Replicate-style flow: poll the status URL until it succeeds.
      setStatus("Rendering audio…");
      let output = null;
      for (let i = 0; i < 30 && !output; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const poll = await fetch(`/api/generate/sound/status?url=${encodeURIComponent(data.statusUrl)}`);
        const pollData = await poll.json();
        if (pollData.status === "succeeded") output = pollData.output;
        if (pollData.status === "failed") throw new Error("Generation failed");
      }
      if (output) setAudioUrl(Array.isArray(output) ? output[0] : output);
      else setError("Timed out waiting for the model — try again.");
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  return (
    <ToolShell slug="ai-sound">
      <UpgradeGate isPro={true}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Calm rain on a tin roof, looping"
          rows={3}
          className="w-full bg-panel2 border border-line rounded-sm px-3 py-2 text-paper"
        />
        <button
          onClick={handleGenerate}
          disabled={busy || !prompt}
          className="mt-4 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
        >
          {busy ? status || "Working…" : "Generate sound"}
        </button>

        {error && (
          <p className="mt-4 text-rust text-sm">
            {error}
            {error.includes("configured") && (
              <span className="block text-dim mt-1">
                The site owner needs to add a provider token — see the README.
              </span>
            )}
          </p>
        )}

        {audioUrl && (
          <div className="mt-6">
            <audio controls src={audioUrl} className="w-full" />
            <a
              href={audioUrl}
              download="generated.wav"
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
