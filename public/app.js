import { createHeart } from "./heart.js";
import { createBackdrop } from "./backdrop.js";
import { createScene } from "./heart3d.js";
import { initExtras } from "./extras.js";
import { wrapHero, initPages } from "./pages.js";
import { initBgm } from "./bgm.js";

wrapHero();

const cfg = window.LOVE_CONFIG || {};
const $ = (s) => document.querySelector(s);
const STORE = "heart-opened-v2";
const MOBILE = matchMedia("(pointer: coarse)").matches || Math.min(innerWidth, innerHeight) < 640;

let photos = [], demo = false, opened = new Set(), current = -1, finaleSeen = false;
let heart, backdrop, scene;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    <text x='180' y='300' font-size='90' text-anchor='middle' fill='white'>\u2665</text>
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
  setTimeout(() => { if (!$("#modal").hidden) { backdrop.paused = true; scene.paused = true; } }, 450);   // save battery while a photo covers the screen
  if (!opened.has(p)) {
    opened.add(p);
    safe(() => localStorage.setItem(STORE + photos.length, JSON.stringify([...opened])));
    updateProgress();
    heart.refresh(p);
  }
}
function hide() {
  backdrop.paused = false; scene.paused = false;
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

// ---------- horizontal spin (the 3D scene does the drawing) ----------
let ang = 0, vel = 0, dragging = false, idleSince = 0, flip = null, lift = 0, sway = 0;   // flip = scripted full turn after a tap
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function spinLoop() {
  requestAnimationFrame(spinLoop);
  if (flip) {
    const t = Math.min(1, (performance.now() - flip.t0) / flip.ms);
    ang = flip.from + 360 * easeInOut(t);
    lift = 90 * Math.sin(Math.PI * t);               // rises toward you mid-turn, then settles back
    if (t >= 1) { ang = flip.from + 360; lift = 0; flip = null; idleSince = performance.now(); }
  } else if (!dragging && $("#modal").hidden) {
    if (Math.abs(vel) > 0.02) { ang += vel; vel *= 0.94; idleSince = performance.now(); }
    else {
      vel = 0;
      if (performance.now() - idleSince > 2200) {    // settle back to facing front
        const target = Math.round(ang / 360) * 360;
        ang += (target - ang) * 0.08;
        if (Math.abs(target - ang) < 0.05) ang = target;
      }
    }
  }
  const idle = !flip && !dragging && Math.abs(vel) < 0.02 && performance.now() - idleSince > 1500 && $("#modal").hidden;
  sway += ((idle && !reduced ? 1 : 0) - sway) * 0.04;     // resting heart sways a little so its depth stays visible
  scene.set(ang + sway * 14 * Math.sin(performance.now() / 1700), lift);
}
function bindHeart() {
  const cv = $("#stage"), st = cv;
  let down = null, moved = false;
  cv.addEventListener("pointerdown", (e) => {
    if (flip) return;                                // busy turning after a tap
    down = { x: e.clientX, last: e.clientX }; moved = false; dragging = true; vel = 0;
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", (e) => {
    if (!down) {
      if (e.pointerType !== "mouse") return;
      const c = scene.pick(e.clientX, e.clientY);
      heart.setHover(c);
      cv.style.cursor = c >= 0 ? "pointer" : "grab";
      return;
    }
    if (Math.abs(e.clientX - down.x) > 6) moved = true;
    if (moved) {
      const d = (e.clientX - down.last) * 0.6;
      ang += d; vel = d;
      heart.setHover(-1); cv.style.cursor = "grabbing";
    }
    down.last = e.clientX;
  });
  const end = (e, cancelled) => {
    if (!down) return;
    const wasTap = !moved && !cancelled;
    down = null; dragging = false; idleSince = performance.now();
    if (wasTap) {
      const c = scene.pick(e.clientX, e.clientY);
      if (c >= 0) {
        burst(e.clientX, e.clientY);
        const MS = 750;                              // the heart spins once, then the photo opens
        flip = { from: ang, t0: performance.now(), ms: MS };
        vel = 0;
        const photo = heart.cellPhoto[c];
        setTimeout(() => { scene.kick(); show(photo); }, MS - 120);
      }
    }
  };
  cv.addEventListener("pointerup", (e) => end(e, false));
  cv.addEventListener("pointercancel", (e) => end(e, true));
  cv.addEventListener("pointerleave", () => { if (!down) heart.setHover(-1); });
  spinLoop();
}

async function init() {
  const title = cfg.title || "Our Heart";            // sticker title: letters pop in one by one
  const h1 = $("#title");
  h1.setAttribute("aria-label", title);
  [...title].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "ch"; s.setAttribute("aria-hidden", "true");
    s.textContent = ch === " " ? "\u00a0" : ch;
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
  const tex = document.createElement("canvas");      // the mosaic is painted here and wrapped onto the 3D heart
  heart = createHeart(tex, photos.length, { mobile: MOBILE, isOpen: (p) => opened.has(p), flat: true, onFlush: () => scene && scene.refreshTexture() });
  try {
    scene = createScene({ canvas: $("#gl"), stageEl: $("#stage"), heartCanvas: tex, heart, mobile: MOBILE, reduced });
  } catch (err) {
    console.error(err);
    $("#stage").innerHTML = '<p class="nogl">Your browser couldn\'t start the 3D view. Try Chrome or Safari.</p>';
    scene = { set() {}, kick() {}, pick: () => -1, refreshTexture() {}, paused: false };
  }
  backdrop = createBackdrop($("#bgc"), { mobile: MOBILE, getRect: () => $("#stage").getBoundingClientRect() });
  addEventListener("resize", () => backdrop.resize());
  bindHeart();
  updateProgress();
  initExtras(cfg, { burst });
  initPages();
  initBgm(cfg);
  $("#loader").hidden = true;
}
init();
