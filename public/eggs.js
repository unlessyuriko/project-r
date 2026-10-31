// Easter eggs. Texts live in config.js under `eggs`.
const SKIP = "button, a, input, textarea, .modal, .gate, .finale, .egg-note, .bgm-btn";

let noteEl = null, noteTimer = 0;
function showNote(title, text, ms = 7000) {
  hideNote();
  noteEl = document.createElement("div");
  noteEl.className = "egg-note panel";
  noteEl.setAttribute("role", "status");
  const h = document.createElement("b"); h.textContent = title;
  noteEl.appendChild(h);
  if (text) { const p = document.createElement("p"); p.textContent = text; noteEl.appendChild(p); }
  noteEl.addEventListener("click", hideNote);
  document.body.appendChild(noteEl);
  noteTimer = setTimeout(hideNote, ms);
}
function hideNote() {
  clearTimeout(noteTimer);
  if (noteEl) { const n = noteEl; noteEl = null; n.classList.add("out"); setTimeout(() => n.remove(), 300); }
}

// hearts falling over the whole screen
function heartStorm(count = 70, ms = 4500) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) count = 12;
  const box = document.createElement("div");
  box.className = "egg-storm"; box.setAttribute("aria-hidden", "true");
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = i % 5 === 0 ? "❄" : "❤";
    s.style.left = Math.random() * 100 + "%";
    s.style.fontSize = 14 + Math.random() * 22 + "px";
    s.style.animationDuration = 2.2 + Math.random() * 2.4 + "s";
    s.style.animationDelay = Math.random() * (ms / 1000 - 2.5) + "s";
    s.style.setProperty("--dx", (Math.random() * 120 - 60).toFixed(0) + "px");
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), ms + 1500);
}

// a short synthesised meow
let actx = null;
function meow() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const t = actx.currentTime, o = actx.createOscillator(), f = actx.createBiquadFilter(), g = actx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.12);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.5);
    f.type = "bandpass"; f.Q.value = 2.2;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(1800, t + 0.15);
    f.frequency.exponentialRampToValueAtTime(700, t + 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(f); f.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + 0.6);
  } catch { /* no audio, no meow */ }
}

// moon phase (0 = new, 0.5 = full) from a date, plain synodic-month maths
function moonInfo(date) {
  const SYN = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14);
  const age = ((((date.getTime() - ref) / 864e5) % SYN) + SYN) % SYN;
  const lit = Math.round((1 - Math.cos((2 * Math.PI * age) / SYN)) * 50);
  const names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  return { name: names[Math.round((age / SYN) * 8) % 8], lit };
}

export function initEggs(cfg, { backdrop, burst, onHeart }) {
  const E = cfg.eggs || {};
  const names = cfg.loveTest?.names || ["", ""];
  const onHero = () => {                                  // the hero page fills the screen (geometry, so it never lags behind scrolling)
    const r = document.querySelector(".page.hero")?.getBoundingClientRect();
    return !!r && r.top < innerHeight * 0.3 && r.bottom > innerHeight * 0.7;
  };

  // 1 + 2 + 3: taps on the moon, the billboard and the peeking cats
  document.addEventListener("click", (e) => {
    const cx = e.clientX, cy = e.clientY;
    // cats first: they sit on top of list items that are links
    const seen = tapCat(cx, cy);
    if (seen) { e.preventDefault(); e.stopPropagation(); return; }
    if (e.target.closest(SKIP) || !onHero() || !backdrop?.targets) return;
    if (onHeart?.(cx, cy)) return;                         // the heart's own tap wins
    const { moon, bill } = backdrop.targets();
    if (moon && Math.hypot(cx - moon.x, cy - moon.y) < moon.r * 1.3) {
      const start = cfg.startDate ? new Date(cfg.startDate + "T21:00:00") : new Date();
      const m = moonInfo(start);
      showNote(E.moonTitle || "Our first night", `Day 1 moon: ${m.name.toLowerCase()}, ${m.lit}% lit. ${E.moonText || "You were under this one."}`);
      burst?.(cx, cy);
    } else if (bill && Math.abs(cx - bill.x) < bill.r && Math.abs(cy - bill.y) < bill.r * 0.9) {
      showNote(`${names[0]} ❤️ ${names[1]}`, E.billboard || "Famous on the Yangon skyline.");
      for (let i = 0; i < 4; i++) setTimeout(() => burst?.(bill.x + (Math.random() - 0.5) * bill.r, bill.y + (Math.random() - 0.5) * bill.r), i * 140);
    }
  }, true);

  const cats = new Set();
  function tapCat(x, y) {
    for (const item of document.querySelectorAll(".reason.peek, .songs a.peek, .songs .row.peek")) {
      const r = item.getBoundingClientRect();
      if (x >= r.right - 70 && x <= r.right - 16 && y >= r.top - 33 && y <= r.top + 6) {
        meow(); burst?.(r.right - 44, r.top - 12);
        cats.add(item);
        if (cats.size === 5) {
          cats.add(null);                                 // only fire once
          setTimeout(() => { showNote("🐱 ❤️", E.cats || "I love you more than my life ❤️", 9000); heartStorm(40, 3500); }, 450);
        }
        return true;
      }
    }
    return false;
  }

  // 6: type "nerdy" (keyboard), or tap the signature three times
  let typed = "";
  const nerdy = () => { heartStorm(); showNote(E.nerdyTitle || "Yours Nerdy", E.nerdy || "You found it. Still yours, still nerdy ❤️", 7000); };
  addEventListener("keydown", (e) => {
    if (!e.key || e.key.length !== 1 || e.target.closest?.("input, textarea")) return;
    typed = (typed + e.key.toLowerCase()).slice(-5);
    if (typed === "nerdy") { typed = ""; nerdy(); }
  });
  const multiTap = (sel, n, fn) => {
    let count = 0, t = 0;
    document.addEventListener("click", (e) => {
      if (!e.target.closest(sel)) return;
      clearTimeout(t); count++;
      if (count >= n) { count = 0; fn(); } else t = setTimeout(() => { count = 0; }, 1500);
    });
  };
  multiTap("#signature, .note-sig, .sig", 3, nerdy);

  // 5: press and hold the heart (app.js fires the event and spins it)
  addEventListener("heart-egg", (e) => {
    const { x, y } = e.detail;
    for (let i = 0; i < 6; i++) setTimeout(() => burst?.(x + (Math.random() - 0.5) * 160, y + (Math.random() - 0.5) * 160), i * 120);
    heartStorm(60, 4000);
    showNote(E.heartTitle || "Every piece is you", E.heart || "Every piece of this heart is a day with you.", 6000);
  });

  // 7: tap "Day N days together" three times
  multiTap("#days, .total", 3, () => showNote(E.daysTitle || "Day 1", E.days || "Day 1 was National Girlfriend Day. Every day since has been better.", 8000));

  // 8 + 9: time-based surprises, shown once each per day
  const now = new Date(), key = now.toDateString();
  const once = (id) => { try { if (localStorage.getItem("egg-" + id) === key) return false; localStorage.setItem("egg-" + id, key); } catch { /* storage blocked: show anyway */ } return true; };
  const queue = [];
  if (now.getHours() < 5 && once("night")) {
    queue.push(() => { dispatchEvent(new Event("bgm-dim")); showNote("Good Night ရည်စားလေး 🌙", E.night || "It's late. Sleep well, I'm thinking of you.", 9000); });
  }
  if (cfg.startDate) {
    const s = new Date(cfg.startDate + "T00:00:00");
    const months = (now.getFullYear() - s.getFullYear()) * 12 + now.getMonth() - s.getMonth();
    if (now.getDate() === s.getDate() && months >= 1 && once("month")) {
      queue.push(() => { heartStorm(50, 4000); showNote(`Happy ${months}-month ❤️`, E.month || "Another month with you. Thank you."); });
    }
  }
  if (now.getMonth() === 1 && now.getDate() === 21 && once("confess")) {
    queue.push(() => showNote("21 February", E.confess || "The day I told you how I felt. Scratch the card to remember it.", 9000));
  }
  queue.forEach((fn, i) => setTimeout(fn, 1800 + i * 9500));
  window.__eggs = { showNote, heartStorm, meow, moonInfo };   // handy for testing
  return { showNote, heartStorm };
}
