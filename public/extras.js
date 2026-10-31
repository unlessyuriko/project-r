// Love-page sections under the heart (idea from yourlovepage.com): live together counter, scratch card,
// reasons, gift wheel, love test, songs and the moon on day one. Everything is read from LOVE_CONFIG.
import { INK, star4 } from "./heart.js";

const TAU = Math.PI * 2;
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const doodle = (id, cls = "") => `<svg class="doodle ${cls}" viewBox="0 0 32 32" aria-hidden="true"><use href="#${id}"/></svg>`;

function section(tag, title, sub) {
  const s = el("section", "panel sec");
  s.appendChild(el("p", "tag", `${doodle("d-star")}<span>${esc(tag)}</span>`));
  s.appendChild(el("h2", "sec-title", esc(title)));
  if (sub) s.appendChild(el("p", "sec-sub", esc(sub)));
  return s;
}

// ---------- together counter ----------
const addTo = (d, y, m) => { const x = new Date(d); x.setFullYear(x.getFullYear() + y, x.getMonth() + m, x.getDate()); return x; };
function together(cfg) {
  const start = new Date(cfg.startDate + "T00:00:00");
  const s = section("Time together", "Together", cfg.togetherNote || "");
  const grid = el("div", "counter");
  const cells = {};
  for (const k of ["years", "months", "days", "hours", "minutes", "seconds"]) {
    const c = el("div", "cell", `<b>00</b><span>${k}</span>`);
    cells[k] = c.firstChild;
    grid.appendChild(c);
  }
  const total = el("p", "total");
  const next = el("p", "next");
  s.append(grid, total, next);
  const pad = (n) => String(n).padStart(2, "0");
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastSec = -1;
  // every new second: the seconds cell beats and a little heart floats up from it
  const loveBeat = () => {
    if (calm) return;
    const cell = cells.seconds.parentElement;
    if (!s.closest(".page")?.classList.contains("pg-in")) return;
    cell.classList.remove("beat"); void cell.offsetWidth; cell.classList.add("beat");
    const h = el("span", "lv", doodle("d-heart"));
    h.style.setProperty("--dx", (Math.random() * 44 - 22).toFixed(0) + "px");
    h.style.setProperty("--r", (Math.random() * 40 - 20).toFixed(0) + "deg");
    h.style.setProperty("--sz", (14 + Math.random() * 10).toFixed(0) + "px");
    cell.appendChild(h);
    setTimeout(() => h.remove(), 1700);
  };
  function tick() {
    const now = new Date();
    if (now < start) { total.textContent = "Not started yet"; return; }
    let y = 0; while (addTo(start, y + 1, 0) <= now) y++;
    let mo = 0; while (addTo(start, y, mo + 1) <= now) mo++;
    const rem = now - addTo(start, y, mo);
    const vals = { years: y, months: mo, days: Math.floor(rem / 864e5), hours: Math.floor(rem / 36e5) % 24, minutes: Math.floor(rem / 6e4) % 60, seconds: Math.floor(rem / 1e3) % 60 };
    for (const k in vals) cells[k].textContent = pad(vals[k]);
    if (vals.seconds !== lastSec) { if (lastSec !== -1) loveBeat(); lastSec = vals.seconds; }
    const days = Math.floor((now - start) / 864e5) + 1;
    total.textContent = `${days.toLocaleString()} days together`;
    next.textContent = "Day 1 to 3 Months TOGETHER ❤️";
  }
  tick(); setInterval(tick, 1000);
  return s;
}

// ---------- scratch card ----------
function scratch(cfg, burst) {
  const c = cfg.scratch;
  const s = section(c.tag || "Scratch to reveal", c.title, c.hint ? "" : "");
  const card = el("div", "scratch");
  card.appendChild(el("div", "prize", `<p>${esc(c.text)}</p>`));
  const cv = el("canvas", "foil");
  card.appendChild(cv);
  s.appendChild(card);
  if (c.hint) s.appendChild(el("p", "sec-sub small", esc(c.hint)));
  let g, W = 0, H = 0, done = false, moves = 0;
  function paintFoil() {
    const r = card.getBoundingClientRect();
    if (!r.width || done) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.round(r.width); H = Math.round(r.height);
    cv.width = W * dpr; cv.height = H * dpr;
    g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, "#ff9ec0"); gr.addColorStop(0.5, "#ffd1e4"); gr.addColorStop(1, "#ff8fb4");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(255,255,255,.55)";
    for (let y = 14, row = 0; y < H; y += 30, row++) for (let x = 14 + (row % 2) * 15; x < W; x += 30) { star4(g, x, y, 5); g.fill(); }
    g.font = "900 20px 'Zen Maru Gothic', system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.lineWidth = 6; g.strokeStyle = INK; g.strokeText("SCRATCH HERE", W / 2, H / 2);
    g.fillStyle = "#fff"; g.fillText("SCRATCH HERE", W / 2, H / 2);
  }
  const check = () => {
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let clear = 0, n = 0;
    for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] < 40) clear++; }
    if (clear / n > 0.5) {
      done = true; card.classList.add("done");
      const r = cv.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2);
    }
  };
  let down = false, last = null;
  const pt = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const dig = (e) => {
    if (!down || done) return;
    const [x, y] = pt(e);
    g.globalCompositeOperation = "destination-out";
    g.lineCap = g.lineJoin = "round"; g.lineWidth = 46;
    g.beginPath(); g.moveTo(...(last || [x, y])); g.lineTo(x, y); g.stroke();
    last = [x, y];
    if (++moves % 8 === 0) check();
  };
  cv.addEventListener("pointerdown", (e) => { down = true; last = null; cv.setPointerCapture(e.pointerId); dig(e); });
  cv.addEventListener("pointermove", dig);
  const up = () => { down = false; last = null; if (g && !done) check(); };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  new ResizeObserver(paintFoil).observe(card);
  return s;
}

// ---------- reasons ----------
function reasons(cfg) {
  const r = cfg.reasons;
  const s = section(`${r.list.length} reasons`, r.title, r.sub);
  const list = el("ol", "reasons");
  r.list.forEach((t, i) => {
    const li = el("li", "reason", `<span class="n">${i + 1}</span><p>${esc(t)}</p>`);
    li.style.setProperty("--i", i);
    list.appendChild(li);
  });
  s.appendChild(list);
  new IntersectionObserver((es, ob) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); ob.unobserve(e.target); } }), { threshold: 0.3 })
    .observe(list);
  return s;
}

// ---------- gift wheel ----------
function wheel(cfg, burst) {
  const w = cfg.wheel, gifts = w.gifts, n = gifts.length;
  const s = section("Spin the wheel", w.title, w.sub);
  const box = el("div", "wheel-box");
  const cv = el("canvas", "wheel");
  const size = 320, dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = size * dpr; cv.height = size * dpr;
  const g = cv.getContext("2d"); g.scale(dpr, dpr);
  const seg = TAU / n, cx = size / 2, R = size / 2 - 6;
  const cols = ["#ffd1e4", "#fff3c9", "#ffb3cf", "#ffe6a8"];
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + i * seg;
    g.beginPath(); g.moveTo(cx, cx); g.arc(cx, cx, R, a0, a0 + seg); g.closePath();
    let col = cols[i % cols.length];
    if (i === n - 1 && i > 0 && col === cols[0]) col = cols[2];   // never the same colour next to the first slice
    g.fillStyle = col; g.fill(); g.lineWidth = 3.5; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke();
    g.save(); g.translate(cx, cx); g.rotate(a0 + seg / 2);
    g.fillStyle = INK; g.font = "900 13px 'Zen Maru Gothic', system-ui, sans-serif"; g.textAlign = "right"; g.textBaseline = "middle";
    let label = gifts[i]; if (label.length > 18) label = label.slice(0, 17) + "…";
    g.fillText(label, R - 14, 0); g.restore();
  }
  g.beginPath(); g.arc(cx, cx, R, 0, TAU); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  const hub = el("div", "hub", doodle("d-heart"));
  const ptr = el("div", "ptr");
  box.append(cv, hub, ptr);
  const btn = el("button", "btn", "Spin");
  btn.type = "button";
  const out = el("p", "bubble result", "");
  out.hidden = true;
  let rot = 0, busy = false;
  btn.onclick = () => {
    if (busy) return; busy = true; out.hidden = true;
    const t = Math.floor(Math.random() * n), jitter = (Math.random() - 0.5) * seg * 0.6;
    const center = (t + 0.5) * (360 / n);
    rot += 360 * 5 + ((360 - (rot % 360) - center + jitter + 720) % 360);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    cv.style.transition = reduced ? "transform .3s" : "transform 4.4s cubic-bezier(.12,.7,.1,1)";
    cv.style.transform = `rotate(${rot}deg)`;
    setTimeout(() => {
      busy = false; out.hidden = false; out.textContent = gifts[t];
      const r = cv.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2);
    }, reduced ? 350 : 4500);
  };
  s.append(box, btn, out);
  return s;
}

// ---------- love test ----------
function loveTest(cfg) {
  const t = cfg.loveTest;
  const s = section("Love test", t.title, t.sub);
  const row = el("div", "lt-row");
  const [nameA, nameB] = t.names || ["", ""];            // fixed names, not editable
  const you = el("div", "lt-in", esc(nameA));
  const them = el("div", "lt-in", esc(nameB));
  row.append(you, el("span", "lt-heart", doodle("d-heart")), them);
  const btn = el("button", "btn", "Calculate"); btn.type = "button";
  const meter = el("div", "bar"); const fill = el("span"); meter.appendChild(fill);
  const pct = el("p", "pct", ""); const quip = el("p", "sec-sub", "");
  const common = el("div", "lt-common"); common.hidden = true;
  meter.hidden = pct.hidden = quip.hidden = true;
  const tints = ["", " t2", " t3"];
  // a matched thing drops in as a chip, in random tilt and size
  const addChip = (txt) => {
    const c = el("span", "chip" + tints[Math.floor(Math.random() * 3)], esc(txt));
    c.style.setProperty("--r", (Math.random() * 12 - 6).toFixed(1) + "deg");
    c.style.setProperty("--dy", Math.round(Math.random() * 10 - 5) + "px");
    c.style.fontSize = (12 + Math.floor(Math.random() * 4)) + "px";
    common.appendChild(c);
  };
  let running = false;
  btn.onclick = () => {
    if (running) return; running = true; btn.disabled = true;
    const list = (t.common || []).slice().sort(() => Math.random() - 0.5);
    const per = 650, total = Math.max(2200, list.length * per + 900);
    common.replaceChildren(); common.hidden = !list.length;
    meter.hidden = pct.hidden = quip.hidden = false;
    fill.style.transition = "none"; fill.style.width = "0%"; void fill.offsetWidth;
    fill.style.transition = "width " + total + "ms linear"; fill.style.width = "100%";
    // while the bar fills, the test "thinks": it checks each shared thing and keeps the ones that match
    quip.textContent = "Reading your hearts...";
    list.forEach((txt, i) => {
      setTimeout(() => { quip.textContent = "Matching: " + txt + "..."; }, 400 + i * per);
      setTimeout(() => { addChip(txt); quip.textContent = "Match found: " + txt; }, 400 + i * per + per * 0.6);
    });
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / total);
      pct.textContent = Math.round(100 * p) + "%";
      if (p < 1) requestAnimationFrame(step);
      else { quip.textContent = t.result || "A perfect match."; running = false; btn.disabled = false; }
    };
    requestAnimationFrame(step);
  };
  s.append(row, btn, meter, pct, quip, common);
  return s;
}

// ---------- songs ----------
// Tap a song to play it. A song can have `youtube` (a video id or link) or `audio` (a file in public/songs/).
// One shared player, so tapping another song switches to it and tapping the playing one pauses it.
const ytId = (v) => { const m = String(v || "").match(/(?:v=|youtu\.be\/|embed\/|^)([\w-]{11})(?:[?&#]|$)/); return m ? m[1] : ""; };
let ytReady = null;
function loadYT() {
  if (ytReady) return ytReady;
  ytReady = new Promise((res) => {
    if (window.YT && window.YT.Player) return res(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); res(window.YT); };
    const sc = document.createElement("script"); sc.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(sc);
  });
  return ytReady;
}

function songs(cfg) {
  const so = cfg.songs;
  const s = section(`Side A · ${so.list.length} tracks`, so.title, so.sub);
  if (so.list.some((x) => x.audio || ytId(x.youtube))) s.appendChild(el("p", "sec-sub small tap-hint", "Tap the play button to listen"));
  const ul = el("ul", "songs");
  const host = el("div", "yt-host"); host.appendChild(el("div", "", ""));
  const audio = new Audio(); audio.preload = "none";
  let player = null, cur = -1;
  const rows = [];
  const setState = (i, state) => { window.dispatchEvent(new CustomEvent(state === "play" || state === "load" ? "song-play" : "song-stop")); paintRows(i, state); };
  const paintRows = (i, state) => rows.forEach((r, j) => { r.classList.toggle("playing", j === i && state === "play"); r.classList.toggle("loading", j === i && state === "load"); });
  const stop = () => { try { audio.pause(); } catch (e) {} try { player && player.pauseVideo(); } catch (e) {} };
  audio.onended = () => { setState(-1); cur = -1; };

  const play = async (i) => {
    const x = so.list[i];
    if (cur === i) { stop(); setState(-1); cur = -1; return; }          // tap the playing song again to pause
    stop(); cur = i; setState(i, "load");
    if (x.audio) {
      audio.src = x.audio; audio.play().then(() => setState(i, "play")).catch(() => { setState(-1); cur = -1; });
      return;
    }
    const id = ytId(x.youtube);
    if (!id) { setState(-1); cur = -1; return; }
    const YT = await loadYT();
    const start = () => { player.loadVideoById(id); player.playVideo(); };
    if (!player) {
      player = new YT.Player(host.firstChild, {
        height: "120", width: "120", videoId: id,
        playerVars: { playsinline: 1, controls: 0, rel: 0, autoplay: 1 },
        events: {
          onReady: () => { player.playVideo(); },
          onStateChange: (e) => {
            if (e.data === 1) setState(cur, "play");
            else if (e.data === 2) setState(-1);
            else if (e.data === 0) { setState(-1); cur = -1; }
          },
          onError: () => { setState(-1); const c = cur; cur = -1; if (c > -1) window.open("https://www.youtube.com/watch?v=" + ytId(so.list[c].youtube), "_blank", "noopener"); },
        },
      });
    } else start();
  };

  so.list.forEach((x, i) => {
    const playable = !!(x.audio || ytId(x.youtube));
    const body = `<span class="disc">${doodle("d-star")}</span><span class="meta"><b>${esc(x.title)}</b><i>${esc(x.artist)}</i></span><span class="eq" aria-hidden="true"><u></u><u></u><u></u></span>${playable ? '<span class="pbtn" aria-hidden="true"><svg class="ic-play" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg><svg class="ic-pause" viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg></span>' : `<span class="num">${i + 1}</span>`}`;
    const li = el("li", "", x.url && !playable ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${body}</a>` : `<div class="row${playable ? " play" : ""}"${playable ? ` role="button" tabindex="0" aria-label="Play ${esc(x.title)}"` : ""}>${body}</div>`);
    const row = li.firstChild; rows.push(row);
    if (playable) {
      row.addEventListener("click", () => play(i));
      row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(i); } });
    }
    ul.appendChild(li);
  });
  s.append(ul, host);
  return s;
}

// ---------- moon on day one ----------
function moon(cfg) {
  const m = cfg.moon;
  const d = new Date(cfg.startDate + "T12:00:00");
  const age = ((((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12) - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % 29.530588853) + 29.530588853) % 29.530588853;
  const phase = age / 29.530588853;
  const names = [[1.85, "New moon"], [5.54, "Waxing crescent"], [9.22, "First quarter"], [12.91, "Waxing gibbous"], [16.61, "Full moon"], [20.3, "Waning gibbous"], [23.99, "Last quarter"], [27.68, "Waning crescent"], [99, "New moon"]];
  const name = names.find(([lim]) => age < lim)[1];
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const s = section(date, m.title, m.sub ? `${m.sub} The moon was a ${name.toLowerCase()}.` : `${name}. Yes, I looked it up.`);
  const cv = el("canvas", "moon"); const S = 160, dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = cv.height = S * dpr; cv.style.width = cv.style.height = S + "px";
  const g = cv.getContext("2d"); g.scale(dpr, dpr);
  const c = S / 2, r = 58, k = Math.cos(phase * TAU), side = phase < 0.5 ? 1 : -1;
  const halo = g.createRadialGradient(c, c, r * 0.8, c, c, r * 1.35);
  halo.addColorStop(0, "rgba(255,243,201,.55)"); halo.addColorStop(1, "rgba(255,243,201,0)");
  g.fillStyle = halo; g.fillRect(0, 0, S, S);
  g.fillStyle = "#4a3a86"; g.beginPath(); g.arc(c, c, r, 0, TAU); g.fill();            // the dark side
  g.beginPath(); g.moveTo(c, c - r); g.arc(c, c, r, -Math.PI / 2, Math.PI / 2, side < 0);
  g.ellipse(c, c, Math.max(0.01, Math.abs(k)) * r, r, 0, Math.PI / 2, -Math.PI / 2, (side > 0) === (k > 0));
  g.closePath(); g.fillStyle = "#fff3c9"; g.fill();                                      // the lit side
  g.save(); g.clip();
  g.fillStyle = "#f2dca0"; [[-18, -14, 11], [14, 18, 15], [20, -22, 7], [-24, 20, 8]].forEach(([x, y, rr]) => { g.beginPath(); g.arc(c + x, c + y, rr, 0, TAU); g.fill(); });
  g.restore();
  g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.arc(c, c, r, 0, TAU); g.stroke();
  const info = el("p", "moon-name", `${esc(name)} · ${Math.round(((1 - Math.cos(phase * TAU)) / 2) * 100)}% lit`);
  s.append(cv, info);
  return s;
}

// ice flakes that turn into little hearts and float up inside the last card
const SNOW = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3v26M5 9.5l22 13M27 9.5l-22 13M12 5l4 3 4-3M12 27l4-3 4 3M4 14l5 0 1-4M28 18l-5 0-1 4M4 18l5 0 1 4M28 14l-5 0-1-4" fill="none"/></svg>';
const HEART = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27C6 19 3.5 14.5 3.5 10.8 3.5 7 6.3 4.6 9.6 4.6c2.6 0 4.7 1.5 6.4 4 1.7-2.5 3.8-4 6.4-4 3.3 0 6.1 2.4 6.1 6.2C28.5 14.5 26 19 16 27z"/></svg>';
function note(cfg) {
  const n = cfg.note;
  const s = el("section", "panel sec note");
  const fx = el("div", "note-fx"); fx.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 18; i++) {
    const f = el("span", "fl" + (i % 3 === 0 ? " red" : ""), `<b class="sn">${SNOW}</b><b class="hr">${HEART}</b>`);
    f.style.setProperty("--x", (4 + Math.random() * 90).toFixed(1) + "%");
    f.style.setProperty("--d", (-Math.random() * 9).toFixed(2) + "s");
    f.style.setProperty("--t", (7 + Math.random() * 5).toFixed(2) + "s");
    f.style.setProperty("--s", (14 + Math.random() * 14).toFixed(0) + "px");
    f.style.setProperty("--dx", (Math.random() * 40 - 20).toFixed(0) + "px");
    fx.appendChild(f);
  }
  s.append(fx, el("h2", "sec-title", esc(n.title)), el("p", "sec-sub", esc(n.text)), el("p", "made", `${doodle("d-heart")}<span>${esc(cfg.signature || "")}</span>`));
  return s;
}

export function initExtras(cfg, { burst }) {
  const root = document.getElementById("extras");
  if (!root) return;
  const add = (ok, make) => { try { if (ok) root.appendChild(make()); } catch (e) { console.error(e); } };
  add(cfg.startDate, () => together(cfg));
  add(cfg.scratch, () => scratch(cfg, burst));
  add(cfg.reasons?.list?.length, () => reasons(cfg));
  add(cfg.wheel?.gifts?.length > 1, () => wheel(cfg, burst));
  add(cfg.loveTest, () => loveTest(cfg));
  add(cfg.songs?.list?.length, () => songs(cfg));
  add(cfg.startDate && cfg.moon, () => moon(cfg));
  add(cfg.note, () => note(cfg));
  catPeek(root);
}

// each list item's cat peeks up at its own random moments, for random lengths of time
function catPeek(root) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rand = (a, b) => a + Math.random() * (b - a);
  root.querySelectorAll(".reason, .songs a, .songs .row").forEach((item) => {
    const loop = () => {
      setTimeout(() => {
        item.classList.add("peek");
        setTimeout(() => { item.classList.remove("peek"); loop(); }, rand(1800, 4200));
      }, rand(1200, 7500));
    };
    loop();
  });
}
