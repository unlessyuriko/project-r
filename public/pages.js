// Page-by-page scrolling: the heart is page one, every section under it is its own full-screen page.
// Pages snap into place and replay a cinematic entrance each time they come into view.
const $ = (s, r = document) => r.querySelector(s);

// wrap header + heart + progress into the first page (must run before the 3D scene looks up #stage)
export function wrapHero() {
  const main = $("main");
  if (!main || $(".hero")) return;
  const hero = document.createElement("div");
  hero.className = "page hero";
  const keep = [$("header", main), $("#stage"), $(".hint", main), $(".progress", main)].filter(Boolean);
  main.insertBefore(hero, keep[0]);
  keep.forEach((n) => hero.appendChild(n));
  const cue = document.createElement("div");
  cue.className = "swipe-cue";
  cue.innerHTML = '<span>Swipe up</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  hero.appendChild(cue);
}

export function initPages() {
  const ex = $("#extras");
  if (!ex) return;
  [...ex.children].forEach((s) => {                      // each section gets a full-screen page around it
    const pg = document.createElement("div");
    pg.className = "page";
    ex.insertBefore(pg, s);
    pg.appendChild(s);
  });
  const pages = [$(".hero"), ...ex.querySelectorAll(".page")].filter(Boolean);

  // progress dots
  const dots = document.createElement("nav");
  dots.className = "pg-dots";
  dots.setAttribute("aria-label", "Pages");
  pages.forEach((p, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", "Go to page " + (i + 1));
    b.addEventListener("click", () => p.scrollIntoView({ behavior: "smooth" }));
    dots.appendChild(b);
  });
  document.body.appendChild(dots);

  const vig = document.createElement("div");
  vig.className = "cine-vignette";
  vig.setAttribute("aria-hidden", "true");
  document.body.appendChild(vig);

  // the page crossing the middle band of the screen is the current one
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const i = pages.indexOf(e.target);
    e.target.classList.toggle("pg-in", e.isIntersecting);
    if (e.isIntersecting) {
      [...dots.children].forEach((d, k) => d.classList.toggle("on", k === i));
      document.body.classList.toggle("on-hero", i === 0);
    }
  }), { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
  pages.forEach((p) => io.observe(p));

  // never rest between pages: when scrolling stops, glide to the page that was swiped towards
  const tops = () => pages.map((p) => p.getBoundingClientRect().top + scrollY);
  let startY = null, timer = 0, target = null, rest = scrollY;   // rest: where the page last came to rest
  const settle = () => {
    const y = scrollY, vh = innerHeight, t = tops();
    if (startY == null && target == null) return;
    if (target != null) startY = y;                                                 // a glide was cut short: just pick the nearest page
    target = null;
    const dir = Math.sign(y - startY), moved = Math.abs(y - startY);
    startY = null; rest = y;
    let cur = 0; t.forEach((v, i) => { if (v <= y + 4) cur = i; });                // page whose top we have passed
    const bottom = (t[cur + 1] ?? document.documentElement.scrollHeight) - vh;      // lowest scroll position inside this page
    if (y > t[cur] + 4 && y < bottom - 4) return;                                   // reading inside a tall page: leave it
    if (Math.abs(y - t[cur]) < 3) return;                                          // already on a page
    let to = cur;
    if (dir < 0 && moved > 8) to = cur;                                             // swiped back: return to this page
    else if (y >= bottom - 4 && cur + 1 < t.length) to = cur + 1;
    else if (dir > 0 && moved > 8 && y > t[cur] + 4) to = Math.min(cur + 1, t.length - 1);   // swiped up: go to the next page
    else to = (y - t[cur] > ((t[cur + 1] ?? t[cur] + vh) - t[cur]) / 2 && cur + 1 < t.length) ? cur + 1 : cur;
    if (Math.abs(y - t[to]) < 3) return;
    target = rest = t[to];
    scrollTo({ top: target, behavior: "smooth" });
  };
  addEventListener("scroll", () => {
    if (target != null && Math.abs(scrollY - target) < 3) { target = null; startY = null; rest = scrollY; clearTimeout(timer); return; }   // arrived
    if (startY == null) startY = rest;
    clearTimeout(timer);
    timer = setTimeout(settle, target != null ? 450 : 110);   // while gliding, wait longer so slow frames do not retrigger
  }, { passive: true });
}
