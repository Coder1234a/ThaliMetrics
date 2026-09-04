# DECISIONS.md

Running log of calls made during the build. Add an entry whenever the team decides something that a teammate joining later would otherwise have to guess at or re-argue. Newest on top.

Format: `Date — Decision — Why — Who`

---

**2026-09-04** — Built the MVP as plain HTML/CSS/JS with no framework or build step. — Anyone on the team can open `index.html` directly, no npm install required to just look at it, and it's fastest to get a working demo up in a hackathon window. Revisit only if the team wants React-style component reuse and has time to spare. — Initial scaffold

**2026-09-04** — Nutrient data (protein/iron per dish) is hardcoded in `app/data/mockData.js` rather than pulled from any live source. — No real mess-menu API exists yet; hardcoded reference values are enough to demo the log → insight → action loop convincingly. — Initial scaffold

**2026-09-04** — Storage is `localStorage`, not a backend. — Zero setup time, works for a single-device demo. Swap point is clearly marked (`STORAGE_KEY` in `app/app.js`) for whoever adds a backend later. — Initial scaffold

**2026-09-04** — Doctor/dietitian referral text stays generic ("visit the campus health centre") and the app will never name specific doctors or supplements. — This isn't a scope cut for time — it's a real safety/liability line. Do not walk this back under demo-day pressure. — Initial scaffold

---

_Add new entries above this line as you make calls. Keep each one to 1–2 lines — this is a log, not a essay._
