// ─── Whiteboard Canvas Engine ────────────────────────────────
// Shared types & pure render helpers used by WhiteboardTab

export type Tool =
  | "select" | "pan" | "pencil" | "eraser"
  | "rect" | "ellipse" | "diamond" | "triangle"
  | "line" | "arrow" | "text" | "sticky";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type FillStyle  = "none"  | "solid"  | "hatch";

export interface Pt { x: number; y: number }

export interface WBElement {
  id: string;
  type: Tool;
  x: number; y: number; w: number; h: number;
  points?: Pt[];
  stroke:      string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  fill:        string;
  fillStyle:   FillStyle;
  opacity:     number;
  text?:       string;
  fontSize?:   number;
  roughness?:  number; // 0 = smooth card, 2 = sketch
  isCard?:     boolean;
}

export const uid = () => Math.random().toString(36).slice(2, 9);

// ── rough offset ─────────────────────────────────────────────
const ro = (r: number) => (Math.random() - 0.5) * r * 2;

// ── geometry helpers ─────────────────────────────────────────
function roughRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + ro(r), y + ro(r));
  ctx.lineTo(x + w + ro(r), y + ro(r));
  ctx.lineTo(x + w + ro(r), y + h + ro(r));
  ctx.lineTo(x + ro(r), y + h + ro(r));
  ctx.closePath();
}

function smoothCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 10) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function roughEllipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i <= 360; i += 6) {
    const a = (i * Math.PI) / 180;
    const px = cx + rx * Math.cos(a) + ro(r);
    const py = cy + ry * Math.sin(a) + ro(r);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function arrowHead(ctx: CanvasRenderingContext2D, sx: number, sy: number, ex: number, ey: number, size = 11) {
  const ang = Math.atan2(ey - sy, ex - sx);
  const gap = 0.45;
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - size * Math.cos(ang - gap), ey - size * Math.sin(ang - gap));
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - size * Math.cos(ang + gap), ey - size * Math.sin(ang + gap));
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function applyFill(ctx: CanvasRenderingContext2D, el: WBElement) {
  if (el.fillStyle === "solid" && el.fill !== "none") {
    ctx.fillStyle = el.fill; ctx.fill();
  } else if (el.fillStyle === "hatch" && el.fill !== "none") {
    ctx.save(); ctx.clip();
    ctx.strokeStyle = el.fill; ctx.lineWidth = 1; ctx.globalAlpha *= 0.5;
    for (let i = -300; i < 600; i += 9) {
      ctx.beginPath(); ctx.moveTo(i, -100); ctx.lineTo(i + 300, 400); ctx.stroke();
    }
    ctx.restore();
  }
}

// ── Drop shadow for cards ─────────────────────────────────────
function cardShadow(ctx: CanvasRenderingContext2D, el: WBElement, size = 10) {
  ctx.shadowColor = "rgba(0,0,0,0.13)";
  ctx.shadowBlur = size;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = size / 2;
}
function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
}

// ── Main render ───────────────────────────────────────────────
export function renderEl(ctx: CanvasRenderingContext2D, el: WBElement, selected: boolean) {
  ctx.save();
  ctx.globalAlpha = el.opacity;
  ctx.strokeStyle = el.stroke;
  ctx.lineWidth = el.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(
    el.strokeStyle === "dashed" ? [el.strokeWidth * 5, el.strokeWidth * 3] :
    el.strokeStyle === "dotted" ? [el.strokeWidth, el.strokeWidth * 2.5] : []
  );

  const r = el.roughness ?? 2;
  const isSmooth = r === 0;

  switch (el.type) {
    // ── Rect / Card ──────────────────────────────────────────
    case "rect": {
      if (isSmooth) { cardShadow(ctx, el); smoothCard(ctx, el.x, el.y, el.w, el.h); }
      else roughRect(ctx, el.x, el.y, el.w, el.h, r);
      applyFill(ctx, el);
      clearShadow(ctx);
      ctx.stroke();
      if (el.text) renderCardText(ctx, el);
      break;
    }
    // ── Ellipse ──────────────────────────────────────────────
    case "ellipse": {
      const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
      if (isSmooth) { cardShadow(ctx, el, 8); ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(el.w / 2), Math.abs(el.h / 2), 0, 0, Math.PI * 2); }
      else roughEllipse(ctx, cx, cy, Math.abs(el.w / 2), Math.abs(el.h / 2), r);
      applyFill(ctx, el); clearShadow(ctx); ctx.stroke();
      if (el.text) renderCardText(ctx, el);
      break;
    }
    // ── Diamond ──────────────────────────────────────────────
    case "diamond": {
      const cx2 = el.x + el.w / 2, cy2 = el.y + el.h / 2;
      ctx.beginPath();
      ctx.moveTo(cx2 + ro(r), el.y + ro(r));
      ctx.lineTo(el.x + el.w + ro(r), cy2 + ro(r));
      ctx.lineTo(cx2 + ro(r), el.y + el.h + ro(r));
      ctx.lineTo(el.x + ro(r), cy2 + ro(r));
      ctx.closePath(); applyFill(ctx, el); ctx.stroke();
      if (el.text) renderCardText(ctx, el);
      break;
    }
    // ── Triangle ─────────────────────────────────────────────
    case "triangle": {
      ctx.beginPath();
      ctx.moveTo(el.x + el.w / 2 + ro(r), el.y + ro(r));
      ctx.lineTo(el.x + el.w + ro(r), el.y + el.h + ro(r));
      ctx.lineTo(el.x + ro(r), el.y + el.h + ro(r));
      ctx.closePath(); applyFill(ctx, el); ctx.stroke();
      break;
    }
    // ── Line ─────────────────────────────────────────────────
    case "line": {
      ctx.beginPath();
      ctx.moveTo(el.x + ro(r * 0.3), el.y + ro(r * 0.3));
      ctx.lineTo(el.x + el.w + ro(r * 0.3), el.y + el.h + ro(r * 0.3));
      ctx.stroke(); break;
    }
    // ── Arrow ────────────────────────────────────────────────
    case "arrow": {
      const ex = el.x + el.w, ey = el.y + el.h;
      ctx.beginPath();
      ctx.moveTo(el.x, el.y); ctx.lineTo(ex, ey);
      arrowHead(ctx, el.x, el.y, ex, ey);
      ctx.stroke(); break;
    }
    // ── Pencil ───────────────────────────────────────────────
    case "pencil": {
      const pts = el.points;
      if (!pts || pts.length < 2) break;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke(); break;
    }
    // ── Text ─────────────────────────────────────────────────
    case "text": {
      const fs = el.fontSize ?? 16;
      ctx.font = `400 ${fs}px Inter, sans-serif`;
      ctx.fillStyle = el.stroke; ctx.globalAlpha = el.opacity;
      (el.text || "Text").split("\n").forEach((line, i) => {
        ctx.fillText(line, el.x, el.y + fs + i * (fs + 4));
      }); break;
    }
    // ── Sticky ───────────────────────────────────────────────
    case "sticky": {
      cardShadow(ctx, el, 14);
      ctx.fillStyle = el.fill !== "none" ? el.fill : "#fef08a";
      ctx.beginPath(); ctx.roundRect(el.x, el.y, el.w, el.h, 4); ctx.fill();
      clearShadow(ctx);
      if (el.text) {
        ctx.font = "400 13px Inter, sans-serif"; ctx.fillStyle = "#1e293b"; ctx.globalAlpha = 1;
        el.text.split("\n").forEach((l, i) => ctx.fillText(l, el.x + 12, el.y + 28 + i * 18));
      } break;
    }
  }

  // ── Selection ring ────────────────────────────────────────
  if (selected) {
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.9;
    const p = 7;
    ctx.strokeRect(el.x - p, el.y - p, el.w + p * 2, el.h + p * 2);
    ctx.setLineDash([]);
    ctx.fillStyle = "#fff";
    [[el.x - p, el.y - p], [el.x + el.w + p, el.y - p],
     [el.x - p, el.y + el.h + p], [el.x + el.w + p, el.y + el.h + p]].forEach(([hx, hy]) => {
      ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
    });
  }
  ctx.restore();
}

function renderCardText(ctx: CanvasRenderingContext2D, el: WBElement) {
  const fs = el.fontSize ?? 13;
  ctx.setLineDash([]);
  const bold = (el.strokeWidth ?? 1.5) >= 2;
  ctx.font = `${bold ? "600" : "400"} ${fs}px Inter, sans-serif`;
  // Auto-detect text color
  const darkFill = el.fill !== "none" && el.fill !== "#ffffff" && el.fill !== "#f8fafc" && el.fill !== "white";
  ctx.fillStyle = darkFill && el.fill?.startsWith("#f") ? "#7c2d12" : "#1e293b";
  ctx.globalAlpha = 1;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const lines = wrapText(ctx, el.text ?? "", el.w - 18);
  const lh = fs + 4;
  const totalH = lines.length * lh;
  lines.forEach((line, i) =>
    ctx.fillText(line, el.x + el.w / 2, el.y + el.h / 2 - totalH / 2 + i * lh + lh / 2)
  );
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}

// ── Hit test ──────────────────────────────────────────────────
export function hitTest(el: WBElement, p: Pt, pad = 6): boolean {
  if (el.type === "pencil") return el.points?.some(pt => Math.hypot(pt.x - p.x, pt.y - p.y) < 12) ?? false;
  return p.x >= el.x - pad && p.x <= el.x + el.w + pad && p.y >= el.y - pad && p.y <= el.y + el.h + pad;
}

// ── Dot grid ──────────────────────────────────────────────────
export function drawDotGrid(ctx: CanvasRenderingContext2D, w: number, h: number, pan: Pt, zoom: number, size = 20) {
  const gs = size * zoom;
  const offX = ((pan.x % gs) + gs) % gs;
  const offY = ((pan.y % gs) + gs) % gs;
  ctx.fillStyle = "rgba(100,116,139,0.3)";
  for (let x = offX; x < w; x += gs)
    for (let y = offY; y < h; y += gs) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
}
