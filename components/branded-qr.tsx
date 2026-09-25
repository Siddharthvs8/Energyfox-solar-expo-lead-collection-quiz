"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

const NAVY = "#192649";
const SUN = "#F99D1C";

/**
 * Draws a QR code with rounded modules, navy finder patterns and the
 * Energyfox sun in the middle. Error correction "H" (30%) keeps it scannable
 * with the logo covering the centre.
 */
function drawBrandedQr(canvas: HTMLCanvasElement, url: string, size: number) {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const quiet = 4;
  const cell = size / (n + quiet * 2);

  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, cell * 2.5);
  ctx.fill();

  const isFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  // Leave a square in the middle free for the logo. QR sizes are always odd,
  // so an odd logo size keeps it exactly centred.
  const logoModules = Math.floor(n * 0.24) | 1;
  const logoStart = (n - logoModules) / 2;
  const isLogo = (r: number, c: number) =>
    r >= logoStart && r < logoStart + logoModules && c >= logoStart && c < logoStart + logoModules;

  // Softly rounded but touching modules: separated "dot" styles decode far
  // less reliably. Edges are snapped to whole pixels to avoid hairline seams.
  ctx.fillStyle = NAVY;
  const edge = (i: number) => Math.round((i + quiet) * cell);
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c) || isFinder(r, c) || isLogo(r, c)) continue;
      ctx.beginPath();
      ctx.roundRect(edge(c), edge(r), edge(c + 1) - edge(c), edge(r + 1) - edge(r), cell * 0.18);
      ctx.fill();
    }
  }

  for (const [r, c] of [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]) {
    const x = (c + quiet) * cell;
    const y = (r + quiet) * cell;
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.roundRect(x, y, cell * 7, cell * 7, cell * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(x + cell, y + cell, cell * 5, cell * 5, cell * 1.4);
    ctx.fill();
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.roundRect(x + cell * 2, y + cell * 2, cell * 3, cell * 3, cell);
    ctx.fill();
  }

  // Logo: white disc + sun mark (same geometry as <LogoMark />).
  const center = size / 2;
  const logoSize = logoModules * cell;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(center, center, logoSize * 0.5, 0, Math.PI * 2);
  ctx.fill();
  const mark = logoSize * 0.78;
  ctx.save();
  ctx.translate(center - mark / 2, center - mark / 2);
  ctx.scale(mark / 100, mark / 100);
  ctx.strokeStyle = SUN;
  ctx.lineCap = "round";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(50, 50, 45.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.stroke(new Path2D("M50 24v25M19.5 46 33 59M80.5 46 67 59"));
  ctx.restore();
}

/** High-resolution PNG (data URL) for downloading or printing. */
export function brandedQrPng(url: string, size = 1600) {
  const canvas = document.createElement("canvas");
  drawBrandedQr(canvas, url, size);
  return canvas.toDataURL("image/png");
}

export function BrandedQr({ url, className = "", label }: { url: string; className?: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) drawBrandedQr(ref.current, url, 1000);
  }, [url]);

  return <canvas ref={ref} role="img" aria-label={label} className={`aspect-square ${className}`} />;
}
