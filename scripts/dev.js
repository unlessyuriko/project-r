// Tiny local static server: `npm start` then open http://localhost:3000
const http = require("http");
const fs = require("fs");
const path = require("path");
const build = require("./build-manifest");

const ROOT = path.join(__dirname, "..", "public");
const PORT = process.env.PORT || 3000;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    if (req.url.startsWith("/photos.json")) build(); // pick up new photos on refresh
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const file = path.normalize(path.join(ROOT, urlPath === "/" ? "index.html" : urlPath));
    if (!file.startsWith(ROOT)) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end("Not found");
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log(`Heart app on http://localhost:${PORT}`));
