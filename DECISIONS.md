# DECISIONS.md

Running log of calls made during the build. Add an entry whenever the team decides something that a teammate joining later would otherwise have to guess at or re-argue. Newest on top.

Format: `Date — Decision — Why — Who`

---

**2026-09-04** — Menu editing moved entirely out of the student-facing Log Meal page into a new role-gated Admin Panel tab. — Directly requested: "only mess admins can edit menus and not students." The role switcher is client-side only (no real auth) since this is a demo, not a production access-control system — noted honestly rather than implied otherwise. — v5 rebuild

**2026-09-04** — "Popularity" for Warden Insights is measured as number of separate logged meals a dish appeared in, not total volume taken. — Volume conflates a dish being popular with just being served in large default portions. Meal-count is a cleaner read of "how often did students actually choose this." — v5 rebuild

**2026-09-04** — Least-picked swap suggestions check a dish-specific mapping first, falling back to the category-level one only if no specific entry exists. — Category-level advice ("try a local gravy") is vague when we already know the exact dish; dish-specific suggestions (e.g. upma → add vegetables for fiber/vitamin A) give a warden something immediately actionable. — v5 rebuild

**2026-09-04** — Roti control changed from a photo to a plain white circle. — Directly requested. Also incidentally reduces one image load. — v5 rebuild

**2026-09-04** — Reduced backdrop-filter blur from 14–16px to 7–10px and raised glass-card opacity from 0.55 to 0.82 sitewide. — Directly requested ("better UI... better for the eyes"), and blur was flagged earlier as a likely performance cost on the exact phones students would use at the tray return. Higher opacity also meaningfully improves text contrast against the card background. — v5 rebuild

**2026-09-04** — Found and fixed a CSS specificity bug while doing visual QA: `.admin-only-nav { display: none }` was being silently overridden by `.bottom-nav-btn { display: flex }` (equal specificity, later in the file), so the Admin icon showed in the bottom nav for students despite passing every DOM-based automated test. — jsdom checks class presence, not computed CSS cascade, so this class of bug is invisible to automated tests and only shows up in an actual rendered screenshot. Reinforces why the visual QA step stays mandatory, not optional, even when all automated tests pass. — v5 rebuild

---

**2026-09-04** — Fixed the waste-slider bug by making the vessel/roti controls' own `max` shrink dynamically to match remaining room, not just clamping the saved value after the fact. — The reported symptom (waste slider reaching "full" after only 3/4 was taken) was a real bug: the partial control's range max was hardcoded to 1 regardless of how much was actually taken. Clamping only the saved number left the slider itself still draggable past what was possible. — v4 rebuild

**2026-09-04** — Used the user's own AI-generated roti photo and provided logo instead of a web-scraped image. — The team supplied their own generated/owned assets, which resolves the copyright concern that ruled out real photos in earlier versions — this is now a real photo, not a CSS illustration. — v4 rebuild

**2026-09-04** — Applied the glassmorphic visual spec to the existing single-page architecture rather than splitting into the ~9 separate HTML files the spec described. — The spec explicitly allows adjusting structure "if a better architecture is appropriate." A late-stage rearchitecture into multiple files risked breaking working, tested functionality for a purely visual goal achievable within the current structure. — v4 rebuild

**2026-09-04** — Pitch deck built via pptxgenjs from scratch rather than editing the official NutriHack organizer template (Presentation_Resize.pptx). — That file is the event organizers' own rules/judging-criteria deck, not a per-team pitch template — editing it would misrepresent organizer content as team content. Built a fresh deck instead, following the agenda structure from the team's own template image, and pulled the real judging criteria from the organizer deck to align content to it. — v4 rebuild

**2026-09-04** — Pitch deck uses Calibri, not Poppins/Manrope used in the web app. — Per the pptx skill's font-safety guidance, Poppins isn't bundled with Office and would silently substitute on the judges' actual machines, making our visual QA unreliable. Calibri renders identically in QA and in real PowerPoint. — v4 rebuild

---

**2026-09-04** — Merged the Mess Menu admin tab into the Log Meal page as an inline collapsible panel, scoped to whichever meal slot is currently selected. — Requested directly; also just simpler information architecture — the menu you're editing and the menu you're logging against are always the same one, so there's no reason they lived on separate tabs. — v3 rebuild

**2026-09-04** — Roti, idli, and dosa all share the same round/quarter-tap illustrated control. — All three are round, quarterable items in practice, and building three separate illustrated controls for a hackathon demo wasn't worth the time versus one shared component. — v3 rebuild

**2026-09-04** — Did not pull a real photograph of a roti from the web for the quadrant control, despite that being the literal request. — Reproducing someone else's copyrighted food photography in an app going on public GitHub Pages is a real legal exposure, not just a style choice. Built an original illustrated version instead (radial-gradient texture + speckling) and flagged the substitution honestly in the README rather than silently reinterpreting the request. — v3 rebuild

**2026-09-04** — Waste-reason tagging (Too much served / Didn't like taste / Not hungry / Ran out of time) is optional, not required to finish logging a meal. — Forcing a reason on every dish would slow down the exact five-second interaction the whole app is built around. Optional data is still useful data. — v3 rebuild

**2026-09-04** — Catch-up tracking panel only covers protein and iron, not all 11 tracked nutrients. — These are the two headline deficiency nutrients cited throughout our own research (anaemia, protein RDA), and a panel trying to flag gaps across 11 nutrients before every meal would be unreadable. Full nutrient detail stays in the Weekly Digest. — v3 rebuild

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
