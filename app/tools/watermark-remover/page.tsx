"use client";

import { useRef, useState, useEffect } from "react";
import ToolShell from "@/components/ToolShell";
import UpgradeGate from "@/components/UpgradeGate";

export default function WatermarkRemoverTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [brush, setBrush] = useState(28);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      setResultUrl(null);
      requestAnimationFrame(() => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
      });
    };
    img.src = URL.createObjectURL(file);
  }

  function healAt(x: number, y: number) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const r = brush;
    // Sample a ring around the brush and fill the center with the blended
    // average — works well for marks over flat/soft backgrounds (the
    // common case for a logo stamped in a corner). It is not full AI
    // inpainting, so busy/detailed backgrounds will look smeared.
    const sampleR = r * 2;
    const sx = Math.max(0, x - sampleR);
    const sy = Math.max(0, y - sampleR);
    const sw = Math.min(canvas.width - sx, sampleR * 2);
    const sh = Math.min(canvas.height - sy, sampleR * 2);
    const region = ctx.getImageData(sx, sy, sw, sh);

    let rSum = 0, gSum = 0, bSum = 0, n = 0;
    const cx = x - sx, cy = y - sy;
    for (let py = 0; py < sh; py++) {
      for (let px = 0; px < sw; px++) {
        const d = Math.hypot(px - cx, py - cy);
        if (d > r && d < sampleR) {
          const idx = (py * sw + px) * 4;
          rSum += region.data[idx];
          gSum += region.data[idx + 1];
          bSum += region.data[idx + 2];
          n++;
        }
      }
    }
    if (n === 0) return;
    const avgColor = `rgba(${rSum / n}, ${gSum / n}, ${bSum / n}, 1)`;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = avgColor;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function handleDone() {
    const canvas = canvasRef.current!;
    canvas.toBlob((blob) => {
      if (blob) setResultUrl(URL.createObjectURL(blob));
    }, "image/png");
  }

  return (
    <ToolShell slug="watermark-remover">
      <UpgradeGate isPro={true}>
        <p className="text-sm text-dim -mt-2 mb-4">
          For marks on photos you own the rights to — paint over the mark and
          it blends with the surrounding area. Works best on flat backgrounds;
          it's a brush tool, not a magic eraser for busy textures.
        </p>

        {!imageEl && (
          <label className="block border-2 border-dashed border-line rounded-lg p-10 text-center cursor-pointer hover:border-amber transition-colors">
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            <p className="text-paper">Click to choose your photo</p>
          </label>
        )}

        {imageEl && !resultUrl && (
          <div>
            <label className="text-sm text-dim">Brush size ({brush}px)</label>
            <input
              type="range"
              min={10}
              max={80}
              value={brush}
              onChange={(e) => setBrush(Number(e.target.value))}
              className="w-full mb-3"
            />
            <canvas
              ref={canvasRef}
              className="max-w-full rounded-md cursor-crosshair border border-line"
              onMouseDown={(e) => {
                setDrawing(true);
                const { x, y } = getPos(e);
                healAt(x, y);
              }}
              onMouseMove={(e) => {
                if (!drawing) return;
                const { x, y } = getPos(e);
                healAt(x, y);
              }}
              onMouseUp={() => setDrawing(false)}
              onMouseLeave={() => setDrawing(false)}
            />
            <button
              onClick={handleDone}
              className="mt-6 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
            >
              Finish
            </button>
          </div>
        )}

        {resultUrl && (
          <div className="text-center">
            <img src={resultUrl} className="max-h-80 mx-auto rounded-md" />
            <a
              href={resultUrl}
              download="edited.png"
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
