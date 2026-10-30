// Anime-style 2D heart: a mosaic of cel-shaded cushions with inked outlines, a glossy streak
// and a white "sticker" rim. One piece per photo; opened pieces turn pale pink with a doodle heart.
export const INK = "#0a0406";
const BASE_W = 1024, BASE_H = 920, BASE_SC = 28;
const REDS = [[226, 20, 62], [232, 28, 70], [218, 14, 56], [236, 36, 78], [210, 10, 50]];   // near-identical: pieces differ only slightly

const mulberry = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const P = (t) => [16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)];

export function star4(g, x, y, r) {
  g.beginPath();
  g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r); g.closePath();
}
export function miniHeart(g, x, y, s) {
  g.beginPath();
  g.moveTo(x, y + s * 0.9);
  g.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.9, y - s * 1.2, x, y - s * 0.4);
  g.bezierCurveTo(x + s * 0.9, y - s * 1.2, x + s * 1.5, y - s * 0.1, x, y + s * 0.9);
  g.closePath();
}

// flat: paint only the mosaic (colours, seams, opened glyphs) for use as a texture on the 3D heart; lighting,
// outline and shine then come from the 3D scene instead of being baked in.
export function createHeart(canvas, n, { mobile, isOpen, onFlush, flat = false }) {
  const Q = mobile ? 0.72 : 1;
  const W = Math.round(BASE_W * Q), H = Math.round(BASE_H * Q), SC = BASE_SC * Q;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const toPx = (x, y) => [W / 2 + x * SC, H / 2 - (y + 2.5) * SC];
  const outline = Array.from({ length: 240 }, (_, i) => toPx(...P((i / 240) * Math.PI * 2)));
  const heartPath = (g) => { g.beginPath(); outline.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };

  // mask of the heart
  const mc = document.createElement("canvas");
  mc.width = W; mc.height = H;
  const mg = mc.getContext("2d");
  heartPath(mg); mg.fill();
  const a = mg.getImageData(0, 0, W, H).data;
  const mask = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) mask[i] = a[i * 4 + 3] > 127 ? 1 : 0;

  // seeds: best-candidate spread, then Lloyd relaxation => even honeycomb-like cushions
  const rand = mulberry(1000 + n);
  const seeds = [];
  for (let i = 0; i < n; i++) {
    let best = null, bestD = -1;
    for (let k = 0; k < 25; k++) {
      let x, y;
      do { x = rand() * W; y = rand() * H; } while (!mask[(y | 0) * W + (x | 0)]);
      let d = Infinity;
      for (const s of seeds) d = Math.min(d, (s.x - x) ** 2 + (s.y - y) ** 2);
      if (d > bestD) { bestD = d; best = { x, y }; }
    }
    seeds.push(best);
  }
  const nearest = (x, y) => {
    let best = 0, bd = Infinity;
    for (let k = 0; k < n; k++) {
      const dx = seeds[k].x - x, dy = seeds[k].y - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = k; }
    }
    return best;
  };
  for (let it = 0; it < 40; it++) {
    const sx = new Float64Array(n), sy = new Float64Array(n), cnt = new Float64Array(n);
    for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x += 6) {
      if (!mask[y * W + x]) continue;
      const k = nearest(x, y);
      sx[k] += x; sy[k] += y; cnt[k]++;
    }
    for (let k = 0; k < n; k++) if (cnt[k]) seeds[k] = { x: sx[k] / cnt[k], y: sy[k] / cnt[k] };
  }

  const owner = new Int16Array(W * H).fill(-1);
  const bbox = seeds.map(() => ({ x0: W, y0: H, x1: 0, y1: 0 }));
  const area = new Float64Array(n);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!mask[y * W + x]) continue;
    const k = nearest(x, y);
    owner[y * W + x] = k; area[k]++;
    const b = bbox[k];
    if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x;
    if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y;
  }
  const edge = new Uint8Array(W * H);                 // inked lines between pieces
  const E = Math.max(1, Math.round(1.5 * Q));
  for (let y = E; y < H - E; y++) for (let x = E; x < W - E; x++) {
    const o = owner[y * W + x];
    if (o < 0) continue;
    if (owner[y * W + x + E] !== o || owner[y * W + x - E] !== o ||
        owner[(y + E) * W + x] !== o || owner[(y - E) * W + x] !== o) edge[y * W + x] = 1;
  }
  const radius = Array.from(area, (ar) => Math.sqrt(Math.max(ar, 1) / Math.PI) * 1.1);
  const base = Array.from({ length: n }, (_, k) => REDS[(((k * 2654435761) >>> 0) % REDS.length)]);

  const order = Array.from({ length: n }, (_, i) => i);   // random piece <-> photo
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const cellPhoto = order, photoCell = [];
  order.forEach((p, k) => (photoCell[p] = k));

  // ---- painting ----
  const img = ctx.createImageData(W, H);
  const px = img.data;
  let hover = -1;
  const dotP = Math.max(4, Math.round(6 * Q));

  function paintPixel(i, x, y) {
    const p = i * 4, o = owner[i];
    if (o < 0) {
      if (flat) { px[p] = 110; px[p + 1] = 8; px[p + 2] = 32; px[p + 3] = 255; }   // opaque, so texture filtering never bleeds in black
      else px[p + 3] = 0;
      return;
    }
    // shade the heart as ONE object (a single light direction across the whole shape), so the pieces read as
    // facets of one heart instead of separate fragments
    const lit = ((x - W / 2) * 0.55 + (y - H / 2) * 0.83) / (W * 0.36);   // >0 = lower-right of the heart
    const open = isOpen(cellPhoto[o]);
    let [r, g, b] = open ? [40, 12, 18] : base[o];
    if (!flat && lit > 0.3) {                          // one flat cel-shadow band + screentone dots
      r *= 0.8; g *= open ? 0.82 : 0.58; b *= open ? 0.86 : 0.66;
      const gx = (x % dotP) - dotP / 2, gy = (y % dotP) - dotP / 2;
      if (gx * gx + gy * gy < dotP * 0.45) { r *= 0.9; g *= 0.82; b *= 0.87; }
    }
    if (o === hover) { r += 38; g += 44; b += 44; }
    if (edge[i]) {                                     // thin seam in a deeper tone of the heart, not black ink
      if (o === hover) { r = 255; g = 245; b = 250; }
      else if (open) { r = 130; g = 24; b = 44; }
      else { r *= 0.62; g *= 0.5; b *= 0.55; }
    }
    px[p] = r; px[p + 1] = g; px[p + 2] = b; px[p + 3] = 255;
  }
  function paintAll() { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) paintPixel(y * W + x, x, y); }
  function paintCell(k) {
    const b = bbox[k];
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) {
      const i = y * W + x;
      if (owner[i] === k) paintPixel(i, x, y);
    }
  }

  function highlight() {                               // glossy anime streak on the upper-left lobe
    const c = [-8, 4];
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255,255,255,.94)"; ctx.lineWidth = 12 * Q;
    ctx.beginPath();
    for (let k = 0; k <= 18; k++) {
      const [x, y] = P((1.6 + 0.2 * (k / 18)) * Math.PI);
      const [qx, qy] = toPx(c[0] + (x - c[0]) * 0.8, c[1] + (y - c[1]) * 0.8);
      k ? ctx.lineTo(qx, qy) : ctx.moveTo(qx, qy);
    }
    ctx.stroke();
    const [dx, dy] = (() => { const [x, y] = P(1.53 * Math.PI); return toPx(c[0] + (x - c[0]) * 0.8, c[1] + (y - c[1]) * 0.8); })();
    ctx.lineWidth = 0; ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(dx, dy + 6 * Q, 6 * Q, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function flush() {
    ctx.putImageData(img, 0, 0);
    for (let p = 0; p < n; p++) {                      // doodle heart on opened pieces
      if (!isOpen(p)) continue;
      const s = seeds[photoCell[p]], sz = Math.min(radius[photoCell[p]] * 0.26, 34 * Q);
      ctx.fillStyle = "#ff2d55"; ctx.strokeStyle = "#fff1f3"; ctx.lineWidth = 3 * Q; ctx.lineJoin = "round";
      miniHeart(ctx, s.x, s.y, sz); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff"; star4(ctx, s.x + sz * 1.5, s.y - sz * 1.3, sz * 0.5); ctx.fill();
    }
    if (flat) { if (onFlush) onFlush(); return; }
    ctx.save();
    heartPath(ctx); ctx.lineJoin = "round"; ctx.lineWidth = 7 * Q; ctx.strokeStyle = INK; ctx.stroke();   // inked rim
    ctx.restore();
    highlight();
    ctx.save();                                        // dark outline + white sticker ring behind the heart
    ctx.globalCompositeOperation = "destination-over";
    heartPath(ctx); ctx.lineJoin = "round";
    ctx.lineWidth = 24 * Q; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = 44 * Q; ctx.strokeStyle = "#fff"; ctx.stroke();
    ctx.restore();
    if (onFlush) onFlush();
  }
  function silhouette(k, fill) {                       // flat cut-out of the heart + sticker rim, used for the solid's side wall
    const c = document.createElement("canvas");
    c.width = Math.round(W * k); c.height = Math.round(H * k);
    const g = c.getContext("2d");
    g.scale(k, k); heartPath(g);
    g.fillStyle = fill; g.fill();
    g.lineJoin = "round"; g.lineWidth = 44 * Q; g.strokeStyle = fill; g.stroke();
    return c;
  }

  function cellAtUV(u, v) {                            // u, v in 0..1 across the (unrotated) heart canvas
    const x = Math.floor(u * W), y = Math.floor(v * H);
    return x < 0 || y < 0 || x >= W || y >= H ? -1 : owner[y * W + x];
  }
  function setHover(c) {
    if (c === hover) return;
    const prev = hover;
    hover = c;
    if (prev >= 0) paintCell(prev);
    if (c >= 0) paintCell(c);
    flush();
  }
  function refresh(photoIdx) { paintCell(photoCell[photoIdx]); flush(); }

  paintAll(); flush();
  const uvOf = (x, y) => { const [px, py] = toPx(x, y); return [px / W, 1 - py / H]; };   // heart-space point -> texture uv
  return { cellPhoto, photoCell, cellAtUV, uvOf, silhouette, setHover, refresh, redraw() { paintAll(); flush(); } };
}
