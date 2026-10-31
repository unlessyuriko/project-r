// Quiet looping background music (e.g. a winter track). Source comes from LOVE_CONFIG.bgm:
//   { audio: "audio/winter.mp3" }  or  { youtube: "VIDEO_ID_OR_LINK" },  plus optional title and volume (0-1).
// Browsers block autoplay, so it starts on the first tap or swipe; the round button mutes it.
const ytId = (v) => { const m = String(v || "").match(/(?:v=|youtu\.be\/|embed\/|^)([\w-]{11})(?:[?&#]|$)/); return m ? m[1] : ""; };

export function initBgm(cfg) {
  const b = cfg.bgm;
  if (!b || !(b.audio || ytId(b.youtube))) return;
  const vol = Math.min(1, Math.max(0, b.volume ?? 0.35));
  let wanted = true, started = false, audio = null, yt = null, ytReady = false;
  try { wanted = localStorage.getItem("bgm-off") !== "1"; } catch (e) {}

  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "bgm-btn"; btn.setAttribute("aria-label", "Background music");
  btn.title = b.title || "Background music";
  btn.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 22V8l12-3v14" fill="none"/><circle cx="9" cy="22" r="3.2"/><circle cx="21" cy="19" r="3.2"/></svg><i></i>';
  document.body.appendChild(btn);
  const paint = (playing) => btn.classList.toggle("on", playing);
  paint(false);

  if (b.audio) {
    audio = new Audio(b.audio); audio.loop = true; audio.volume = vol; audio.preload = "none";
  } else {
    const host = document.createElement("div"); host.className = "yt-host"; host.appendChild(document.createElement("div"));
    document.body.appendChild(host);
    const mk = () => { yt = new YT.Player(host.firstChild, { height: "120", width: "120", videoId: ytId(b.youtube), playerVars: { playsinline: 1, controls: 0, loop: 1, playlist: ytId(b.youtube) }, events: { onReady: () => { ytReady = true; yt.setVolume(vol * 100); if (wanted && started) yt.playVideo(); }, onStateChange: (e) => paint(e.data === 1) } }); };
    if (window.YT && window.YT.Player) mk();
    else { const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { if (prev) prev(); mk(); }; const sc = document.createElement("script"); sc.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(sc); }
  }

  const play = () => { if (audio) audio.play().then(() => paint(true)).catch(() => {}); else if (ytReady) { yt.setVolume(vol * 100); yt.playVideo(); } };
  const pause = () => { if (audio) { audio.pause(); paint(false); } else if (ytReady) { yt.pauseVideo(); } };

  const first = () => { started = true; if (wanted) play(); };
  ["pointerdown", "touchend", "keydown"].forEach((ev) => addEventListener(ev, function once() { removeEventListener(ev, once); first(); }, { passive: true }));

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    started = true; wanted = !btn.classList.contains("on");
    try { localStorage.setItem("bgm-off", wanted ? "0" : "1"); } catch (er) {}
    wanted ? play() : pause();
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { if (audio) audio.pause(); else if (ytReady) yt.pauseVideo(); } else if (wanted && started) play(); });
}
