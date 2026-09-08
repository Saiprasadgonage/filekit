"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import ToolShell from "@/components/ToolShell";

export default function ImageResizeTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [quality, setQuality] = useState(0.8);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResultUrl(null);
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  const onCropComplete = useCallback((_: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function getCroppedBlob(): Promise<Blob> {
    const image = await loadImage(imageSrc!);
    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95));
  }

  async function handleProcess() {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const croppedBlob = await getCroppedBlob();
      const croppedFile = new File([croppedBlob], "image.jpg", { type: "image/jpeg" });

      const compressed = await imageCompression(croppedFile, {
        maxWidthOrHeight: maxWidth,
        initialQuality: quality,
        useWebWorker: true
      });

      setResultUrl(URL.createObjectURL(compressed));
      setResultSize(compressed.size);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolShell slug="image-resize">
      {!imageSrc && (
        <label className="block border-2 border-dashed border-line rounded-lg p-10 text-center cursor-pointer hover:border-amber transition-colors">
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          <p className="text-paper">Click to choose an image</p>
          <p className="text-dim text-sm mt-1">JPG, PNG or WebP</p>
        </label>
      )}

      {imageSrc && !resultUrl && (
        <div>
          <div className="relative h-80 bg-panel2 rounded-md overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dim">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-dim">Max width (px)</label>
              <input
                type="number"
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full bg-panel2 border border-line rounded-sm px-3 py-1.5 text-paper"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm text-dim">Quality ({Math.round(quality * 100)}%)</label>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleProcess}
            disabled={busy}
            className="mt-6 bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors disabled:opacity-60"
          >
            {busy ? "Processing…" : "Crop & compress"}
          </button>
        </div>
      )}

      {resultUrl && (
        <div className="text-center">
          <img src={resultUrl} alt="Result" className="max-h-80 mx-auto rounded-md" />
          <p className="text-dim text-sm mt-3">
            {resultSize ? `${(resultSize / 1024).toFixed(0)} KB` : ""}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <a
              href={resultUrl}
              download="filekit-image.jpg"
              className="bg-amber text-ink font-medium px-5 py-2.5 rounded-sm hover:bg-amberDeep transition-colors"
            >
              Download
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
        </div>
      )}
    </ToolShell>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
