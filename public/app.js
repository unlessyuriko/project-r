import { createHeart } from "./heart.js";
import { createBackdrop } from "./backdrop.js";

const cfg = window.LOVE_CONFIG || {};
const $ = (s) => document.querySelector(s);
const STORE = "heart-opened-v2";
const MOBILE = matchMedia("(pointer: coarse)").matches || Math.min(innerWidth, innerHeight) < 640;

let photos = [], demo = false, opened = new Set(), current = -1, finaleSeen = false;
let heart, backdrop;
const safe = (fn) => { try { return fn(); } catch { return null; } };

// ---------- photos ----------
async function loadPhotos() {
  let list = [];
  try {
    const r = await fetch("photos.json", { cache: "no-store" });
    if (r.ok) list = await r.json();
  } catch {}
  if (!list.length) {
    demo = true;
    list = Array.from({ length: 12 }, (_, i) => ({ src: placeholder(i + 1) }));
  }
  photos = list;
}
function placeholder(n) {
  const hue = (340 + n * 13) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='640' font-family='Helvetica,Arial,sans-serif'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},80%,62%)'/><stop offset='1' stop-color='hsl(${hue + 30},70%,35%)'/></linearGradient></defs>
    <rect width='360' height='640' fill='url(#g)'/>
    <text x='180' y='300' font-size='90' text-anchor='middle' fill='white'>♥</text>
    <text x='180' y='380' font-size='24' text-anchor='middle' fill='white'>Your screenshot #${n}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
function labelFor(p) {
  const d = photos[p].date;
  if (d) return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `Memory ${p + 1}`;
}

// ---------- viewer ----------
function fitPhoto() {                               // size from the real visible area: phone browser bars make vh units unreliable
  const m = $("#modal"), im = $("#photo");
  if (m.hidden) return;
  const phone = innerWidth <= 700;
  im.style.maxHeight = Math.max(160, m.clientHeight - (phone ? 200 : 130)) + "px";
  im.style.maxWidth = Math.min(m.clientWidth * (phone ? 0.94 : 0.8), 460) + "px";
}
addEventListener("resize", fitPhoto);
$("#photo").addEventListener("load", fitPhoto);
function show(p, dir = 0) {
  if (p < 0 || p >= photos.length) return;
  current = p;
  const im = $("#photo");
  im.style.setProperty("--dir", dir);
  im.classList.remove("swap"); void im.offsetWidth; im.classList.add("swap");
  im.src = photos[p].src;
  $("#dayLabel").textContent = labelFor(p);
  $("#modal").hidden = false;
  fitPhoto();
  document.body.style.overflow = "hidden";
  setTimeout(() => { if (!$("#modal").hidden) backdrop.paused = true; }, 450);   // save battery while a photo covers the screen
  if (!opened.has(p)) {
    opened.add(p);
    safe(() => localStorage.setItem(STORE + photos.length, JSON.stringify([...opened])));
    updateProgress();
    heart.refresh(p);
  }
}
function hide() {
  backdrop.paused = false;
  $("#modal").hidden = true;
  document.body.style.overflow = "";
  if (opened.size === photos.length && !finaleSeen) showFinale();
}
const step = (dir) => show((current + dir + photos.length) % photos.length, dir);

$("#close").onclick = hide;
$("#prev").onclick = () => step(-1);
$("#next").onclick = () => step(1);
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") hide(); });
let swipe = null;
$("#modal").addEventListener("touchstart", (e) => { swipe = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
$("#modal").addEventListener("touchend", (e) => {
  if (!swipe) return;
  const dx = e.changedTouches[0].clientX - swipe.x, dy = e.changedTouches[0].clientY - swipe.y;
  swipe = null;
  if (Math.abs(dx) > 50 && Math.abs(dy) < 70) step(dx < 0 ? 1 : -1);
});
document.addEventListener("keydown", (e) => {
  if ($("#modal").hidden) return;
  if (e.key === "Escape") hide();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

function updateProgress() {
  const f = $("#found");
  if (f.textContent !== String(opened.size)) { f.classList.remove("bump"); void f.offsetWidth; f.classList.add("bump"); }
  f.textContent = opened.size;
  $("#total").textContent = photos.length;
  $("#barFill").style.width = (opened.size / photos.length) * 100 + "%";
}
function showFinale() {
  finaleSeen = true;
  $("#finale").hidden = false;
  for (let i = 0; i < 40; i++) setTimeout(() => burst(Math.random() * innerWidth, innerHeight * (0.4 + Math.random() * 0.5)), i * 60);
}
$("#finaleClose").onclick = () => ($("#finale").hidden = true);

function burst(x, y) {                              // comic-style pop of hearts and stars
  const tones = ["#ff6b8b", "#ff3d6e", "#ffd1e4", "#ffe28a"];
  for (let i = 0; i < 8; i++) {
    const el = document.createElement("span");
    el.className = "pop";
    el.innerHTML = `<svg viewBox="0 0 32 32"><use href="#${i % 3 === 0 ? "d-star" : "d-heart"}"/></svg>`;
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.setProperty("--dx", (Math.random() - 0.5) * 170 + "px");
    const size = 16 + Math.random() * 18;
    el.style.width = el.style.height = size + "px";
    el.style.color = tones[(Math.random() * tones.length) | 0];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

// ---------- gate + start ----------
function gate() {
  return new Promise((resolve) => {
    const code = String(cfg.passcode || "");
    if (!code || safe(() => sessionStorage.getItem("heart-unlocked")) === "1") return resolve();
    const g = $("#gate");
    g.hidden = false;
    $("#gateHint").textContent = cfg.passcodeHint || "";
    $("#gateForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if ($("#gateInput").value.trim() === code) {
        safe(() => sessionStorage.setItem("heart-unlocked", "1"));
        g.hidden = true;
        resolve();
      } else {
        g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake");
        $("#gateInput").value = "";
      }
    });
  });
}

// ---------- horizontal spin ----------
let ang = 0, vel = 0, dragging = false, idleSince = 0;
const PERSPECTIVE = 1100;
function applySpin() {
  const sp = $("#spin");
  sp.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${ang.toFixed(2)}deg)`;
  sp.style.filter = `brightness(${(1 - 0.32 * Math.abs(Math.sin((ang * Math.PI) / 180))).toFixed(3)})`;   // edge-on = darker
}
function spinLoop() {
  requestAnimationFrame(spinLoop);
  if (dragging || $("#modal").hidden === false) return;
  if (Math.abs(vel) > 0.02) { ang += vel; vel *= 0.94; idleSince = performance.now(); }
  else {
    vel = 0;
    if (performance.now() - idleSince > 2200) {      // settle back to facing front
      const target = Math.round(ang / 360) * 360;
      ang += (target - ang) * 0.08;
      if (Math.abs(target - ang) < 0.05) ang = target;
    }
  }
  applySpin();
}
// screen point -> position on the heart, through the CSS 3D transform (a homography on the heart's plane)
function pick(clientX, clientY) {
  const st = $("#stage"), r = st.getBoundingClientRect();
  const m = new DOMMatrix(getComputedStyle($("#spin")).transform);
  const H = [[m.m11, m.m21, m.m41], [m.m12, m.m22, m.m42], [m.m14, m.m24, m.m44]];
  const [a, b, c, d, e, f, g, h, i] = [H[0][0], H[0][1], H[0][2], H[1][0], H[1][1], H[1][2], H[2][0], H[2][1], H[2][2]];
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-9) return -1;
  const X = clientX - (r.left + r.width / 2), Y = clientY - (r.top + r.height / 2);
  const inv = [
    [(e * i - f * h), (c * h - b * i), (b * f - c * e)],
    [(f * g - d * i), (a * i - c * g), (c * d - a * f)],
    [(d * h - e * g), (b * g - a * h), (a * e - b * d)],
  ];
  const px = inv[0][0] * X + inv[0][1] * Y + inv[0][2], py = inv[1][0] * X + inv[1][1] * Y + inv[1][2], pw = inv[2][0] * X + inv[2][1] * Y + inv[2][2];
  if (!pw) return -1;
  const lx = px / pw, ly = py / pw;                  // px offset from the heart's centre
  return heart.cellAtUV(0.5 + lx / r.width, 0.5 + ly / r.height);
}
function bindHeart() {
  const cv = $("#heart"), st = $("#stage");
  let down = null, moved = false;
  cv.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, last: e.clientX }; moved = false; dragging = true; vel = 0;
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", (e) => {
    if (!down) {
      if (e.pointerType !== "mouse") return;
      const c = pick(e.clientX, e.clientY);
      heart.setHover(c);
      cv.style.cursor = c >= 0 ? "pointer" : "grab";
      return;
    }
    if (Math.abs(e.clientX - down.x) > 6) moved = true;
    if (moved) {
      const d = (e.clientX - down.last) * 0.6;
      ang += d; vel = d; applySpin();
      heart.setHover(-1); cv.style.cursor = "grabbing";
    }
    down.last = e.clientX;
  });
  const end = (e, cancelled) => {
    if (!down) return;
    const wasTap = !moved && !cancelled;
    down = null; dragging = false; idleSince = performance.now();
    if (wasTap) {
      const c = pick(e.clientX, e.clientY);
      if (c >= 0) {
        burst(e.clientX, e.clientY);
        st.classList.remove("kick"); void st.offsetWidth; st.classList.add("kick");
        show(heart.cellPhoto[c]);
      }
    }
  };
  cv.addEventListener("pointerup", (e) => end(e, false));
  cv.addEventListener("pointercancel", (e) => end(e, true));
  cv.addEventListener("pointerleave", () => { if (!down) heart.setHover(-1); });
  spinLoop();}

async function init() {
  const title = cfg.title || "Our Heart";            // sticker title: letters pop in one by one
  const h1 = $("#title");
  h1.setAttribute("aria-label", title);
  [...title].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "ch"; s.setAttribute("aria-hidden", "true");
    s.textContent = ch === " " ? " " : ch;
    s.style.animationDelay = 120 + i * 55 + "ms";
    h1.appendChild(s);
  });
  $("#subtitle").textContent = cfg.subtitle || "";
  $("#subtitle").hidden = !cfg.subtitle;
  $("#finalTitle").textContent = cfg.finalTitle || "";
  $("#finalMessage").textContent = cfg.finalMessage || "";
  $("#signature").textContent = cfg.signature || "";
  if (cfg.startDate) {
    const days = Math.floor((Date.now() - new Date(cfg.startDate + "T00:00:00")) / 864e5) + 1;
    if (days > 0) $("#days").textContent = `Day ${days} together`;
  }
  await gate();
  await loadPhotos();
  $("#demoNote").hidden = !demo;
  await new Promise((r) => setTimeout(r, 40));      // let the loader paint before the heavy mosaic maths
  const saved = safe(() => JSON.parse(localStorage.getItem(STORE + photos.length) || "[]")) || [];
  opened = new Set(saved.filter((p) => p < photos.length));
  heart = createHeart($("#heart"), photos.length, { mobile: MOBILE, isOpen: (p) => opened.has(p) });
  backdrop = createBackdrop($("#bgc"), { mobile: MOBILE, getRect: () => $("#stage").getBoundingClientRect() });
  addEventListener("resize", () => backdrop.resize());
  bindHeart();
  updateProgress();
  $("#loader").hidden = true;
}
init();
