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
function show(p, dir = 0) {
  if (p < 0 || p >= photos.length) return;
  current = p;
  const im = $("#photo");
  im.style.setProperty("--dir", dir);
  im.classList.remove("swap"); void im.offsetWidth; im.classList.add("swap");
  im.src = photos[p].src;
  $("#dayLabel").textContent = labelFor(p);
  $("#modal").hidden = false;
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

function bindHeart() {
  const cv = $("#heart");
  cv.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const c = heart.cellAt(e.clientX, e.clientY);
    heart.setHover(c);
    cv.style.cursor = c >= 0 ? "pointer" : "default";
  });
  cv.addEventListener("pointerleave", () => heart.setHover(-1));
  cv.addEventListener("click", (e) => {
    const c = heart.cellAt(e.clientX, e.clientY);
    if (c < 0) return;
    burst(e.clientX, e.clientY);
    const st = $("#stage");
    st.classList.remove("kick"); void st.offsetWidth; st.classList.add("kick");
    show(heart.cellPhoto[c]);
  });
}

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
  backdrop = createBackdrop($("#bgc"), { mobile: MOBILE, getRect: () => $("#heart").getBoundingClientRect() });
  addEventListener("resize", () => backdrop.resize());
  bindHeart();
  updateProgress();
  $("#loader").hidden = true;
}
init();
