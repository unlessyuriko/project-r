// Anime backdrop: dusk sky, moon, twinkling stars, drifting clouds, a flat-colour Yangon skyline
// (Shwedagon, Sule, colonial buildings, palms, Circular Railway); the snow is drawn by the 3D scene.
import { INK, star4 } from "./heart.js";

const TAU = Math.PI * 2;
const mulberry = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const canvasOf = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };

// ---------- sprites ----------
function cloudSprite() {
  const c = canvasOf(300, 120), g = c.getContext("2d");
  const blob = (col, dy) => {
    g.fillStyle = col;
    [[70, 80, 44], [120, 62, 56], [180, 70, 50], [228, 84, 38], [150, 90, 50]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y + dy, r, 0, TAU); g.fill(); });
    g.fillRect(60, 86 + dy, 190, 34);
  };
  blob("#b79ae0", 6); blob("#ffe3f0", -2);
  return c;
}

// ---------- skyline shapes (flat colour + one shadow band + inked outline) ----------
function stupa(g, x, base, s, prof, c) {
  const path = new Path2D();
  prof.forEach(([r, y], i) => { const X = x - r * s, Y = base - y * s; i ? path.lineTo(X, Y) : path.moveTo(X, Y); });
  for (let i = prof.length - 1; i >= 0; i--) path.lineTo(x + prof[i][0] * s, base - prof[i][1] * s);
  path.closePath();
  g.fillStyle = c.fill; g.fill(path);
  g.save(); g.clip(path);
  if (c.hi) { g.fillStyle = c.hi; g.fillRect(x - 60 * s, base - 110 * s, 60 * s - s * 0.4, 120 * s); }   // lit left side
  g.fillStyle = c.shade; g.fillRect(x + s * 0.5, base - 110 * s, 200 * s, 120 * s);                  // cel shadow right side
  if (c.bands) {                                    // gold ring mouldings
    g.strokeStyle = c.line; g.lineWidth = Math.max(1, s * 0.3);
    for (const y of c.bands) { g.beginPath(); g.moveTo(x - 60 * s, base - y * s); g.lineTo(x + 60 * s, base - y * s); g.stroke(); }
  }
  g.restore();
  g.lineJoin = "round"; g.lineWidth = Math.max(1.5, s * 0.55); g.strokeStyle = c.line; g.stroke(path);
}
// Shwedagon, height 100: stepped square terraces, octagonal terraces, concave bell, ring mouldings,
// inverted bowl, lotus petals, tapering spire rings, tiered hti umbrella, vane and diamond bud.
const SHW_BANDS = [];
const shwProf = () => {
  const p = [[40, 0], [40, 3], [35, 3], [35, 6], [30, 6], [30, 9], [23, 9], [23, 12], [20.5, 12], [20.5, 15]];
  for (let i = 0; i <= 28; i++) { const u = i / 28; p.push([8.4 + 11.6 * Math.pow(1 - u, 1.7), 15 + 31 * u]); }   // bell
  for (const [r, y] of [[9.6, 46], [9.6, 47.2], [8.2, 47.2], [8.2, 48.4], [9.2, 48.4], [9.2, 49.6], [7.8, 49.6], [7.8, 51]]) { p.push([r, y]); if (y > 47) SHW_BANDS.push(y); }
  for (let i = 0; i <= 8; i++) { const u = i / 8; p.push([7.8 + 1.6 * Math.sin(u * Math.PI * 0.9), 51 + 6 * u]); }  // inverted bowl
  for (let i = 0; i <= 8; i++) { const u = i / 8; p.push([8.6 - 4.2 * Math.pow(u, 0.8), 57 + 4 * u]); SHW_BANDS.push(57 + 4 * u); }   // lotus petals
  for (let i = 0; i <= 26; i++) { const u = i / 26; let r = 4.2 * Math.pow(1 - u, 1.3) + 1.7; if (i % 2) r *= 0.9; p.push([r, 61 + 19 * u]); if (i % 2 === 0) SHW_BANDS.push(61 + 19 * u); }   // spire rings
  for (let k = 0; k < 4; k++) { const y = 80 + k * 3.4; p.push([5.3 - k * 0.9, y], [4.6 - k * 0.9, y + 0.8], [2.2, y + 1.8]); }     // hti tiers
  p.push([0.7, 93.6], [1.5, 94.6], [1.7, 96.4], [0.8, 98.4], [0, 100]);                                                              // vane + bud
  return p;
};
const suleProf = () => {
  const p = [[8, 0], [8, 2], [6.4, 2], [6.4, 4], [6.2, 4], [6.2, 14]];
  for (let i = 0; i <= 16; i++) { const u = i / 16; let r = 5.8 * Math.pow(1 - u, 0.9) + 0.7; if (i % 3 === 0) r *= 1.12; p.push([r, 14 + 22 * u]); }
  p.push([1.2, 36], [1.2, 37], [0.3, 39], [0, 41]);
  return p;
};
const SHW = shwProf(), SULE = suleProf(), MINI = [[2.4, 0], [2.4, 1], [1.6, 1], [0, 10]];

function colonial(g, x, base, bw, bh, tower, pal, rnd) {
  g.lineJoin = "round"; g.lineWidth = 2; g.strokeStyle = pal.line;
  g.fillStyle = pal.wall; g.fillRect(x - bw / 2, base - bh, bw, bh); g.strokeRect(x - bw / 2, base - bh, bw, bh);
  g.fillStyle = pal.shade; g.fillRect(x + bw * 0.18, base - bh, bw * 0.32, bh);
  g.fillStyle = pal.roof; g.fillRect(x - bw / 2 - 3, base - bh - bh * 0.1, bw + 6, bh * 0.1); g.strokeRect(x - bw / 2 - 3, base - bh - bh * 0.1, bw + 6, bh * 0.1);
  const cols = Math.max(2, Math.round(bw / (bh * 0.42))), rows = bh > 70 ? 2 : 1;
  const cw = bw / cols, ww = cw * 0.4, wh = (bh * 0.8) / rows * 0.62;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const wx = x - bw / 2 + cw * c + (cw - ww) / 2, wy = base - bh + bh * 0.16 + r * ((bh * 0.8) / rows);
    const lit = rnd() < 0.66;
    g.fillStyle = lit ? "#ffd27a" : pal.window;
    if (lit && pal.wins) pal.wins.push([wx + ww / 2, wy + wh * 0.55, Math.max(ww, wh), rnd() * 6.28, 0.6 + rnd() * 1.6]);
    g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx, wy + ww / 2); g.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); g.lineTo(wx + ww, wy + wh); g.closePath(); g.fill();
  }
  if (tower) {                                        // pyatthat: stacked Burmese roof tiers
    let y = base - bh - bh * 0.1;
    for (let k = 0; k < 3; k++) {
      const tw = bw * (0.46 - k * 0.12), th = bh * 0.2;
      g.fillStyle = pal.wall; g.fillRect(x - tw / 2, y - th, tw, th); g.strokeRect(x - tw / 2, y - th, tw, th);
      g.beginPath(); g.moveTo(x - tw * 0.8, y - th); g.lineTo(x, y - th - th * 1.1); g.lineTo(x + tw * 0.8, y - th); g.closePath();
      g.fillStyle = pal.roof; g.fill(); g.stroke();
      y -= th * 2.1;
    }
    g.fillStyle = pal.gold; g.fillRect(x - 1.5, y - bh * 0.22, 3, bh * 0.22);
  }
}
function glowSprite() {
  const c = canvasOf(64, 64), g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,226,150,1)"); r.addColorStop(0.25, "rgba(255,200,110,.45)"); r.addColorStop(1, "rgba(255,190,100,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return c;
}
function tower(g, x, base, bw, bh, pal, rnd, wins, crown) {
  g.lineJoin = "round"; g.lineWidth = 1.6; g.strokeStyle = pal.line;
  g.fillStyle = pal.wall; g.fillRect(x - bw / 2, base - bh, bw, bh); g.strokeRect(x - bw / 2, base - bh, bw, bh);
  g.fillStyle = pal.shade; g.fillRect(x + bw * 0.12, base - bh, bw * 0.38, bh);
  if (crown === 1) { g.fillStyle = pal.wall; g.fillRect(x - bw * 0.3, base - bh - bw * 0.22, bw * 0.6, bw * 0.22); g.strokeRect(x - bw * 0.3, base - bh - bw * 0.22, bw * 0.6, bw * 0.22); }
  if (crown === 2) { g.beginPath(); g.moveTo(x - bw / 2, base - bh); g.lineTo(x, base - bh - bw * 0.7); g.lineTo(x + bw / 2, base - bh); g.closePath(); g.fillStyle = pal.shade; g.fill(); g.stroke(); }
  if (crown === 3) { g.fillStyle = pal.line; g.fillRect(x - 1, base - bh - bw * 0.9, 2, bw * 0.9); g.fillStyle = "#ff6f8f"; g.fillRect(x - 2, base - bh - bw * 0.9 - 3, 4, 4); }
  const ww = Math.max(3, bw * 0.13), gap = ww * 1.9, cols = Math.max(2, Math.floor((bw - ww) / gap)), rows = Math.floor((bh - 14) / (ww * 2.3));
  const x0 = x - bw / 2 + (bw - (cols - 1) * gap - ww) / 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const wx = x0 + c * gap, wy = base - bh + 9 + r * ww * 2.3, lit = rnd() < 0.55;
    g.fillStyle = lit ? (rnd() < 0.3 ? "#ffb6c8" : "#ffd27a") : pal.window;
    g.fillRect(wx, wy, ww, ww * 1.3);
    if (lit && rnd() < 0.1 && wins) wins.push([wx + ww / 2, wy + ww * 0.65, ww * 1.2, rnd() * 6.28, 0.5 + rnd() * 1.5]);
  }
}
function palm(g, x, base, ht, color) {
  g.strokeStyle = color; g.lineCap = "round"; g.lineWidth = Math.max(3, ht * 0.045);
  const tx = x + ht * 0.1, ty = base - ht;
  g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x - ht * 0.04, base - ht * 0.55, tx, ty); g.stroke();
  g.lineWidth = Math.max(2.5, ht * 0.03);
  for (const [a, l] of [[-2.9, 0.3], [-2.4, 0.34], [-1.9, 0.3], [-1.2, 0.3], [-0.7, 0.34], [-0.2, 0.3], [-1.57, 0.2]]) {
    const ex = tx + Math.cos(a) * ht * l, ey = ty + Math.sin(a) * ht * l + ht * 0.14;
    g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * ht * l * 0.5, ty + Math.sin(a) * ht * l * 0.5 - ht * 0.1, ex, ey); g.stroke();
  }
}

export function createBackdrop(canvas, { mobile, getRect }) {
  const ctx = canvas.getContext("2d");
  const dprMax = mobile ? 1.5 : 2;
  let w = 0, h = 0, dpr = 1, stat = null, t = 0, last = 0, trainY = 0, trainH = 20;
  let paused = false, raf = 0, stars = [], clouds = [];
  const cloudImg = cloudSprite(), glow = glowSprite();
  const billImg = new Image();                          // the couple's picture on the rooftop billboard
  billImg.onload = () => { if (w) build(); };
  billImg.src = "billboard.jpg";
  let bill = null;
  let wins = [], bulbs = [], lantern = [], lake = { y0: 0, mx: 0, sx: 0, lh: 0 };

  function build() {
    const R = mulberry(11);
    stat = canvasOf(w * dpr, h * dpr);
    const g = stat.getContext("2d");
    g.scale(dpr, dpr);

    // sky
    const sky = g.createLinearGradient(0, 0, 0, h);
    [[0, "#150c3f"], [0.42, "#2f1868"], [0.68, "#6f2a86"], [0.86, "#c94d80"], [1, "#ff9a7b"]].forEach(([o, c]) => sky.addColorStop(o, c));
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    const wide = w / h > 1.1;
    const gx = w * (wide ? 0.24 : 0.3), gy = h * 0.7;
    const glow = g.createRadialGradient(gx, gy, 0, gx, gy, h * 0.6);
    glow.addColorStop(0, "rgba(255,176,130,.6)"); glow.addColorStop(1, "rgba(255,176,130,0)");
    g.fillStyle = glow; g.fillRect(0, 0, w, h);
    // moon
    const mr = Math.max(24, Math.min(w, h) * 0.07), mx = w * 0.84, my = h * 0.15;
    const mg = g.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3.4);
    mg.addColorStop(0, "rgba(255,244,200,.45)"); mg.addColorStop(1, "rgba(255,244,200,0)");
    g.fillStyle = mg; g.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
    g.fillStyle = "#fff3c9"; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
    g.fillStyle = "#f2dca0"; [[-0.3, -0.2, 0.2], [0.25, 0.25, 0.28], [0.3, -0.35, 0.12]].forEach(([a, b, r]) => { g.beginPath(); g.arc(mx + a * mr, my + b * mr, r * mr, 0, TAU); g.fill(); });
    g.lineWidth = 2.5; g.strokeStyle = "rgba(58,10,36,.7)"; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.stroke();

    // one skyline layer: draw onto its own canvas so a haze can tint only the buildings
    const layer = (draw, hazeA) => {
      const lc = canvasOf(w * dpr, h * dpr), lg = lc.getContext("2d");
      lg.scale(dpr, dpr); draw(lg);
      lg.setTransform(1, 0, 0, 1, 0, 0);
      lg.globalCompositeOperation = "source-atop"; lg.fillStyle = `rgba(122,42,134,${hazeA})`; lg.fillRect(0, 0, lc.width, lc.height);
      g.drawImage(lc, 0, 0, w, h);
    };
    const gold = { fill: "#d6aa5c", shade: "#a37a3c", line: "#2a1250" };
    const farBase = h * 0.68, midBase = h * 0.75, nearBase = h * 0.82;
    wins = []; bulbs = [];
    const sx = w * (wide ? 0.17 : 0.3), ss = Math.min((h * 0.5) / 100, sx / 30);   // beside the heart so the whole pagoda reads
    const sg = g.createRadialGradient(sx, farBase - 50 * ss, 0, sx, farBase - 50 * ss, 80 * ss);   // golden glow around the pagoda
    sg.addColorStop(0, "rgba(255,205,110,.45)"); sg.addColorStop(1, "rgba(255,205,110,0)");
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    layer((l) => {                                     // far: tall city towers
      const tp = { wall: "#3b2a7a", shade: "#2f2166", line: "#241552", window: "#2a1b5c" };
      const n = wide ? 15 : 9, rt = mulberry(23);
      for (let i = 0; i < n; i++) {
        const fx = (i + 0.5) / n + (rt() - 0.5) * 0.02, bw = (w / n) * (0.7 + rt() * 0.45);
        const tall = Math.exp(-Math.pow((fx - sx / w) / 0.3, 2)) * 0.5 + 0.5, bh = h * (0.14 + rt() * 0.16) * (0.65 + tall * 0.7);
        tower(l, w * fx, farBase, bw, bh, tp, rt, wins, bh > h * 0.26 ? 3 : Math.floor(rt() * 3));
      }
      l.fillStyle = "#3d2070"; l.fillRect(0, farBase - 2, w, h);
    }, 0.1);
    layer((l) => {                                     // mid: Sule + colonial rows
      const pal = { wins, wall: "#4a2a82", shade: "#3a2070", roof: "#321a60", window: "#24123f", line: "#220f45", gold: "#d6aa5c" };
      const s = (h * 0.27) / 41;
      const bh = h * 0.12;
      [[0.46, 0.45, false], [0.57, 0.5, true], [0.68, 0.4, false], [0.9, 0.5, true], [0.97, 0.36, false]].forEach(([fx, ws, tw]) => colonial(l, w * fx, midBase, bh * 1.9 * ws * 1.4, bh * (0.8 + ws * 0.4), tw, pal, R));
      l.fillStyle = "#2c1658"; l.fillRect(0, midBase - 2, w, h);
      // fairy lights: swags between the roofs; bulbs are drawn (and twinkled) per frame
      const top = (ws) => midBase - bh * (0.8 + ws * 0.4) * 1.12;
      const pts = [[w * 0.05, nearBase - h * 0.2], [w * 0.46, top(0.45)], [w * 0.57, top(0.5) - bh * 0.35], [w * 0.68, top(0.4)], [w * 0.9, top(0.5) - bh * 0.35], [w * 1.02, top(0.36)]];
      l.strokeStyle = "rgba(20,8,44,.75)"; l.lineWidth = 1.2;
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], sag = Math.min(h * 0.07, Math.abs(x2 - x1) * 0.16);
        const N = Math.max(4, Math.round(Math.abs(x2 - x1) / 15));
        l.beginPath(); l.moveTo(x1, y1);
        for (let k = 1; k <= N; k++) { const u = k / N; l.lineTo(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u + Math.sin(u * Math.PI) * sag); }
        l.stroke();
        for (let k = 1; k < N; k++) { const u = k / N; bulbs.push([x1 + (x2 - x1) * u, y1 + (y2 - y1) * u + Math.sin(u * Math.PI) * sag + 3, (i + k) % 3, R() * 6.28]); }
      }
    }, 0.2);
    layer((l) => {                                     // near: palms + ground
      [[0.03, 0.26], [0.1, 0.19], [0.93, 0.24], [0.99, 0.17], [0.5, 0.12], [0.63, 0.14]].forEach(([fx, hf]) => palm(l, w * fx, nearBase + 4, h * hf, "#1d0e3a"));
      l.fillStyle = "#1d0e3a"; l.fillRect(0, nearBase, w, 9);                // the bank; the lake starts below it
      l.fillStyle = "#2a1650"; l.fillRect(0, nearBase, w, 3);
    }, 0.05);
    // billboard: a tall tower with the couple's picture on top, lit by a row of lamps
    bill = null;
    if (billImg.complete && billImg.naturalWidth) {
      const bh2 = wide ? Math.min(h * 0.25, w * 0.62) : Math.min(h * 0.17, w * 0.3 * 1.5), bw2 = bh2 * 0.667, bx = wide ? Math.max(bw2 * 0.62, w * 0.17) : w * 0.8, by = h * (wide ? 0.13 : 0.42);
      const fh = bh2 + bw2 * 0.34, frameB = by + fh, towerTop = frameB + bh2 * 0.1, rb = mulberry(31);
      tower(g, bx, farBase, bw2 * 0.78, farBase - towerTop, { wall: "#3b2a7a", shade: "#2f2166", line: "#241552", window: "#2a1b5c" }, rb, wins, 0);
      g.fillStyle = "#1c0f3e"; g.fillRect(bx - bw2 * 0.28, frameB, 3, towerTop - frameB + 2); g.fillRect(bx + bw2 * 0.28 - 3, frameB, 3, towerTop - frameB + 2);   // posts
      const fx = bx - bw2 / 2 - 6, fw = bw2 + 12;
      const bg2 = g.createRadialGradient(bx, by + fh / 2, 0, bx, by + fh / 2, bw2 * 1.5);                // warm light spilling around the sign
      bg2.addColorStop(0, "rgba(255,200,140,.3)"); bg2.addColorStop(1, "rgba(255,200,140,0)");
      g.fillStyle = bg2; g.fillRect(bx - bw2 * 1.6, by - bw2 * 0.6, bw2 * 3.2, fh + bw2 * 1.2);
      g.fillStyle = "#1c0f3e"; g.beginPath(); g.roundRect(fx, by, fw, fh, 8); g.fill();
      g.strokeStyle = "#ffd27a"; g.lineWidth = 2; g.beginPath(); g.roundRect(fx + 2, by + 2, fw - 4, fh - 4, 7); g.stroke();
      g.save(); g.beginPath(); g.roundRect(bx - bw2 / 2, by + 6, bw2, bh2 - 6, 5); g.clip();
      const ir = billImg.naturalWidth / billImg.naturalHeight, tw = bw2, th = tw / ir;
      g.drawImage(billImg, bx - bw2 / 2, by + 6 + (bh2 - 6 - th) / 2, tw, th); g.restore();
      const fs = Math.max(7, bw2 * 0.064);                                                              // caption plate under the picture
      g.fillStyle = "#fff3d6"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `900 ${fs}px "Zen Maru Gothic", system-ui, sans-serif`;
      g.fillText("Ye Pyae ♥ May Thu", bx, by + bh2 + (fh - bh2) * 0.3);
      g.fillStyle = "#ffb6c8"; g.font = `700 ${fs * 0.8}px "Zen Maru Gothic", system-ui, sans-serif`;
      g.fillText("since 1 Aug 2026", bx, by + bh2 + (fh - bh2) * 0.72);
      for (let i = 0; i < 7; i++) bulbs.push([fx + 6 + (fw - 12) * (i / 6), by - 2, i % 3, rb() * 6.28]);   // lamps along the top edge
      bill = { x: bx, y: by + fh / 2, r: bw2 };
    }
    // lake: a mirrored copy of the scene above the shore, tinted, with ripples
    const y0 = nearBase + 9, lh = h - y0;
    const snap = canvasOf(w * dpr, h * dpr); snap.getContext("2d").drawImage(stat, 0, 0);
    const wg = g.createLinearGradient(0, y0, 0, h); wg.addColorStop(0, "#43267f"); wg.addColorStop(1, "#150a33");
    g.fillStyle = wg; g.fillRect(0, y0, w, lh);
    g.save(); g.beginPath(); g.rect(0, y0, w, lh); g.clip();
    g.globalAlpha = 0.4; g.translate(0, 2 * y0); g.scale(1, -1); g.drawImage(snap, 0, 0, w, h); g.restore();
    const wt = g.createLinearGradient(0, y0, 0, h); wt.addColorStop(0, "rgba(60,30,120,.15)"); wt.addColorStop(1, "rgba(14,6,34,.7)");
    g.fillStyle = wt; g.fillRect(0, y0, w, lh);
    g.strokeStyle = "rgba(255,225,200,.14)"; g.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) { const ry = y0 + 6 + R() * (lh - 8), rx = R() * w, rl = 14 + R() * 46; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + rl, ry); g.stroke(); }
    g.fillStyle = "rgba(255,200,150,.35)"; g.fillRect(0, y0, w, 1.5);
    lake = { y0, mx, sx, lh };
    lantern = Array.from({ length: mobile ? 4 : 7 }, () => ({ x: R() * w, y: R() * h, s: 0.7 + R() * 0.6, v: 10 + R() * 12, ph: R() * 6.28, hue: R() < 0.5 ? 0 : 1 }));
    trainY = nearBase; trainH = Math.max(26, h * 0.06);
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, dprMax);
    w = document.documentElement.clientWidth || innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    build();
    const R = mulberry(5);
    stars = Array.from({ length: mobile ? 34 : 64 }, () => ({ x: R() * w, y: R() * h * 0.55, r: 1.5 + R() * 3.5, sp: 0.8 + R() * 2, ph: R() * TAU }));
    clouds = Array.from({ length: mobile ? 4 : 6 }, (_, i) => ({ x: R() * w, y: h * (0.06 + R() * 0.34), s: 0.45 + R() * 0.6, v: 5 + R() * 9, a: 0.5 + R() * 0.35, i }));
  }

  let puffs = [], puffAt = 0;
  function wheel(g, x, y, r, hub) {
    g.fillStyle = "#140a1c"; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.fillStyle = hub; g.beginPath(); g.arc(x, y, r * 0.45, 0, TAU); g.fill();
  }
  function train(g, dt) {
    const ch = trainH, cw = ch * 2.7, y = trainY - ch - 2, nCar = 4, lw = cw * 1.25, gap = 3;
    const total = (cw + gap) * nCar + lw, x0 = ((t * 28) % (w + total * 2)) - total * 1.4;
    const lx = x0 + (cw + gap) * nCar, front = lx + lw, wr = ch * 0.17;
    g.save(); g.lineJoin = "round"; g.lineWidth = 2; g.strokeStyle = "#140a1c";
    for (let i = 0; i < nCar; i++) {                   // scarlet carriages with a gold stripe and lit windows
      const x = x0 + i * (cw + gap);
      g.fillStyle = "#a8142c"; g.fillRect(x, y + ch * 0.08, cw, ch * 0.78); g.strokeRect(x, y + ch * 0.08, cw, ch * 0.78);
      g.fillStyle = "#2a0d18"; g.fillRect(x - 1, y, cw + 2, ch * 0.12);
      g.fillStyle = "#e8b04a"; g.fillRect(x, y + ch * 0.62, cw, ch * 0.05);
      for (let k = 0; k < 4; k++) { g.fillStyle = "#ffd890"; g.beginPath(); g.roundRect(x + cw * (0.1 + k * 0.22), y + ch * 0.22, cw * 0.14, ch * 0.3, 2); g.fill(); }
      wheel(g, x + cw * 0.2, y + ch * 0.9, wr, "#a8142c"); wheel(g, x + cw * 0.8, y + ch * 0.9, wr, "#a8142c");
    }
    // locomotive: cab at the back, boiler, tall chimney, brass dome, cowcatcher and the lamp at the front
    g.fillStyle = "#7a1020"; g.fillRect(lx, y - ch * 0.04, lw * 0.3, ch * 0.9); g.strokeRect(lx, y - ch * 0.04, lw * 0.3, ch * 0.9);
    g.fillStyle = "#1a0b16"; g.fillRect(lx - 2, y - ch * 0.12, lw * 0.3 + 4, ch * 0.1);
    g.fillStyle = "#ffd890"; g.beginPath(); g.roundRect(lx + lw * 0.06, y + ch * 0.12, lw * 0.16, ch * 0.3, 2); g.fill();
    g.fillStyle = "#b01830"; g.beginPath(); g.roundRect(lx + lw * 0.3, y + ch * 0.26, lw * 0.64, ch * 0.6, ch * 0.2); g.fill(); g.stroke();
    g.fillStyle = "#e8b04a"; g.fillRect(lx + lw * 0.52, y + ch * 0.27, 3, ch * 0.58); g.fillRect(lx + lw * 0.74, y + ch * 0.27, 3, ch * 0.58);
    g.fillStyle = "#14091a"; g.beginPath(); g.roundRect(lx + lw * 0.82, y + ch * 0.28, lw * 0.14, ch * 0.56, ch * 0.12); g.fill(); g.stroke();   // smokebox
    const cx = lx + lw * 0.74, ctop = y + ch * 0.26;                          // chimney with a flared top
    g.fillStyle = "#14091a"; g.fillRect(cx - ch * 0.07, ctop - ch * 0.26, ch * 0.14, ch * 0.28);
    g.beginPath(); g.moveTo(cx - ch * 0.07, ctop - ch * 0.26); g.lineTo(cx - ch * 0.14, ctop - ch * 0.4); g.lineTo(cx + ch * 0.14, ctop - ch * 0.4); g.lineTo(cx + ch * 0.07, ctop - ch * 0.26); g.closePath(); g.fill();
    g.fillStyle = "#e8b04a"; g.beginPath(); g.arc(lx + lw * 0.5, y + ch * 0.26, ch * 0.1, Math.PI, 0); g.fill();
    g.fillStyle = "#14091a"; g.beginPath(); g.moveTo(front, y + ch * 0.86); g.lineTo(front + ch * 0.28, y + ch * 0.93); g.lineTo(front, y + ch * 0.93); g.closePath(); g.fill();
    wheel(g, lx + lw * 0.2, y + ch * 0.86, wr * 1.5, "#a8142c"); wheel(g, lx + lw * 0.52, y + ch * 0.88, wr * 1.2, "#a8142c"); wheel(g, lx + lw * 0.84, y + ch * 0.88, wr * 1.2, "#a8142c");
    const hx = front + 1, hy = y + ch * 0.5;                                   // the headlight, on the nose
    g.fillStyle = "#fff6c8"; g.beginPath(); g.arc(hx, hy, ch * 0.09, 0, TAU); g.fill();
    const beam = g.createLinearGradient(hx, 0, hx + ch * 5.5, 0); beam.addColorStop(0, "rgba(255,240,180,.55)"); beam.addColorStop(1, "rgba(255,240,180,0)");
    g.fillStyle = beam; g.beginPath(); g.moveTo(hx, hy - ch * 0.05); g.lineTo(hx + ch * 5.5, hy - ch * 0.9); g.lineTo(hx + ch * 5.5, hy + ch * 0.9); g.lineTo(hx, hy + ch * 0.05); g.closePath(); g.fill();
    const hl = g.createRadialGradient(hx, hy, 0, hx, hy, ch * 1.4); hl.addColorStop(0, "rgba(255,240,180,.75)"); hl.addColorStop(1, "rgba(255,240,180,0)");
    g.fillStyle = hl; g.fillRect(hx - ch * 1.4, hy - ch * 1.4, ch * 2.8, ch * 2.8);
    // steam from the chimney, left behind in the air as the train moves on
    puffAt -= dt;
    if (puffAt <= 0) { puffs.push({ x: cx, y: ctop - ch * 0.42, r: ch * 0.14, a: 0.8 }); puffAt = 0.16; }
    for (const p of puffs) { p.y -= ch * 0.55 * dt; p.x -= ch * 0.18 * dt; p.r += ch * 0.22 * dt; p.a -= dt * 0.3; }
    puffs = puffs.filter((p) => p.a > 0);
    for (const p of puffs) { g.globalAlpha = p.a * 0.7; g.fillStyle = "#f6e6f0"; g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    g.restore();
  }

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (paused) { last = ts; return; }
    if (mobile && ts - last < 32) return;              // ~30fps on phones
    const dt = Math.min((ts - last) / 1000, 0.06); last = ts; t += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(stat, 0, 0, w, h);

    ctx.fillStyle = "#fff";                            // twinkling stars
    for (const s of stars) { ctx.globalAlpha = 0.3 + 0.7 * (Math.sin(t * s.sp + s.ph) * 0.5 + 0.5); star4(ctx, s.x, s.y, s.r); ctx.fill(); }
    for (const c of clouds) {                          // drifting flat clouds
      c.x += c.v * dt; if (c.x > w + 160) c.x = -320 * c.s;
      ctx.globalAlpha = c.a; ctx.drawImage(cloudImg, c.x, c.y, 300 * c.s, 120 * c.s);
    }
    ctx.globalAlpha = 1;
    train(ctx, dt);
    ctx.globalCompositeOperation = "lighter";
    for (const [x, y, sz, ph, sp] of wins) {           // lit windows breathe
      const k = 0.5 + 0.5 * Math.sin(t * sp + ph), fl = Math.sin(t * 7 + ph * 9) > 0.985 ? 0.25 : 1;
      ctx.globalAlpha = (0.12 + 0.28 * k) * fl; const r = Math.min(sz * 2.2, 13); ctx.drawImage(glow, x - r, y - r, r * 2, r * 2);
    }
    for (const [x, y, c, ph] of bulbs) {               // fairy lights twinkle
      const k = 0.5 + 0.5 * Math.sin(t * 2.2 + ph);
      ctx.globalAlpha = 0.45 + 0.55 * k; const r = 4 + k * 4;
      ctx.drawImage(glow, x - r, y - r, r * 2, r * 2);
      if (c === 1) { ctx.globalAlpha = 0.25 * k; ctx.fillStyle = "#ff7fb0"; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, TAU); ctx.fill(); }
    }
    if (bill) {                                        // the billboard glows gently
      ctx.globalAlpha = 0.07 + 0.05 * Math.sin(t * 1.3); const r = bill.r * 1.4; ctx.drawImage(glow, bill.x - r, bill.y - r, r * 2, r * 2);
    }
    if (lake.lh) {                                     // moon and city lights shimmer on the water
      for (const [cx, rgb, wmax] of [[lake.mx, "255,244,205", 70], [lake.sx, "255,205,110", 54]]) {
        for (let k = 0; k < 9; k++) {
          const yy = lake.y0 + 5 + (k / 9) * (lake.lh - 8), ww = wmax * (1 - k / 14) * (0.55 + 0.45 * Math.sin(t * 1.6 + k * 1.3));
          ctx.globalAlpha = 0.5 * (1 - k / 11); ctx.fillStyle = "rgb(" + rgb + ")";
          ctx.fillRect(cx - ww / 2 + Math.sin(t * 1.2 + k) * 7, yy, Math.max(4, ww), 1.8);
        }
      }
    }
    for (const L of lantern) {                         // paper lanterns drift up from the water
      L.y -= L.v * dt * 0.5; if (L.y < -40) { L.y = h + 20; L.x = Math.random() * w; }
      const x = L.x + Math.sin(t * 0.6 + L.ph) * 16, sz = 15 * L.s, fade = Math.min(1, Math.max(0, L.y / (h * 0.35)));
      ctx.globalAlpha = 0.5 * fade; const r = sz * 3; ctx.drawImage(glow, x - r, L.y - r, r * 2, r * 2);
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 0.95 * fade;
      ctx.fillStyle = L.hue ? "#ff9ab4" : "#ffc46b"; ctx.strokeStyle = "rgba(58,10,36,.7)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x - sz * 0.5, L.y - sz * 0.65, sz, sz * 1.3, sz * 0.3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,246,200,.8)"; ctx.fillRect(x - sz * 0.2, L.y - sz * 0.3, sz * 0.4, sz * 0.6);
      ctx.globalCompositeOperation = "lighter";
    }
    ctx.globalCompositeOperation = "source-over";

    const hr = getRect && getRect();                   // sparkles orbiting the heart
    if (hr && hr.width) {
      const cx = hr.left + hr.width / 2, cy = hr.top + hr.height / 2;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + t * 0.12, rx = hr.width * 0.58, ry = hr.height * 0.55;
        const k = Math.sin(t * 2 + i * 1.7) * 0.5 + 0.5;
        ctx.globalAlpha = 0.35 + 0.65 * k; ctx.fillStyle = i % 2 ? "#fff6c9" : "#ffd1e4";
        star4(ctx, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 6 + k * 9); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  resize();
  raf = requestAnimationFrame((ts) => { last = ts; frame(ts); });
  return { resize, set paused(v) { paused = v; } };
}
