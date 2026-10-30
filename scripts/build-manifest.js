// Scans public/photos and writes public/photos.json (sorted by filename).
// Runs automatically on Vercel via vercel.json "buildCommand".
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const PHOTOS = path.join(PUBLIC, "photos");
const OK = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"]);

function build() {
  fs.mkdirSync(PHOTOS, { recursive: true });
  const all = fs.readdirSync(PHOTOS).filter((f) => !f.startsWith("."));
  const skipped = all.filter((f) => !OK.has(path.extname(f).toLowerCase()));
  const files = all
    .filter((f) => OK.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // A filename containing YYYY-MM-DD (e.g. 2026-08-14.jpg) shows that date as the label.
  const manifest = files.map((f) => {
    const m = f.match(/(\d{4}-\d{2}-\d{2})/);
    return { src: "photos/" + encodeURIComponent(f), ...(m && { date: m[1] }) };
  });
  fs.writeFileSync(path.join(PUBLIC, "photos.json"), JSON.stringify(manifest, null, 2));

  console.log(`photos.json: ${files.length} photo(s)`);
  if (skipped.length) {
    console.warn(`Skipped (unsupported format, convert to jpg/png): ${skipped.join(", ")}`);
  }
}

module.exports = build;
if (require.main === module) build();
