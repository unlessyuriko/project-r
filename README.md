# Our 3 Months ❤️

A big red heart made of one piece per day. Tap a piece and that day's "love you" screenshot pops up. Find every piece for a surprise message.

## 1. Add your screenshots
Drop them into `public/photos/` (jpg, png, webp). Files are ordered by name, so name them `001.jpg`, `002.jpg`, ... and each becomes "Day 1", "Day 2", ... iPhone `.heic` is not supported by browsers: export as JPG first.

**Any number works.** The heart always has one piece per photo: 12 photos = 12 big pieces, 40 = 40 smaller ones. Pick your favourite days, you don't need all 90.

**Dates (optional).** Name a file with a date, e.g. `2026-08-14.jpg`, and the viewer shows "14 August 2026" (files are sorted by name, so they stay in date order). Without a date it shows "Memory 3".

Tip: large screenshots load slowly on mobile. Resize them to ~1000px wide (e.g. squoosh.app) before adding.

**Best on a phone:** 15 to 40 photos work well. With more, the pieces get small for fingertips. Resize screenshots to about 1000px wide first, so each opens fast on mobile data.

## 2. Personalise
Edit `public/config.js`: title, start date, final message, and an optional passcode gate.

## 3. Run locally
```bash
npm start
```
Open http://localhost:3000 (with no photos yet it shows a preview with 24 placeholder cards).

## 4. Publish: GitHub + Vercel
```bash
git init
git add .
git commit -m "Our 3 months"
gh repo create three-months-heart --private --source=. --push
```
Then on vercel.com: **Add New > Project > import the repo > Deploy**. No settings needed, `vercel.json` handles everything. Every `git push` redeploys.

## Privacy
These are personal chats. Keep the GitHub repo **private**. The Vercel URL is public to anyone who has the link; the passcode in `config.js` is a cute gate, not real security. Share the link only with her.
