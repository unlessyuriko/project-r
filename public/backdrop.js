// Anime backdrop: dusk sky, moon, twinkling stars, drifting clouds, a flat-colour Yangon skyline
// (Shwedagon, Sule, colonial buildings, palms, Circular Railway) and falling hand-drawn red roses.
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
export function roseSprite(tone) {                   // [shadow red, mid red, bright red]; stemless red-velvet anime rose, bloom centred at (100,92)
  const [dk, md, br] = tone;
  const c = canvasOf(200, 180), g = c.getContext("2d");
  g.lineJoin = "round"; g.lineCap = "round";
  const draw = (d, fill, mirror) => {
    g.save(); if (mirror) { g.translate(200, 0); g.scale(-1, 1); }
    const p = new Path2D(d);
    if (fill) { g.fillStyle = fill; g.fill(p); }
    g.lineWidth = 5; g.strokeStyle = INK; g.stroke(p);
    g.restore();
  };
  const line = (d, col, w, mirror) => {
    g.save(); if (mirror) { g.translate(200, 0); g.scale(-1, 1); }
    g.lineWidth = w; g.strokeStyle = col; g.stroke(new Path2D(d)); g.restore();
  };
  // back petals
  for (const m of [false, true]) draw("M100 154 C50 150 28 100 40 60 C46 40 66 30 84 38 C70 72 78 126 100 154Z", dk, m);
  // cup
  draw("M36 80 C30 130 62 168 100 168 C138 168 170 130 164 80 C146 94 124 88 100 96 C76 88 54 94 36 80Z", md, false);
  g.save(); g.clip(new Path2D("M36 80 C30 130 62 168 100 168 C138 168 170 130 164 80 C146 94 124 88 100 96 C76 88 54 94 36 80Z"));
  g.fillStyle = "rgba(70,0,30,.38)"; g.beginPath(); g.ellipse(150, 150, 62, 70, 0, 0, TAU); g.fill();    // cel shadow
  g.restore();
  line("M100 100 C96 126 98 148 100 166", "rgba(58,10,36,.55)", 3.5, false);
  line("M70 100 C64 124 70 146 84 160", "rgba(58,10,36,.45)", 3, false);
  line("M130 100 C136 124 130 146 116 160", "rgba(58,10,36,.45)", 3, false);
  // front wrapping petals
  for (const m of [false, true]) draw("M36 80 C26 112 42 148 82 164 C62 134 58 106 72 88 C58 88 46 86 36 80Z", br, m);
  g.fillStyle = dk; g.beginPath(); g.ellipse(100, 84, 52, 22, 0, 0, TAU); g.fill();     // dark inside of the cup, fills the gap under the dome
  // top dome with scalloped lips
  draw("M58 82 C52 40 78 14 100 16 C122 14 148 40 142 82 C128 68 114 64 100 70 C86 64 72 68 58 82Z", br, false);
  g.save(); g.clip(new Path2D("M58 82 C52 40 78 14 100 16 C122 14 148 40 142 82 C128 68 114 64 100 70 C86 64 72 68 58 82Z"));
  g.fillStyle = "rgba(70,0,30,.3)"; g.beginPath(); g.ellipse(142, 70, 40, 56, 0, 0, TAU); g.fill();
  g.restore();
  // inner bud: nested petals + spiral
  line("M72 78 C70 50 88 36 100 38 C112 36 130 50 128 78", INK, 4.5, false);
  line("M84 72 C84 56 94 48 102 50 C112 52 114 64 106 68 C98 72 94 62 100 58", INK, 4.5, false);
  line("M58 82 C72 66 86 66 100 72 C114 66 128 66 142 82", INK, 4.5, false);
  // glossy highlights
  line("M66 66 C64 50 72 36 84 28", "rgba(255,150,170,.55)", 5, false);       // soft velvet sheen, not glossy white
  line("M48 110 C46 124 52 138 62 148", "rgba(255,150,170,.4)", 4, false);
  return c;
}
function petalSprite() {
  const c = canvasOf(48, 64), g = c.getContext("2d");
  g.beginPath(); g.moveTo(24, 4); g.bezierCurveTo(54, 18, 46, 56, 24, 60); g.bezierCurveTo(2, 56, -6, 18, 24, 4);
  g.fillStyle = "#860d25"; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.arc(18, 24, 10, Math.PI * 1.1, Math.PI * 1.7); g.lineWidth = 3; g.strokeStyle = "rgba(255,150,170,.5)"; g.stroke();
  return c;
}
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
    g.fillStyle = rnd() < 0.4 ? "#ffd27a" : pal.window;
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
  let paused = false, raf = 0, stars = [], clouds = [], roses = [], petals = [];
  const cloudImg = cloudSprite(), petalImg = petalSprite();
  const roseImgs = [
    roseSprite(["#4e0715", "#7d0c22", "#a4132f"]),                // red velvet: deep crimson
    roseSprite(["#560818", "#870d25", "#b01634"]),
    roseSprite(["#470612", "#740b20", "#9a1129"]),
  ];

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
    const farBase = h * 0.72, midBase = h * 0.8, nearBase = h * 0.88;
    const sx = w * (wide ? 0.17 : 0.3), ss = Math.min((h * 0.5) / 100, sx / 30);   // beside the heart so the whole pagoda reads
    const sg = g.createRadialGradient(sx, farBase - 50 * ss, 0, sx, farBase - 50 * ss, 80 * ss);   // golden glow around the pagoda
    sg.addColorStop(0, "rgba(255,205,110,.45)"); sg.addColorStop(1, "rgba(255,205,110,0)");
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    layer((l) => {                                     // far: Shwedagon
      const shw = { fill: "#f2c25a", hi: "#ffe28a", shade: "#c28a2c", line: "#2a1250", bands: SHW_BANDS };
      for (const [dx, hs] of [[-31, 0.34], [-24, 0.26], [24, 0.26], [31, 0.34]]) stupa(l, sx + dx * ss, farBase - 9 * ss, ss * hs * 2.4, MINI, { ...gold, hi: "#ffe28a", fill: "#f2c25a", shade: "#c28a2c" });
      stupa(l, sx, farBase, ss, SHW, shw);
      l.fillStyle = "#3d2070"; l.fillRect(0, farBase - 2, w, h);
    }, 0.08);
    layer((l) => {                                     // mid: Sule + colonial rows
      const pal = { wall: "#4a2a82", shade: "#3a2070", roof: "#321a60", window: "#24123f", line: "#220f45", gold: "#d6aa5c" };
      const s = (h * 0.27) / 41;
      stupa(l, w * (wide ? 0.8 : 0.82), midBase, s, SULE, { fill: "#cf9f55", shade: "#9a7238", line: "#220f45" });
      const bh = h * 0.12;
      [[0.46, 0.45, false], [0.57, 0.5, true], [0.68, 0.4, false], [0.9, 0.5, true], [0.97, 0.36, false]].forEach(([fx, ws, tw]) => colonial(l, w * fx, midBase, bh * 1.9 * ws * 1.4, bh * (0.8 + ws * 0.4), tw, pal, R));
      l.fillStyle = "#2c1658"; l.fillRect(0, midBase - 2, w, h);
    }, 0.2);
    layer((l) => {                                     // near: palms + ground
      [[0.03, 0.26], [0.1, 0.19], [0.93, 0.24], [0.99, 0.17], [0.5, 0.12], [0.63, 0.14]].forEach(([fx, hf]) => palm(l, w * fx, nearBase + 4, h * hf, "#1d0e3a"));
      l.fillStyle = "#1d0e3a"; l.fillRect(0, nearBase, w, h);
      l.fillStyle = "#2a1650"; l.fillRect(0, nearBase, w, 3);
    }, 0.05);
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
    const rs = Math.max(0.3, Math.min(0.5, w / 1100)) * (mobile ? 0.8 : 1) * 1.3;
    roses = Array.from({ length: mobile ? 9 : 15 }, () => ({
      x: R() * w, y: R() * (h + 240) - 240, vy: 18 + R() * 26, ph: R() * TAU, sw: 14 + R() * 22,
      rot: (R() - 0.5) * 0.9, rv: (R() - 0.5) * 0.5, s: rs * (0.55 + R() * 0.7), img: roseImgs[(R() * 3) | 0],
    }));
    petals = Array.from({ length: mobile ? 12 : 22 }, () => ({
      x: R() * w, y: R() * (h + 100) - 100, vy: 28 + R() * 34, ph: R() * TAU, sw: 20 + R() * 30,
      rot: R() * TAU, rv: (R() - 0.5) * 2.4, s: 0.35 + R() * 0.35,
    }));
  }

  function train(g) {
    const ch = trainH, cw = ch * 2.7, y = trainY - ch - 2;
    const total = cw * 5.8, x0 = ((t * 28) % (w + total * 2)) - total * 1.4;
    g.save(); g.lineJoin = "round"; g.lineWidth = 2.5; g.strokeStyle = "#140a2c";
    for (let i = 0; i < 5; i++) {
      const x = x0 + i * (cw + 3);
      g.fillStyle = "#4e2d86"; g.fillRect(x, y, cw, ch); g.strokeRect(x, y, cw, ch);
      g.fillStyle = "#35205f"; g.fillRect(x, y + ch * 0.72, cw, ch * 0.28);
      g.fillStyle = "#e0a85a"; g.fillRect(x, y + ch * 0.64, cw, ch * 0.08);
      for (let k = 0; k < 5; k++) { g.fillStyle = "#ffd890"; g.fillRect(x + cw * (0.07 + k * 0.18), y + ch * 0.18, cw * 0.12, ch * 0.34); }
    }
    const lx = x0 - cw * 0.85;                         // locomotive + headlight
    g.fillStyle = "#6a3a52"; g.fillRect(lx, y, cw * 0.8, ch); g.strokeRect(lx, y, cw * 0.8, ch);
    g.fillStyle = "#ffe9a8"; g.fillRect(lx + cw * 0.12, y + ch * 0.2, cw * 0.18, ch * 0.3);
    const hl = g.createRadialGradient(lx, y + ch * 0.5, 0, lx, y + ch * 0.5, ch * 2.2);
    hl.addColorStop(0, "rgba(255,230,160,.5)"); hl.addColorStop(1, "rgba(255,230,160,0)");
    g.fillStyle = hl; g.fillRect(lx - ch * 2.2, y - ch, ch * 2.4, ch * 3);
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
    train(ctx);

    for (const p of petals) {                          // falling petals
      p.y += p.vy * dt; p.rot += p.rv * dt;
      if (p.y > h + 60) { p.y = -60; p.x = Math.random() * w; }
      ctx.save(); ctx.translate(p.x + Math.sin(t * 0.8 + p.ph) * p.sw, p.y); ctx.rotate(p.rot);
      ctx.drawImage(petalImg, -24 * p.s, -32 * p.s, 48 * p.s, 64 * p.s); ctx.restore();
    }
    for (const r of roses) {                           // falling red roses
      r.y += r.vy * dt; r.rot += r.rv * dt * 0.3;
      if (r.y > h + 140) { r.y = -200; r.x = Math.random() * w; }
      ctx.save(); ctx.translate(r.x + Math.sin(t * 0.6 + r.ph) * r.sw, r.y); ctx.rotate(r.rot + Math.sin(t * 0.9 + r.ph) * 0.18);
      ctx.drawImage(r.img, -100 * r.s, -92 * r.s, 200 * r.s, 180 * r.s); ctx.restore();
    }
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
