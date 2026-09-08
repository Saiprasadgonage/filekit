"use client";

import { useState } from "react";
import ToolShell from "@/components/ToolShell";

export default function NoiseReducerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [strength, setStrength] = useState(0.5); // 0..1 gate aggressiveness

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
  }

  async function handleProcess() {
    if (!file) return;
    setBusy(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new AudioContext();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);

      const offlineCtx = new OfflineAudioContext(
        decoded.numberOfChannels,
        decoded.length,
        decoded.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;

      // High-pass removes low rumble/hum; low-pass takes the edge off hiss.
      const highPass = offlineCtx.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 80 + strength * 60;

      const lowPass = offlineCtx.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = 12000 - strength * 4000;

      source.connect(highPass);
      highPass.connect(lowPass);
      lowPass.connect(offlineCtx.destination);
      source.start(0);

      const rendered = await offlineCtx.startRendering();
      const wavBlob = audioBufferToWav(rendered);
      setResultUrl(URL.createObjectURL(wavBlob));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell slug="noise-reducer">
      <p className="text-sm text-dim -mt-2 mb-4">
        Filters steady hiss, hum and rumble using frequency filtering. It won't
        remove other voices or sudden noises — that needs a full ML denoiser,
        which is a good server-side upgrade later (see README).
      </p>

      {!file && (
        <label className="block border-2 border-dashed border-line rounded-lg p-10 text-center cursor-pointer hover:border-amber transition-colors">
          <input type="file" accept="audio/*" onChange={onFile} className="hidden" />
          <p className="text-paper">Click to choose an audio file</p>
          <p className="text-dim text-sm mt-1">WAV or MP3</p>
        </label>
      )}

      {file && !resultUrl && (
        <div>
          <p className="text-paper text-sm">{file.name}</p>
          <label className="text-sm text-dim block mt-4">
            Reduction strength ({Math.round(strength * 100)}%)
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            className="w-full"
          />
          <button
            onClick={handleProcess}
            disabled={busy}
            className="mt-6 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
          >
            {busy ? "Processing…" : "Reduce noise"}
          </button>
        </div>
      )}

      {resultUrl && (
        <div>
          <audio controls src={resultUrl} className="w-full" />
          <a
            href={resultUrl}
            download="cleaned.wav"
            className="inline-block mt-4 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
          >
            Download cleaned.wav
          </a>
        </div>
      )}
    </ToolShell>
  );
}

// Minimal WAV encoder for an AudioBuffer (PCM 16-bit).
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, length - 8, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length - 44, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
