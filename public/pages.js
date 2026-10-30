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
}
