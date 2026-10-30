// Toon-shaded, truly 3D heart (inflated pillow with a rounded edge) plus a snowfall that rotates with it.
import * as THREE from "./vendor/three.module.min.js";

const TAU = Math.PI * 2;
const INK = 0x3a0a24;
const P = (t) => [16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)];

// ---- inflated heart: a grid over the heart, pushed out to a rounded cross-section by distance from the edge ----
function buildHeartGeometry(uvOf, step, puff) {
  const N = 480;
  const outline = Array.from({ length: N }, (_, i) => P((i / N) * TAU));
  const x0 = -17.5, y0 = -18.5, x1 = 17.5, y1 = 14;
  const nx = Math.ceil((x1 - x0) / step) + 1, ny = Math.ceil((y1 - y0) / step) + 1;
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = N - 1; i < N; j = i++) {
      const [xi, yi] = outline[i], [xj, yj] = outline[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const nearest = (x, y) => {
    let bd = Infinity, bx = 0, by = 0, nxo = 0, nyo = 1;
    for (let i = 0; i < N; i++) {
      const [ax, ay] = outline[i], [bx2, by2] = outline[(i + 1) % N];
      const dx = bx2 - ax, dy = by2 - ay, l2 = dx * dx + dy * dy;
      let t = l2 ? ((x - ax) * dx + (y - ay) * dy) / l2 : 0;
      t = Math.max(0, Math.min(1, t));
      const qx = ax + dx * t, qy = ay + dy * t, d = (x - qx) ** 2 + (y - qy) ** 2;
      if (d < bd) { bd = d; bx = qx; by = qy; const l = Math.sqrt(l2) || 1; nxo = -dy / l; nyo = dx / l; }   // outline runs clockwise: outward = (-dy, dx)
    }
    nearest.n = [nxo, nyo];
    return [Math.sqrt(bd), bx, by];
  };
  const R = 8.5;                                       // distance over which the surface rounds off to full height
  const V = nx * ny;
  const pos = new Float32Array(V * 2 * 3), uv = new Float32Array(V * 2 * 2), on = new Uint8Array(V), edge = new Uint8Array(V * 2);
  const rimN = new Float32Array(V * 2 * 2);            // outward normal of the outline for rim vertices
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i;
    let x = x0 + i * step, y = y0 + j * step, z = 0;
    const ins = inside(x, y);
    on[k] = ins ? 1 : 0;
    const [d, qx, qy] = nearest(x, y);
    if (!ins) { x = qx; y = qy; }                      // outside points collapse onto the outline: an exact silhouette
    else { const D = Math.min(d / R, 1); z = puff * Math.sqrt(1 - (1 - D) * (1 - D)); }
    const onEdge = !ins || d < 1e-3 ? 1 : 0;
    const [u, v] = uvOf(x, y);
    for (const side of [0, 1]) {
      const o = k + side * V;
      pos.set([x, y + 2.5, side ? -z : z], o * 3);   // +2.5 centres the heart on its own origin
      uv.set([u, v], o * 2);
      edge[o] = onEdge;
      if (onEdge) rimN.set(nearest.n, o * 2);
    }
  }
  const idx = [];
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    if (!(on[a] || on[b] || on[c] || on[d])) continue;
    idx.push(a, b, c, b, d, c);                        // front, counter-clockwise from +z
    const B = (v) => (edge[v] ? v : v + V);            // rim vertices are shared by both faces, so there is no crack at the equator
    idx.push(B(a), B(c), B(b), B(b), B(c), B(d));      // back, reversed
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const nrm = g.attributes.normal;                     // front and back share the rim: make their normals horizontal and equal
  for (let o = 0; o < V * 2; o++) if (edge[o]) nrm.setXYZ(o, rimN[o * 2], rimN[o * 2 + 1], 0);
  return g;
}

function hull(geo, offset, color) {                    // inverted-hull outline: a slightly fattened copy seen from behind
  const g = geo.clone();
  const p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * offset, p.getY(i) + n.getY(i) * offset, p.getZ(i) + n.getZ(i) * offset);
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }));
}

// ---- snow ----
function flakeTexture() {                              // six-armed anime snowflake with a soft glow
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  g.translate(64, 64);
  g.lineCap = "round";
  g.shadowColor = "rgba(190,215,255,.95)"; g.shadowBlur = 10;
  g.strokeStyle = "#fff"; g.fillStyle = "#fff";
  for (let a = 0; a < 6; a++) {
    g.save(); g.rotate((a * Math.PI) / 3);
    g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -48); g.stroke();
    g.lineWidth = 5;
    for (const [y, l] of [[-30, 15], [-18, 10]]) { g.beginPath(); g.moveTo(0, y); g.lineTo(-l, y - l); g.moveTo(0, y); g.lineTo(l, y - l); g.stroke(); }
    g.restore();
  }
  g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.55, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createScene({ canvas, stageEl, heartCanvas, heart, mobile, reduced }) {
  const FOV = 35, TAN = Math.tan((FOV / 2) * Math.PI / 180);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 600);

  scene.add(new THREE.AmbientLight(0xffd9e4, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-30, 40, 28);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff9ec0, 1.2);
  rim.position.set(30, -10, -30);
  scene.add(rim);

  const tex = new THREE.CanvasTexture(heartCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const bands = new THREE.DataTexture(new Uint8Array([85, 165, 255]), 3, 1, THREE.RedFormat);   // 3-step cel shading
  bands.minFilter = bands.magFilter = THREE.NearestFilter;
  bands.needsUpdate = true;
  const geo = buildHeartGeometry(heart.uvOf, mobile ? 0.5 : 0.34, 6.2);
  const mesh = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: tex, gradientMap: bands }));
  const pivot = new THREE.Group();
  pivot.add(hull(geo, 0.5, INK), hull(geo, 1.25, 0xffffff), mesh);   // dark outline, then a white sticker edge outside it
  scene.add(pivot);

  // snow lives in a disc around the heart, so turning it never reveals an empty corner
  const snow = new THREE.Group();
  scene.add(snow);
  const layers = [
    { n: mobile ? 70 : 130, size: 3.4, map: flakeTexture(), fall: [3, 6] },
    { n: mobile ? 80 : 160, size: 1.4, map: dotTexture(), fall: [2, 5] },
  ].map((L) => {
    const arr = new Float32Array(L.n * 3), ph = new Float32Array(L.n), vy = new Float32Array(L.n);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const pts = new THREE.Points(geom, new THREE.PointsMaterial({
      map: L.map, size: L.size, transparent: true, opacity: 0.95, depthWrite: false, sizeAttenuation: true,
    }));
    pts.frustumCulled = false;
    snow.add(pts);
    return { ...L, arr, ph, vy, pts };
  });
  let spread = { r: 50, h: 40 };
  function seedSnow() {
    for (const L of layers) for (let i = 0; i < L.n; i++) {
      const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * spread.r;
      L.arr[i * 3] = Math.cos(a) * r;
      L.arr[i * 3 + 1] = (Math.random() * 2 - 1) * spread.h;
      L.arr[i * 3 + 2] = Math.sin(a) * r;
      L.ph[i] = Math.random() * TAU;
      L.vy[i] = L.fall[0] + Math.random() * (L.fall[1] - L.fall[0]);
    }
  }

  let ppu = 16, camD = 66, ang = 0, lift = 0, kick = 0, paused = false, last = 0, t = 0, lastScroll = scrollY;
  function resize() {
    const vw = document.documentElement.clientWidth, vh = innerHeight, sr = stageEl.getBoundingClientRect();
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    ppu = Math.min(sr.width / 40, sr.height / 36);
    camD = vh / (2 * TAN * ppu);                       // camera distance that maps heart units to screen pixels
    camera.position.z = camD;
    camera.updateProjectionMatrix();
    const halfH = camD * TAN, halfW = halfH * camera.aspect;
    spread = { r: Math.min(Math.max(halfW, halfH) * 1.05, camD * 0.85), h: halfH * 1.12 };
    seedSnow();
  }
  new ResizeObserver(resize).observe(stageEl);
  addEventListener("resize", resize);
  resize();

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(clientX, clientY) {
    ndc.set((clientX / document.documentElement.clientWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(mesh)[0];
    return hit && hit.uv ? heart.cellAtUV(hit.uv.x, 1 - hit.uv.y) : -1;
  }

  function frame(ms) {
    if (paused) { last = ms; return; }
    const dt = Math.min((ms - last) / 1000 || 0.016, 0.05); last = ms; t += dt;
    const sr = stageEl.getBoundingClientRect();
    const px = (sr.left + sr.width / 2 - innerWidth / 2) / ppu, py = -(sr.top + sr.height / 2 - innerHeight / 2) / ppu;
    pivot.position.set(px, py, lift / ppu * 0.6);
    pivot.rotation.y = (ang * Math.PI) / 180;
    const ph = t % 1.7;                                 // lub-dub heartbeat
    const beat = reduced ? 0 : Math.exp(-(((ph - 0.12) / 0.07) ** 2)) * 0.045 + Math.exp(-(((ph - 0.36) / 0.09) ** 2)) * 0.03;
    kick *= Math.pow(0.02, dt);
    pivot.scale.setScalar(1 + beat + kick);

    snow.position.set(0, 0, 0);                         // snow fills the viewport, so it stays with the page as it scrolls
    snow.rotation.y = (ang * Math.PI) / 180 * 0.55;     // the snow turns with the heart (a little slower), like one shared space
    const sy = scrollY, ds = (sy - lastScroll) / ppu; lastScroll = sy;   // page scroll drags the flakes along (parallax)
    for (const L of layers) {
      const a = L.arr, par = L.size > 2 ? 0.7 : 0.45;   // big flakes are nearer, so they travel further
      for (let i = 0; i < L.n; i++) {
        let y = a[i * 3 + 1] - L.vy[i] * dt * (reduced ? 0.3 : 1) + ds * par;
        if (y < -spread.h) y += spread.h * 2; else if (y > spread.h) y -= spread.h * 2;
        a[i * 3 + 1] = y;
        a[i * 3] += Math.sin(t * 0.7 + L.ph[i]) * dt * 1.2;
      }
      L.pts.geometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);
  tex.needsUpdate = true;

  return {
    set(a, l) { ang = a; lift = l; },
    kick() { kick = 0.07; },
    pick,
    refreshTexture() { tex.needsUpdate = true; },
    resize,
    set paused(v) { paused = v; },
  };
}
