# ThaliMetrics

**NutriHack · Nutrition Week 2026 · VIT Vellore**

One tap at the tray return tells you two things at once: what a student's diet is missing, and what the mess is over-cooking.

## What's in this repo

- **`/app`** — the working demo. Plain HTML/CSS/JS, no build step, no dependencies. Open `app/index.html` in a browser, or use the live GitHub Pages link.
- **`IDEA.md`** — the one-page source of truth for what we're building and why. Read this before adding a feature.
- **`DECISIONS.md`** — running log of calls we've made and why.
- **`docs/TEAM_WORKFLOW.md`** — the Claude prompts and habits we're using to build this fast.
- **`docs/ThaliMetrics_Brief.pdf`** — problem/solution/features brief for the pitch.
- **`docs/RESEARCH_REFERENCE.pdf`** — FSSAI Eat Right Campus + ICMR-NIN sourcing notes, so we can defend every number in the app if a judge asks.

## Running the demo

```bash
cd app
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just double-click `app/index.html` — no bundler, so it works standalone.

## What the demo currently does (v2)

1. **Log My Meal** — split into two sessions, matching how eating actually works:
   - **"I'm taking food"** — pick a dish, set a whole-unit count (stepper) plus a partial amount (a translucent fill-slider shaped like the vessel — bowl or glass — or a 4-quarter tap grid for roti), then "Add this to my meal." Taking a second helping later just means doing this again — it accumulates onto the same meal.
   - **"I'm leaving / logging waste"** — for each dish you took this meal, a slider scaled *exactly* to how much you took (not a generic 0–100%) lets you show how much you're leaving.
2. **Mess Menu** — admin tab where the mess sets which dishes are actually on today's menu; students only see and log what's picked here.
3. **Mess Dashboard** — Today / This Week / This Month toggle, per-dish waste % chart, a swap suggestion for the worst-waste dish (Vellore/Tamil Nadu-relevant, FSSAI Eat Right Campus-aligned), and a daily categorized breakdown.
4. **Weekly Digest** — every tracked nutrient shown (protein, iron, calcium, vitamin A, vitamin C, folate, B12, zinc, fiber — none skipped), targets computed from ICMR-NIN 2020 reference intakes, segmented by the student's own gender and body weight.

## Known simplifications (be upfront about these with judges)

- **No real food photos** — vessels (bowl/glass) are drawn as simple CSS/SVG-style shapes with a translucent fill, not photographs of actual mess dishes. Swapping in real photos is a v3 item, not a demo blocker.
- Nutrient values in `app/data/mockData.js` are standard Indian food-composition estimates for common mess portions, not lab-measured for VIT's specific kitchen.
- RDA targets use ICMR-NIN's adult (19–39y) bracket — see `docs/RESEARCH_REFERENCE.pdf` for exactly which secondary sources were cross-checked, and verify against the primary ICMR-NIN RDA-2020 report before treating any number as final.
- No backend — data lives in `localStorage` per browser/device, not shared across devices yet.
- Doctor/dietitian referral is intentionally generic ("visit the campus health centre") — the app never diagnoses or names supplements. This is a genuine safety line, not a scope-cut to walk back later.

## A real bug we found and fixed while building this

A **cross-browser rendering bug**: v1 relied on the browser's native `accent-color` styling for sliders, which rendered inconsistently between mobile and desktop Chrome — this is why the original bug report said "slider colour showing on phone, not on desktop." v2 fixes this properly by rendering our own coloured fill `<div>` instead of depending on native slider theming at all — the native `<input type="range">` is still there for real accessibility/interaction, just invisible, sitting on top.

Separately, while building v2 we hit a **CSS compatibility bug**: the `inset: 0` shorthand collapsed the bowl/glass shape to nothing in an older rendering engine we used for a visual test. Fixed by using explicit `top/left/right/bottom: 0` instead — safer across a wider range of browsers/webviews, which matters if judges are looking at this on unpredictable devices.

Both were caught by actually rendering the app and looking at it, not just eyeballing the code — worth doing the same before your demo.

## Team workflow

See `docs/TEAM_WORKFLOW.md` for the Claude Code slash-commands and prompting habits we're using during the build.
