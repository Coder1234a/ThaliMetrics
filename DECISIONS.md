# DECISIONS.md

Running log of calls made during the build. Add an entry whenever the team decides something that a teammate joining later would otherwise have to guess at or re-argue. Newest on top.

Format: `Date — Decision — Why — Who`

---

**2026-09-04** — Rebuilt logging around two explicit sessions ("taking food" / "leaving mess") instead of one combined form. — Matches how eating with refills actually works, and directly answers the team's request for a "sessions" concept supporting second helpings without a data-model rewrite later. — v2 rebuild

**2026-09-04** — Waste slider for each dish is scaled 0 → that dish's own takenUnits, not a generic 0–100%. — Explicit requirement: "ratios are being taken absolutely as per the bowl volume and not relative volume of serving taken." A generic percentage would silently misrepresent someone who took 3 bowls vs someone who took 1. — v2 rebuild

**2026-09-04** — Vessel (bowl/glass) UI renders its own coloured fill `<div>` instead of relying on the browser's native slider theming (`accent-color`). — Root-caused the "slider colour shows on phone, not desktop" bug report — native range-input theming isn't consistent across browsers/platforms. Taking full control of the fill rendering fixes it permanently rather than patching around it. — v2 rebuild

**2026-09-04** — Used explicit `top/left/right/bottom: 0` instead of the `inset: 0` CSS shorthand. — Found via an actual rendering test that `inset` collapsed the vessel shape to nothing in an older WebKit engine. Explicit longhand properties are supported far more broadly, at zero cost. — v2 rebuild

**2026-09-04** — Menu is admin-configurable (Mess Menu tab) instead of a hardcoded dish list, but the underlying nutrient library (`DISH_LIBRARY` in mockData.js) stays hardcoded — admin picks from it, doesn't type nutrient values by hand. — Meets "food items set by mess admin per menu plan" without also requiring the admin to be a nutrition data-entry clerk. — v2 rebuild

**2026-09-04** — Weekly Digest RDA targets use ICMR-NIN's adult (19–39y) bracket, not a separate youth/college-specific table. — Standard simplification most Indian nutrition tools make, since college students (18–22) sit at the edge of the adult bracket anyway. Flagged in README and research doc rather than presented as precise. — v2 rebuild

---

**2026-09-04** — Built the MVP as plain HTML/CSS/JS with no framework or build step. — Anyone on the team can open `index.html` directly, no npm install required to just look at it, and it's fastest to get a working demo up in a hackathon window. Revisit only if the team wants React-style component reuse and has time to spare. — Initial scaffold

**2026-09-04** — Nutrient data (protein/iron per dish) is hardcoded in `app/data/mockData.js` rather than pulled from any live source. — No real mess-menu API exists yet; hardcoded reference values are enough to demo the log → insight → action loop convincingly. — Initial scaffold

**2026-09-04** — Storage is `localStorage`, not a backend. — Zero setup time, works for a single-device demo. Swap point is clearly marked (`STORAGE_KEY` in `app/app.js`) for whoever adds a backend later. — Initial scaffold

**2026-09-04** — Doctor/dietitian referral text stays generic ("visit the campus health centre") and the app will never name specific doctors or supplements. — This isn't a scope cut for time — it's a real safety/liability line. Do not walk this back under demo-day pressure. — Initial scaffold

---

_Add new entries above this line as you make calls. Keep each one to 1–2 lines — this is a log, not a essay._
